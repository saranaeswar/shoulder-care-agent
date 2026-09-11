import React, { useRef, useEffect } from 'react';
import { Bot, User, Clock } from 'lucide-react';
import type { Message } from '../lib/types';

interface MessageListProps {
  messages: Message[];
  onSelectAction?: (action: string) => void;
  isTyping?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onSelectAction,
  isTyping
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl w-full mx-auto">
      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={msg.id}
            className={`flex gap-2.5 items-end ${
              isUser ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs shadow-xs ${
                isUser
                  ? 'bg-slate-700 text-white'
                  : 'bg-teal-600 text-white'
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-xs ${
                isUser
                  ? 'bg-teal-600 text-white rounded-br-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>

              {/* Action Chips */}
              {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectAction?.(action)}
                      className="text-xs text-left px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200/60 dark:border-teal-700 transition cursor-pointer"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div
                className={`mt-1 flex items-center gap-1 text-[10px] ${
                  isUser ? 'text-teal-100 justify-end' : 'text-slate-400 justify-start'
                }`}
              >
                <Clock className="w-2.5 h-2.5" />
                <span>{msg.timestamp}</span>
              </div>
            </div>
          </div>
        );
      })}

      {isTyping && (
        <div className="flex gap-2.5 items-end">
          <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.15s]" />
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
