import React from 'react';
import InfoTooltip from './InfoTooltip';

export default function PremiumInput({ label, value, onChange, tooltip, suffix = "€" }) {
    return (
        <div className="flex flex-col gap-1.5 group/input">
            <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-tight leading-none px-1">
                    {label}
                </label>
                {tooltip && <InfoTooltip text={tooltip} />}
            </div>
            <div className="relative">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none"
                />
                {suffix && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}
