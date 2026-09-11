import React from 'react';
import { Activity, ShieldCheck, PhoneCall } from 'lucide-react';

interface HeaderProps {
  onEmergencyClick?: () => void;
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-xs">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                ShoulderCare AI
              </h1>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <ShieldCheck className="w-3 h-3" /> PT Guide
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recovery, mobility & symptom tracker
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Reset conversation"
            >
              Reset
            </button>
          )}
          <a
            href="tel:911"
            className="flex items-center justify-center w-8 h-8 rounded-full text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            title="Emergency info"
          >
            <PhoneCall className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
