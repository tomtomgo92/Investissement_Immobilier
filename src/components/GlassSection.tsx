import React, { ReactNode } from 'react';
import { cn } from '../lib/utils';

export interface DashboardSectionProps {
    title: string;
    icon?: ReactNode;
    children: ReactNode;
    rightElement?: ReactNode;
    className?: string;
}

export default function DashboardSection({ title, icon, children, rightElement, className }: DashboardSectionProps) {
    return (
        <section className={cn(
            "bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl p-6 rounded-2xl border border-white/50 dark:border-white/[0.05]",
            "shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col min-h-0 transition-all duration-300",
            "hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100/50 dark:hover:border-indigo-500/10 group",
            className
        )}>
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-white/[0.05] pb-4">
                <div className="flex items-center gap-3">
                    {icon && <span className="text-slate-400 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">{icon}</span>}
                    <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">{title}</h2>
                </div>
                {rightElement}
            </div>
            <div className="space-y-6 flex-1 contents-fade-in">
                {children}
            </div>
        </section>
    );
}
