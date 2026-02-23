import React from 'react';

export default function DashboardSection({ title, icon, children, rightElement }) {
    return (
        <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                    {icon && <span className="text-primary dark:text-slate-400">{icon}</span>}
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary dark:text-white">{title}</h2>
                </div>
                {rightElement}
            </div>
            <div className="space-y-4 flex-1">
                {children}
            </div>
        </section>
    );
}
