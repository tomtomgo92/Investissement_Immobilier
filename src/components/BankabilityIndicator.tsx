import React from 'react';
import { Landmark } from 'lucide-react';
import { formatE } from '../utils/formatters';
import { cn } from '../lib/utils';

export interface BankabilityIndicatorProps {
  bankability: {
    tauxEndettement: number;
    resteAVivre: number;
    status: 'green' | 'orange' | 'red' | string;
  };
}

export default function BankabilityIndicator({ bankability }: BankabilityIndicatorProps) {
  const { tauxEndettement, resteAVivre, status } = bankability;

  const getStatusColor = () => {
    switch (status) {
      case 'green': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30';
      case 'orange': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30';
      case 'red': return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30';
      default: return 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'green': return 'Dossier Solide';
      case 'orange': return 'Attention (Limite)';
      case 'red': return 'Risque de Refus';
      default: return 'Non Calculé';
    }
  };

  const getIconColor = () => {
    switch (status) {
      case 'green': return 'text-emerald-500';
      case 'orange': return 'text-amber-500';
      case 'red': return 'text-rose-500';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className={cn(
      "p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300",
      getStatusColor()
    )}>
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 dark:border-slate-800/50">
          <Landmark size={20} strokeWidth={2.5} className={getIconColor()} />
        </div>
        <div>
          <h4 className="text-[10px] font-medium uppercase tracking-[0.15em] opacity-80 mb-0.5">Faisabilité Bancaire</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold tracking-tight">{tauxEndettement.toFixed(1)}%</span>
            <span className="text-[10px] font-medium tracking-wide uppercase opacity-90 px-2 py-0.5 rounded-full bg-white/40 dark:bg-slate-900/40">
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right hidden sm:block">
        <p className="text-[10px] font-medium uppercase tracking-[0.15em] opacity-80 mb-0.5">Reste à Vivre</p>
        <p className="text-xl font-semibold tracking-tight">{formatE(resteAVivre)} <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">/ mois</span></p>
      </div>
    </div>
  );
}
