import React, { useId } from 'react';
import InfoTooltip from './InfoTooltip';
import { cn } from '../lib/utils';

interface PremiumInputProps {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    tooltip?: string;
    suffix?: string;
}

export default function PremiumInput({ 
    label, 
    value, 
    onChange, 
    tooltip, 
    suffix = "€" 
}: PremiumInputProps) {
    const id = useId();
    const inputId = `${id}-input`;
    const tooltipId = `${id}-tooltip`;

    return (
        <div className="flex flex-col gap-1.5 group/input">
            <div className="flex justify-between items-center px-1">
                <label 
                    htmlFor={inputId} 
                    className="text-xs font-semibold text-slate-500 tracking-wide leading-none transition-colors group-focus-within/input:text-slate-700 dark:group-focus-within/input:text-slate-300"
                >
                    {label}
                </label>
                {tooltip && <InfoTooltip text={tooltip} id={tooltipId} />}
            </div>
            <div className="relative flex items-center">
                <input
                    id={inputId}
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    aria-describedby={tooltip ? tooltipId : undefined}
                    className={cn(
                        "w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700",
                        "rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white",
                        "transition-all duration-200 outline-none shadow-sm",
                        "focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800",
                        "hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                />
                {suffix && (
                    <span
                        className="absolute right-4 text-slate-400 text-sm font-medium pointer-events-none select-none transition-opacity group-focus-within/input:text-indigo-400"
                        aria-hidden="true"
                    >
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}
