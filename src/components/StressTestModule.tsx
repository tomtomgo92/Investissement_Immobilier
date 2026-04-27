import React, { useMemo } from 'react';
import { generateStressScenarios, calculateResults } from '../utils/finance';
import { ShieldAlert, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface StressTestModuleProps {
  data: Record<string, any>;
  formatE: (value: number) => string;
}

export default function StressTestModule({ data, formatE }: StressTestModuleProps) {
  const scenarios = useMemo(() => {
    const rawScenarios = generateStressScenarios(data);
    const results: Record<string, any> = {};

    Object.keys(rawScenarios).forEach(key => {
      const simData = rawScenarios[key];
      results[key] = {
        name: simData.name,
        ...calculateResults(simData)
      };
    });

    return results;
  }, [data]);

  const nominalCF = scenarios.nominal.cashflowNetNet;

  const renderScenarioCard = (key: string, icon: React.ReactNode, colorClass: string, bgClass: string, highlight: boolean = false) => {
    const scenario = scenarios[key];
    const cf = scenario.cashflowNetNet;
    const diff = cf - nominalCF;

    return (
      <div className={cn(
        "p-5 rounded-xl border flex flex-col gap-4 transition-all duration-300 hover:shadow-sm",
        "bg-white/50 dark:bg-[#0B0F19]/30 backdrop-blur-md relative overflow-hidden",
        highlight ? "border-indigo-200/60 dark:border-indigo-800/60" : "border-slate-200/60 dark:border-white/[0.05]/60"
      )}>
        {highlight && (
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        )}
        
        <div className="flex items-center gap-2.5 relative z-10">
          <div className={cn("p-1.5 rounded-lg", bgClass, colorClass)}>
            {icon}
          </div>
          <h4 className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
            {scenario.name}
          </h4>
        </div>

        <div className="relative z-10">
          <div className="flex items-baseline gap-1.5">
            <span className={cn(
              "text-xl font-semibold tracking-tight",
              cf >= 0 ? "text-slate-800 dark:text-slate-100" : "text-rose-600 dark:text-rose-400"
            )}>
              {formatE(cf)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">/ mois</span>
          </div>

          {key !== 'nominal' && (
            <div className={cn(
              "text-[10px] font-medium mt-1.5 flex items-center gap-1.5 uppercase tracking-wide",
              diff >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              {diff >= 0 ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
              <span>{formatE(diff)} vs Nominal</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/50 dark:bg-[#0B0F19]/30 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-white/[0.05]/60 p-6 space-y-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/[0.05]/80 pb-4">
        <ShieldAlert size={18} className="text-amber-500" />
        <div>
           <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-800 dark:text-slate-200">Stress Test</h3>
           <p className="text-[10px] text-slate-500 mt-0.5 tracking-wide">Simulation automatique de scénarios dégradés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Nominal (Reference) */}
        {renderScenarioCard('nominal', <TrendingUp size={14} strokeWidth={2.5} />, 'text-indigo-600 dark:text-indigo-400', 'bg-indigo-50 dark:bg-indigo-900/20', true)}

        {/* Scenarios */}
        {renderScenarioCard('prudent', <AlertTriangle size={14} strokeWidth={2.5} />, 'text-amber-600 dark:text-amber-400', 'bg-amber-50 dark:bg-amber-900/20')}
        {renderScenarioCard('pessimiste', <TrendingDown size={14} strokeWidth={2.5} />, 'text-rose-600 dark:text-rose-400', 'bg-rose-50 dark:bg-rose-900/20')}
      </div>

      <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium tracking-wide">
        * Hypothèses : Prudent (Vacance 8.33%, Charges +20%), Pessimiste (Taux +2%, Taxe foncière x1.5, Travaux x2).
      </div>
    </div>
  );
}
