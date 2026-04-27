import React from 'react';
import { REGIME_LABELS } from '../utils/finance';
import { cn } from '../lib/utils';
import { Info } from 'lucide-react';

interface CalculationBreakdownProps {
  data: Record<string, any>;
  calculations: Record<string, any>;
  formatE: (value: number) => string;
}

export default function CalculationBreakdown({ data, calculations, formatE }: CalculationBreakdownProps) {
  const {
    recetteMensuelleBrute, vacanceLocative, recetteMensuelleRéelle,
    totalChargesAnnuelles, mCredit, impots, cashflowNetNet,
    bestRegime, appliedRegime
  } = { ...data, ...calculations };

  const isRegimeOptimal = appliedRegime === bestRegime;

  return (
    <div className="bg-white/50 dark:bg-[#0B0F19]/30 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-white/[0.05]/60 p-6 space-y-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.05]/80">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-800 dark:text-slate-200">
          Synthèse Financière
        </h3>
        {/* Status indicator */}
        <div className={cn(
          "px-2 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-medium tracking-wide uppercase transition-colors",
          isRegimeOptimal ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
        )}>
           <span className={cn("w-1.5 h-1.5 rounded-full", isRegimeOptimal ? "bg-emerald-500" : "bg-amber-500")} />
           {REGIME_LABELS[appliedRegime] || appliedRegime}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Revenus */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Revenus</h4>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>Loyer Brut</span>
              <span>{formatE(recetteMensuelleBrute)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>Vacance ({vacanceLocative}%)</span>
              <span>-{formatE(recetteMensuelleBrute * (vacanceLocative / 100))}</span>
            </div>
            <div className="pt-2 mt-1 border-t border-slate-100 dark:border-white/[0.05]/80 flex justify-between items-center text-xs font-medium text-slate-800 dark:text-slate-200">
              <span>Réel</span>
              <span className="text-emerald-600 dark:text-emerald-400">{formatE(recetteMensuelleRéelle)}</span>
            </div>
          </div>
        </div>

        {/* Sorties */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Dépenses</h4>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>Crédit</span>
              <span>-{formatE(mCredit)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>Charges estimées</span>
              <span>-{formatE(totalChargesAnnuelles / 12)}</span>
            </div>
            <div className="pt-2 mt-1 border-t border-slate-100 dark:border-white/[0.05]/80 flex justify-between items-center text-xs font-medium text-slate-800 dark:text-slate-200">
              <span>Total Dépenses</span>
              <span className="text-rose-600 dark:text-rose-400">-{formatE(mCredit + (totalChargesAnnuelles / 12))}</span>
            </div>
          </div>
        </div>

        {/* Fiscalité */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Fiscalité</h4>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>Impôt Annuel</span>
              <span>-{formatE(impots)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>Provision Mensuelle</span>
              <span>-{formatE(impots / 12)}</span>
            </div>
            <div className="pt-2 mt-1 border-t border-slate-100 dark:border-white/[0.05]/80 flex justify-between items-center text-xs font-medium text-slate-800 dark:text-slate-200">
               <span>Poids Fiscal</span>
               <span className="text-slate-500">{((impots / Math.max(1, (recetteMensuelleRéelle * 12))) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Résultat */}
        <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl p-4 flex flex-col justify-center border border-slate-100 dark:border-white/[0.08]/50">
          <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Cashflow Net</span>
          <div className="flex items-baseline gap-1.5">
            <span className={cn(
              "text-2xl font-semibold tracking-tight",
              cashflowNetNet >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              {formatE(cashflowNetNet)}
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">/ mois</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-2">
            Soit {formatE(cashflowNetNet * 12)} / an net dans votre poche.
          </span>
        </div>

      </div>

      {!isRegimeOptimal && (
        <div className="flex items-start gap-3 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
          <Info size={14} className="shrink-0 mt-0.5 opacity-70" />
          <p className="font-medium leading-relaxed">
            Le simulateur recommande d'utiliser le régime <span className="font-semibold">{REGIME_LABELS[bestRegime] || bestRegime}</span> pour maximiser votre rentabilité.
          </p>
        </div>
      )}
    </div>
  );
}
