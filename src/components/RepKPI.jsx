import React from 'react';

export default function RepKPI({ label, value, highlight }) {
    return (
        <div className={`p-8 bg-slate-50 rounded-[2.5rem] ${highlight ? 'border-2 border-indigo-600 ring-8 ring-indigo-50' : ''}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        </div>
    );
}
