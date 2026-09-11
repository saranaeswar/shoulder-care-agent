import React, { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Send, RefreshCw, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { sendChatMessage, type ChatMessage } from '../lib/groqClient';
import { formatTime } from '../lib/utils';
import type { Message } from '../lib/types';

// Elderly-friendly quick questions in conversational Tanglish & English
const ELDER_QUICK_QUESTIONS: string[] = [
  'Enna exercise pannalam?',
  'Evlo naal aagum recover aaga?',
  'Doctor kitta poganuma?',
  'Vali romba irukku enna pannanum?',
  'Ice vaikkalama illa heat ah?'
];

const INITIAL_ELDER_MESSAGES: Message[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content: "வணக்கம்! Hello! I am your Shoulder Care Assistant 🩺.\n\nI am here to give you gentle, safe guidance for shoulder pain, stiffness, and recovery exercises. No login needed.\n\nHow is your shoulder feeling today? You can type below or tap any quick question button.",
    timestamp: formatTime()
  }
];

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_ELDER_MESSAGES);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isLargeFont, setIsLargeFont] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Stop speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text to Speech for elderly users who prefer listening
  const handleToggleSpeech = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for elderly comprehension
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isThinking) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: formatTime()
    };

    // Update conversation state with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsThinking(true);

    // Prepare history payload for groqClient
    const chatHistory: ChatMessage[] = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content
    }));

    try {
      // Call Groq API via groqClient.ts
      const responseText = await sendChatMessage(chatHistory);

      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: formatTime()
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "மன்னிக்கவும் (Sorry), we couldn't connect right now. Please check your connection and tap the question again.",
        timestamp: formatTime()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    handleSendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleResetSession = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setMessages(INITIAL_ELDER_MESSAGES);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto bg-slate-50 dark:bg-slate-900 border-x-2 border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden">
      {/* High Contrast Elder-Friendly Header */}
      <header className="bg-blue-800 text-white px-4 py-3.5 border-b-4 border-blue-900 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white text-blue-900 flex items-center justify-center font-black text-2xl shadow-md select-none">
            🩺
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Shoulder Care Q&amp;A
            </h1>
            <p className="text-sm sm:text-base font-semibold text-blue-100">
              Elderly Health Guide • முதியோர் நலன்
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Text Size Toggle Button */}
          <button
            type="button"
            onClick={() => setIsLargeFont(!isLargeFont)}
            className="px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-black text-white text-sm font-bold border-2 border-blue-400 active:scale-95 transition"
            title="Toggle larger font size for easier reading"
          >
            {isLargeFont ? 'Normal A' : 'Bigger A+'}
          </button>

          {/* New Chat / Reset Button */}
          <button
            type="button"
            onClick={handleResetSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-blue-900 hover:bg-blue-50 text-sm font-bold border-2 border-blue-900 shadow-sm active:scale-95 transition"
            title="Start fresh conversation (No login needed)"
          >
            <RefreshCw className="w-4 h-4 text-blue-900" />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* Safety Notice Bar */}
      <div className="bg-amber-100 dark:bg-amber-950/80 border-b-2 border-amber-300 dark:border-amber-700 px-4 py-1.5 flex items-center gap-2 text-amber-950 dark:text-amber-100 text-xs sm:text-sm font-medium">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
        <span>For severe pain or emergency, please visit a doctor or call 108 / 911 immediately.</span>
      </div>

      {/* Message List Area */}
      <main
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-100/90 dark:bg-slate-950"
        aria-live="polite"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              {/* Speaker Label */}
              <div className="text-xs sm:text-sm font-bold mb-1 px-1 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                {isUser ? (
                  <span>👤 You / நீங்கள்</span>
                ) : (
                  <span>🩺 Doctor AI / மருத்துவர்</span>
                )}
                <span className="text-[11px] font-normal text-slate-500">
                  {msg.timestamp}
                </span>
              </div>

              {/* Chat Bubble */}
              <div
                className={`max-w-[90%] sm:max-w-[82%] rounded-2xl p-4 sm:p-5 shadow-md ${
                  isUser
                    ? 'bg-blue-700 text-white rounded-tr-xs border-2 border-blue-800'
                    : 'bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 rounded-tl-xs border-2 border-slate-300 dark:border-slate-600'
                }`}
              >
                {/* Large readable body text (min 18px / text-lg) */}
                <p
                  className={`leading-relaxed whitespace-pre-wrap ${
                    isLargeFont ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                  }`}
                >
                  {msg.content}
                </p>

                {/* Read Aloud Button for Doctor AI Messages */}
                {!isUser && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleToggleSpeech(msg.id, msg.content)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700 font-bold text-sm transition active:scale-95"
                      aria-label="Listen to this message read aloud"
                    >
                      {speakingId === msg.id ? (
                        <>
                          <VolumeX className="w-5 h-5 text-red-600" />
                          <span>Stop Listening</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                          <span>🔊 Listen (கேளுங்கள்)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading / Thinking Indicator */}
        {isThinking && (
          <div className="flex flex-col items-start" aria-busy="true">
            <div className="text-xs sm:text-sm font-bold mb-1 px-1 text-slate-700 dark:text-slate-300">
              🩺 Doctor AI / மருத்துவர்
            </div>
            <div className="bg-white dark:bg-slate-800 border-2 border-blue-400 dark:border-blue-600 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-md flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-700 animate-ping shrink-0" />
              <div className="text-slate-900 dark:text-white font-bold text-lg sm:text-xl">
                Doctor AI is thinking...
                <span className="block text-sm sm:text-base font-normal text-slate-600 dark:text-slate-300 mt-0.5">
                  பதில் தயாராகிறது... தயவுசெய்து காத்திருக்கவும்
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </main>

      {/* Tappable Quick Question Buttons + Input Bar */}
      <footer className="bg-white dark:bg-slate-900 border-t-3 border-slate-300 dark:border-slate-700 p-3 sm:p-4 space-y-3 shrink-0">
        {/* Row of 4-5 Tappable Quick Questions */}
        <div>
          <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 px-1 flex items-center justify-between">
            <span>👇 Tap to ask quickly (விரைவான கேள்விகள்):</span>
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {ELDER_QUICK_QUESTIONS.map((question, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(question)}
                disabled={isThinking}
                className="shrink-0 px-4 py-2.5 min-h-[48px] rounded-xl bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-950 dark:text-blue-100 border-2 border-blue-600 dark:border-blue-400 font-bold text-base sm:text-lg shadow-xs active:scale-95 disabled:opacity-50 transition cursor-pointer"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Big Text Input & Big Send Button */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
            placeholder="Type your question here... (கேள்வியை தட்டச்சு செய்யவும்)"
            className="flex-1 min-h-[56px] text-lg sm:text-xl px-4 sm:px-5 rounded-2xl border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-950 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 transition font-medium"
            aria-label="Shoulder health question input"
          />

          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="min-h-[56px] px-5 sm:px-7 rounded-2xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-2 shadow-md transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <span>Send</span>
            <Send className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;
