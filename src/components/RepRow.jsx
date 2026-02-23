import React from 'react';

export default function RepRow({ label, value, isBold }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '4px 0',
            borderBottom: '1px solid #f1f5f9'
        }}>
            <span style={{
                color: '#64748b',
                fontSize: '11px',
                fontWeight: isBold ? '700' : '400'
            }}>{label}</span>
            <span style={{
                color: '#0f172a',
                fontSize: '11px',
                fontWeight: '700'
            }}>{value}</span>
        </div>
    );
}
