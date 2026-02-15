import React from 'react';
import InfoTooltip from './InfoTooltip';

export default function PremiumInput({ label, value, onChange, tooltip }) {
    return (
        <div className="flex flex-col gap-2 group/input">
            <div className="flex justify-between items-center">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none px-1 group-focus-within/input:text-indigo-400 transition-colors">
                    {label}
                </label>
                {tooltip && <InfoTooltip text={tooltip} />}
            </div>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-500/5 border border-white/5 rounded-xl p-3 text-sm font-black text-white focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 transition-all font-mono"
            />
        </div>
    );
}
