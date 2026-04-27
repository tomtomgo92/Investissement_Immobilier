import React from 'react';

export interface RepKPIProps {
    label: string;
    value: string | React.ReactNode;
    highlight?: boolean;
    sub?: string;
}

export default function RepKPI({ label, value, highlight, sub }: RepKPIProps) {
    return (
        <div style={{
            backgroundColor: highlight ? '#f5f3ff' : '#f8fafc',
            padding: '24px',
            borderRadius: '24px',
            border: highlight ? '1px solid #c7d2fe' : '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {highlight && (
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#818cf8',
                    opacity: 0.1,
                    borderRadius: '50%',
                    filter: 'blur(10px)'
                }} />
            )}
            <p style={{
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                color: highlight ? '#6366f1' : '#64748b',
                letterSpacing: '0.1em',
                marginBottom: '6px'
            }}>{label}</p>
            <p style={{
                fontSize: '24px',
                fontWeight: '800',
                color: highlight ? '#4f46e5' : '#0f172a',
                letterSpacing: '-0.02em',
                margin: '0'
            }}>{value}</p>
            {sub && <p style={{ fontSize: '10px', fontWeight: '500', color: highlight ? '#818cf8' : '#94a3b8', marginTop: '6px' }}>{sub}</p>}
        </div>
    );
}
