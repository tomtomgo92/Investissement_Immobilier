import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function DimensionToggle({ active, onClick, dot, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[10px] font-bold uppercase tracking-tight ${active
                    ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-primary dark:text-white shadow-sm'
                    : 'border-transparent text-slate-400 opacity-60 hover:opacity-100'
                }`}
        >
            <span className={`w-2 h-2 rounded-full ${dot} ${!active ? 'grayscale' : ''}`} />
            <span>{label}</span>
            {active ? <Eye size={12} className="opacity-40" /> : <EyeOff size={12} className="opacity-20" />}
        </button>
    );
}
