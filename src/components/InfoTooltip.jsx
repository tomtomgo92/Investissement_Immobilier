import React from 'react';
import { Info } from 'lucide-react';

export default function InfoTooltip({ text }) {
    return (
        <div className="group relative cursor-help">
            <Info size={12} className="text-slate-600 hover:text-indigo-400 transition-colors" />
            <div className="absolute right-0 bottom-full mb-2 px-3 py-2 bg-slate-900 text-white text-[10px] w-48 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-white/10 shadow-xl z-50 text-center leading-relaxed">
                {text}
            </div>
        </div>
    );
}
