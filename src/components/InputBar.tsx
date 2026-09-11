import React, { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface InputBarProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  suggestions?: string[];
  onSelectSuggestion?: (suggestion: string) => void;
}

export const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  disabled,
  suggestions = [],
  onSelectSuggestion
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 px-3 shadow-lg">
      <div className="max-w-xl mx-auto space-y-2">
        {/* Quick Suggestion Pills */}
        {suggestions.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1 pl-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Suggestions:
            </span>
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSuggestion?.(suggestion)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition active:scale-95"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input & Send Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Describe your shoulder symptoms or ask a question..."
            className="flex-1 bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-teal-500 transition shadow-inner"
          />

          <button
            type="submit"
            disabled={!input.trim() || disabled}
            aria-label="Send message"
            className="w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 shadow-sm transition active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
