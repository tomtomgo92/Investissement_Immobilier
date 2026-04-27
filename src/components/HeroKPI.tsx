import React from 'react';
import { cn } from '../lib/utils';

export interface HeroKPIProps {
    label: string;
    value: string | React.ReactNode;
    color?: 'emerald' | 'indigo' | 'slate' | 'rose';
    icon?: React.ReactElement<{ className?: string, size?: number, strokeWidth?: number }>;
    highlight?: boolean;
    sub?: string;
}

export default function HeroKPI({ 
    label, 
    value, 
    color = 'slate', 
    icon, 
    highlight = false, 
    sub 
}: HeroKPIProps) {
    
    // Style mappings
    const colorStyles = {
        emerald: {
            text: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/10',
            border: 'border-emerald-100 dark:border-emerald-900/30',
            highlight: 'ring-1 ring-emerald-500/20'
        },
        indigo: {
            text: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-900/10',
            border: 'border-indigo-100 dark:border-indigo-900/30',
            highlight: 'ring-1 ring-indigo-500/20'
        },
        rose: {
            text: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-900/10',
            border: 'border-rose-100 dark:border-rose-900/30',
            highlight: 'ring-1 ring-rose-500/20'
        },
        slate: {
            text: 'text-slate-600 dark:text-slate-400',
            bg: 'bg-slate-50 dark:bg-slate-900/10',
            border: 'border-slate-100 dark:border-slate-800',
            highlight: 'ring-1 ring-slate-500/20'
        }
    };

    const style = colorStyles[color];

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
            "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md",
            "hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:hover:shadow-none",
            style.border,
            highlight ? style.highlight : ""
        )}>
            {/* Subtle background gradient for highlight */}
            {highlight && (
                <div className={cn(
                    "absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-30",
                    color === 'emerald' ? 'bg-emerald-500' : 
                    color === 'rose' ? 'bg-rose-500' : 
                    color === 'indigo' ? 'bg-indigo-500' : 'bg-slate-500'
                )} />
            )}

            <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                    {label}
                </span>
                {icon && (
                    <div className={cn(
                        "p-1.5 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3",
                        style.bg,
                        style.text
                    )}>
                        {React.cloneElement(icon, { size: 14, strokeWidth: 2.5 })}
                    </div>
                )}
            </div>
            
            <div className="flex flex-col relative z-10">
                <p className={cn(
                    "text-2xl font-semibold tracking-tight transition-colors",
                    style.text
                )}>
                    {value}
                </p>
                {sub && (
                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1.5 uppercase tracking-wider">
                        {sub}
                    </p>
                )}
            </div>
        </div>
    );
}
