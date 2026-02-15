import React from 'react';

export default function HeroKPI({ label, value, color, icon, highlight = false, sub }) {
    const textColor = {
        emerald: 'text-success',
        indigo: 'text-accent',
        slate: 'text-slate-500',
        rose: 'text-danger'
    };
    const iconBg = {
        emerald: 'bg-success/10',
        indigo: 'bg-accent/10',
        slate: 'bg-slate-100 dark:bg-slate-800',
        rose: 'bg-danger/10'
    };

    return (
        <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-center relative shadow-sm transition-all hover:shadow-md ${highlight ? 'ring-1 ring-success/30' : ''}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
                <div className={`p-1.5 rounded-lg ${iconBg[color]} ${textColor[color]}`}>
                    {React.cloneElement(icon, { size: 14 })}
                </div>
            </div>
            <div className="flex flex-col">
                <p className={`text-2xl font-bold tracking-tight ${textColor[color]}`}>{value}</p>
                {sub && <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tight">{sub}</p>}
            </div>
        </div>
    );
}
