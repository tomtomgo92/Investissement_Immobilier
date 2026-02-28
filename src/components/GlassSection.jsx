import React from 'react';

export default function DashboardSection({ title, icon, children, rightElement }) {
    return (
        <section className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-none flex flex-col min-h-0 transition-all hover:shadow-2xl hover:shadow-primary/5 group">
            <div className="flex items-center justify-between mb-6 border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
                <div className="flex items-center gap-3">
                    {icon && <span className="text-primary dark:text-slate-400 group-hover:scale-110 transition-transform duration-300">{icon}</span>}
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-white transition-colors">{title}</h2>
                </div>
                {rightElement}
            </div>
            <div className="space-y-5 flex-1 contents-fade-in">
                {children}
            </div>
        </section>
    );
}
