import React from 'react';

export interface RepRowProps {
    label: string;
    value: string | React.ReactNode;
    isBold?: boolean;
}

export default function RepRow({ label, value, isBold }: RepRowProps) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '6px 0',
            borderBottom: '1px dashed #e2e8f0'
        }}>
            <span style={{
                color: '#64748b',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: isBold ? '700' : '500'
            }}>{label}</span>
            <span style={{
                color: '#0f172a',
                fontSize: '12px',
                fontWeight: '700'
            }}>{value}</span>
        </div>
    );
}
