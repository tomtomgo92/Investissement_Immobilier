import React from 'react';
import { Landmark, TrendingUp, AlertTriangle, CheckCircle, Wallet } from 'lucide-react';
import { formatE } from '../utils/formatters';

export default function BankabilityIndicator({ bankability }) {
  const { tauxEndettement, resteAVivre, status } = bankability;

  const getStatusColor = () => {
    switch (status) {
      case 'green': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
      case 'orange': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'red': return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
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

  return (
    <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${getStatusColor()}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
          <Landmark size={20} className={status === 'red' ? 'text-rose-500' : (status === 'orange' ? 'text-amber-500' : 'text-emerald-500')} />
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70">Faisabilité Bancaire</h4>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{tauxEndettement.toFixed(1)}%</span>
            <span className="text-xs font-bold opacity-80">({getStatusText()})</span>
          </div>
        </div>
      </div>

      <div className="text-right hidden sm:block">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Reste à Vivre</p>
        <p className="text-lg font-bold">{formatE(resteAVivre)} / mois</p>
      </div>
    </div>
  );
}
