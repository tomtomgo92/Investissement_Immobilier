import React from 'react';

export default function GlassSection({ title, icon, children }) {
    return (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 shadow-xl transition-all group shrink-0 w-full">
            <h3 className="text-xs font-black text-white border-b border-white/5 pb-4 mb-5 flex items-center justify-between uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">
                <div className="flex items-center gap-3">
                    {icon}
                    {title}
                </div>
            </h3>
            <div className="space-y-4">{children}</div>
        </div>
    );
}
