import React from 'react';

export default function Toggle({ active, onToggle, ariaLabel }) {
    return (
        <button
            role="switch"
            aria-checked={active}
            aria-label={ariaLabel}
            onClick={onToggle}
            className={`w-10 h-5 rounded-full transition-all relative focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 ${active ? 'bg-indigo-600' : 'bg-slate-700'}`}
        >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-all ${active ? 'left-6' : 'left-1'}`} />
        </button>
    );
}
