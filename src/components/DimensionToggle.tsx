import React from 'react';
import { cn } from '../lib/utils';

interface DimensionToggleProps {
    active: boolean;
    onClick: () => void;
    dot: string;
    label: string;
}

export default function DimensionToggle({ active, onClick, dot, label }: DimensionToggleProps) {
    return (
        <button
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200",
                "text-xs font-medium tracking-wide", // Jobs: Better typography, readable size
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900",
                "active:scale-95", // Jobs: Micro-interactions for tactile feel
                active 
                    ? "bg-white dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white shadow-sm" 
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            )}
        >
            <span className={cn(
                "w-2 h-2 rounded-full transition-all duration-200", 
                dot, 
                !active && "grayscale opacity-50"
            )} />
            <span>{label}</span>
        </button>
    );
}
