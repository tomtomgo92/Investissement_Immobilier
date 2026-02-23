import React from 'react';

export default function RepKPI({ label, value, highlight, sub }) {
    return (
        <div style={{
            backgroundColor: '#f8fafc',
            padding: '20px',
            borderRadius: '24px',
            border: highlight ? '2px solid #6366f1' : '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <p style={{
                fontSize: '9px',
                fontWeight: '900',
                textTransform: 'uppercase',
                color: '#94a3b8',
                letterSpacing: '0.05em',
                marginBottom: '4px'
            }}>{label}</p>
            <p style={{
                fontSize: '20px',
                fontWeight: '900',
                color: highlight ? '#6366f1' : '#0f172a',
                margin: '0'
            }}>{value}</p>
            {sub && <p style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>{sub}</p>}
        </div>
    );
}
