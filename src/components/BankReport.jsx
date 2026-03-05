import React, { forwardRef } from 'react';
import RepKPI from './RepKPI';
import RepRow from './RepRow';
import { formatE } from '../utils/formatters';

const BankReport = forwardRef(({ activeSim, calculations }, ref) => {
  const { bankability } = calculations;

  return (
    <div ref={ref} style={{ width: '210mm', padding: '15mm', backgroundColor: '#ffffff', color: '#0f172a', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid #1e293b', paddingBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', color: '#0f172a', letterSpacing: '-0.05em', margin: 0 }}>Dossier Bancaire</h1>
          <p style={{ fontSize: '20px', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{activeSim.name}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: '#cbd5e1', margin: 0 }}>Rapport émis le</p>
          <p style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>{new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <RepKPI label="Endettement Avant" value={`${(bankability.tauxEndettementAvant || 0).toFixed(1)}%`} />
        <RepKPI label="Endettement Après" value={`${bankability.tauxEndettement.toFixed(1)}%`} highlight sub={`Statut: ${bankability.status.toUpperCase()}`} />
        <RepKPI label="Reste à Vivre" value={formatE(bankability.resteAVivre)} />
        <RepKPI label="Effort d'Épargne" value={`${bankability.effortEpargne > 0 ? '-' : '+'}${formatE(Math.abs(bankability.effortEpargne || 0))}`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <section style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#0f172a', borderBottom: '2px solid #6366f1', marginBottom: '16px', paddingBottom: '4px' }}>Plan de Financement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <RepRow label="Investissement Total" value={formatE(calculations.investTotal)} />
            <RepRow label="Apport Personnel" value={formatE(activeSim.data.apport)} />
            <RepRow label="Taux d'intérêt" value={`${activeSim.data.tauxInteret}%`} />
            <RepRow label="Durée" value={`${activeSim.data.dureeCredit} ans`} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '18px', borderTop: '2px solid #0f172a', paddingTop: '8px', marginTop: '8px' }}>
              <span>CRÉDIT DEMANDÉ</span>
              <span>{formatE(calculations.loanAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '16px', color: '#6366f1' }}>
              <span>Mensualité</span>
              <span>{formatE(calculations.mCredit)}</span>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#0f172a', borderBottom: '2px solid #6366f1', marginBottom: '16px', paddingBottom: '4px' }}>Couverture du Projet</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <RepRow label="Revenus Locatifs (HC)" value={formatE(calculations.recetteAnnuelle / 12)} />
            <RepRow label="Loyer Pondéré (70%)" value={formatE((calculations.recetteAnnuelle / 12) * 0.7)} />
            <RepRow label="Charges Mensuelles" value={formatE(calculations.totalChargesAnnuelles / 12)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '18px', borderTop: '2px solid #10b981', paddingTop: '8px', marginTop: '8px', color: '#10b981' }}>
              <span>CASH-FLOW NET-NET</span>
              <span>{formatE(calculations.cashflowNetNet)}</span>
            </div>
          </div>
        </section>
      </div>

      <div style={{ marginTop: '32px', padding: '40px', backgroundColor: '#1e293b', borderRadius: '48px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase', fontStyle: 'italic' }}>Executive Summary</h3>
          <p style={{ color: '#e0e7ff', fontSize: '14px', margin: 0 }}>
            Ce projet présente un taux d'endettement final de <span style={{ fontWeight: '900', color: '#ffffff' }}>{bankability.tauxEndettement.toFixed(1)}%</span>
            avec un reste à vivre de <span style={{ fontWeight: '900', color: '#ffffff' }}>{formatE(bankability.resteAVivre)}</span>.
            L'effort d'épargne mensuel est estimé à <span style={{ fontWeight: '900', color: '#ffffff' }}>{formatE(bankability.effortEpargne)}</span>.
          </p>
        </div>
      </div>
    </div>
  );
});

BankReport.displayName = 'BankReport';

export default BankReport;
