import React from 'react';

export default function RepRow({ label, value }) {
    return (
        <div className="flex justify-between items-end border-b border-slate-100 pb-1.5 leading-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
            <span className="font-black text-slate-900">{value}</span>
        </div>
    );
}
