import React from 'react';
import RepKPI from './RepKPI';
import RepRow from './RepRow';
import { formatE } from '../utils/formatters';

interface PdfReportProps {
  activeSim: Record<string, any>;
  calculations: Record<string, any>;
  ref?: React.Ref<HTMLDivElement>;
}

export default function PdfReport({ activeSim, calculations, ref }: PdfReportProps) {
  return (
    <div ref={ref} style={{ width: '210mm', padding: '15mm', backgroundColor: '#ffffff', color: '#0f172a', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid #1e293b', paddingBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', textTransform: 'uppercase', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Bilan Immobilier</h1>
          <p style={{ fontSize: '20px', fontWeight: '600', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{activeSim.name}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#cbd5e1', letterSpacing: '0.1em', margin: 0 }}>Rapport émis le</p>
          <p style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <RepKPI label="Rendement Net" value={`${calculations.rNet.toFixed(2)}%`} />
        <RepKPI label="Cashflow Net-Net" value={formatE(calculations.cashflowNetNet)} highlight sub={`Après Impôts (TMI ${activeSim.data.tmi}%)`} />
        <RepKPI label="Mensualité" value={formatE(calculations.mCredit)} />
        <RepKPI label="Gains (20 ans)" value={formatE(calculations.beneficeAn * 20)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <section style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.1em', borderBottom: '1px solid #e2e8f0', marginBottom: '16px', paddingBottom: '8px' }}>Financement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <RepRow label="Investissement Total" value={formatE(calculations.investTotal)} />
            <RepRow label="Apport Personnel" value={formatE(activeSim.data.apport)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '18px', borderTop: '2px solid #0f172a', paddingTop: '12px', marginTop: '12px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', alignSelf: 'flex-end' }}>CRÉDIT BANCAIRE</span>
              <span>{formatE(calculations.loanAmount)}</span>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.1em', borderBottom: '1px solid #e2e8f0', marginBottom: '16px', paddingBottom: '8px' }}>Fiscalité & Cashflow</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <RepRow label="Cashflow Brut / mois" value={formatE(calculations.beneficeAn / 12 + calculations.totalChargesAnnuelles / 12)} />
            <RepRow label="Impôt Estimé / mois" value={formatE(calculations.impots / 12)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '18px', borderTop: '2px solid #10b981', paddingTop: '12px', marginTop: '12px', color: '#10b981' }}>
              <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', alignSelf: 'flex-end' }}>NET-NET / MOIS</span>
              <span>{formatE(calculations.cashflowNetNet)}</span>
            </div>
          </div>
        </section>
      </div>

      <div style={{ marginTop: '32px', padding: '40px', backgroundColor: '#0f172a', borderRadius: '32px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.02em' }}>Bilan de l'opération</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, fontWeight: '500' }}>
            Après fiscalité (TMI {activeSim.data.tmi}%), le projet génère 
            <span style={{ fontWeight: '700', color: '#ffffff', marginLeft: '6px', marginRight: '6px', padding: '4px 8px', backgroundColor: '#1e293b', borderRadius: '8px' }}>{formatE(calculations.cashflowNetNet)}</span> 
            par mois.
          </p>
        </div>
      </div>
    </div>
  );
}
