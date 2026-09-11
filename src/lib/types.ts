export type MessageRole = 'assistant' | 'user' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  suggestedActions?: string[];
}
