import React from 'react';

export default function HeroKPI({ label, value, color, icon, highlight = false, sub }) {
    const c = {
        emerald: 'text-emerald-400',
        indigo: 'text-indigo-400',
        slate: 'text-slate-400',
        rose: 'text-rose-400'
    };
    const bg = {
        emerald: 'bg-emerald-500/10',
        indigo: 'bg-indigo-500/10',
        slate: 'bg-slate-500/10',
        rose: 'bg-rose-500/10'
    };

    return (
        <div className={`bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-4 sm:p-6 flex flex-col justify-center relative shadow-xl hover:-translate-y-1 transition-all duration-500 group overflow-hidden ${highlight ? 'ring-2 ring-emerald-500/30' : ''}`}>
            <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${bg[color]} ${c[color]}`}>
                        {React.cloneElement(icon, { size: 14 })}
                    </div>
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest truncate">{label}</p>
                </div>
                <p className={`text-2xl sm:text-3xl font-black tracking-tighter truncate ${c[color]}`}>{value}</p>
                {sub && <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic truncate">{sub}</p>}
            </div>
        </div>
    );
}
