import React from 'react';
import { Info } from 'lucide-react';

export default function InfoTooltip({ text, id }) {
  return (
    <div className="group relative flex items-center">
      <button
        type="button"
        aria-label="Plus d'informations"
        aria-describedby={id}
        className="cursor-help rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800"
      >
        <Info size={12} className="text-slate-600 hover:text-indigo-400 transition-colors" />
      </button>
      <div
        id={id}
        role="tooltip"
        className="absolute right-0 bottom-full mb-2 px-3 py-2 bg-slate-900 text-white text-[10px] w-48 rounded-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-opacity border border-white/10 shadow-xl z-50 text-center leading-relaxed"
      >
        {text}
      </div>
    </div>
  );
}
