import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '../lib/utils';

export interface InfoTooltipProps {
  text: string;
  id?: string;
  className?: string;
}

export default function InfoTooltip({ text, id, className }: InfoTooltipProps) {
  return (
    <div className={cn("group relative cursor-help inline-flex items-center justify-center", className)}>
      <Info size={14} strokeWidth={2.5} className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors" />
      <div
        id={id}
        role="tooltip"
        className={cn(
          "absolute right-0 bottom-full mb-2 px-3 py-2 w-48 z-50 pointer-events-none",
          "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-medium text-center leading-relaxed",
          "rounded-xl shadow-xl border border-white/10 dark:border-slate-900/10",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        )}
      >
        {text}
        {/* Subtle arrow */}
        <div className="absolute -bottom-1 right-2 w-2 h-2 rotate-45 bg-slate-800 dark:bg-slate-100" />
      </div>
    </div>
  );
}
