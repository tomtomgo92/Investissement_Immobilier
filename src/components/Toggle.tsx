import React from 'react';
import { cn } from '../lib/utils';

export interface ToggleProps {
    active: boolean;
    onToggle: () => void;
    ariaLabel?: string;
    className?: string;
}

export default function Toggle({ active, onToggle, ariaLabel, className }: ToggleProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={active}
            aria-label={ariaLabel}
            onClick={onToggle}
            className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
                active ? "bg-indigo-600 dark:bg-indigo-500" : "bg-slate-200 dark:bg-white/[0.08]",
                className
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    active ? "translate-x-4.5" : "translate-x-0.5"
                )}
                style={{ transform: active ? 'translateX(18px)' : 'translateX(2px)' }}
            />
        </button>
    );
}
