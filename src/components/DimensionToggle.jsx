import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function DimensionToggle({ active, onClick, dot, label }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border flex items-center gap-2 transition-all ${active ? 'bg-white/10 border-indigo-500 text-white' : 'border-white/5 text-slate-500 opacity-50 hover:opacity-100 hover:bg-white/5'
                }`}
        >
            <div className={`w-2 h-2 rounded-full ${dot} ${!active ? 'grayscale' : ''}`} />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest hidden sm:inline">{label}</span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest sm:hidden">{label.slice(0, 4)}</span>
            {active ? <Eye size={12} className="ml-1 opacity-50" /> : <EyeOff size={12} className="ml-1 opacity-20" />}
        </button>
    );
}
