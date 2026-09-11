import { SYSTEM_PROMPT } from '../data/systemPrompt';

export const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const GROQ_MODEL = 'llama-3.3-70b-versatile';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | string;
  content: string;
  [key: string]: unknown;
}

/**
 * Sends a chat history to the Groq Cloud completions API using the llama-3.3-70b-versatile model.
 *
 * @param historyOrPrompt Chat history array or custom system prompt string
 * @param promptOrHistory Optional custom system prompt string or chat history array
 * @returns Assistant reply as a string or a friendly fallback message on error
 */
export async function sendChatMessage(
  historyOrPrompt: ChatMessage[] | string,
  promptOrHistory?: ChatMessage[] | string
): Promise<string> {
  // Determine effective system prompt and chat history based on parameter types
  let systemPrompt = SYSTEM_PROMPT;
  let chatHistory: ChatMessage[] = [];

  if (typeof historyOrPrompt === 'string') {
    systemPrompt = historyOrPrompt;
    if (Array.isArray(promptOrHistory)) {
      chatHistory = promptOrHistory;
    }
  } else if (Array.isArray(historyOrPrompt)) {
    chatHistory = historyOrPrompt;
    if (typeof promptOrHistory === 'string' && promptOrHistory.trim().length > 0) {
      systemPrompt = promptOrHistory;
    }
  }

  // Retrieve Groq API key from Vite environment variable VITE_GROQ_API_KEY
  const nodeEnv = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })?.process?.env;
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || nodeEnv?.VITE_GROQ_API_KEY || '';

  if (!apiKey || !apiKey.trim() || apiKey === 'your_groq_api_key_here') {
    return "I'm currently unable to connect to the AI service because the Groq API key (VITE_GROQ_API_KEY) is not configured. Please add your free Groq API key to the .env file to enable live responses.";
  }

  // Format messages payload with system prompt first, followed by conversation history
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory
      .filter((msg) => msg && typeof msg.content === 'string')
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
        content: msg.content
      }))
  ];

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return "The Groq AI service is currently experiencing high demand and has reached its rate limit. Please wait a few moments and try your question again.";
      }
      if (response.status === 401 || response.status === 403) {
        return "Authentication error: The provided Groq API key appears to be invalid or unauthorized. Please verify your VITE_GROQ_API_KEY in .env.";
      }
      if (response.status >= 500) {
        return `The Groq service encountered a temporary server error (HTTP ${response.status}). Please try again in a moment.`;
      }
      return `The AI service was unable to process the request (HTTP ${response.status}). Please try again.`;
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (typeof reply === 'string' && reply.trim().length > 0) {
      return reply.trim();
    }

    return "I didn't receive a response from the assistant. Please try rephrasing your message.";
  } catch {
    return "Network error: Unable to connect to the Groq service. Please check your internet connection and try again.";
  }
}

// Aliases for diverse naming conventions
export const callGroq = sendChatMessage;
export const sendMessageToGroq = sendChatMessage;
export const groqClient = sendChatMessage;

export default sendChatMessage;
