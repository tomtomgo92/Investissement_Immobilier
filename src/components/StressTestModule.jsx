import React, { useMemo } from 'react';
import { generateStressScenarios, calculateResults } from '../utils/finance';
import { formatE } from '../utils/formatters';
import { ShieldAlert, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

export default function StressTestModule({ data, formatE }) {

  const scenarios = useMemo(() => {
    const rawScenarios = generateStressScenarios(data);
    const results = {};

    // Calculate results for each scenario
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

  const renderScenarioCard = (key, icon, colorClass, borderClass) => {
    const scenario = scenarios[key];
    const cf = scenario.cashflowNetNet;
    const diff = cf - nominalCF;

    return (
      <div className={`p-4 rounded-xl border ${borderClass} bg-white dark:bg-slate-900 flex flex-col gap-3 transition-all hover:shadow-md`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
            {icon}
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">{scenario.name}</h4>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-black ${cf >= 0 ? 'text-primary dark:text-white' : 'text-rose-500'}`}>
              {formatE(cf)}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">/ mois</span>
          </div>

          {key !== 'nominal' && (
            <div className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {diff >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {formatE(diff)} vs Nominal
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
        <ShieldAlert size={20} className="text-amber-500" />
        <div>
           <h3 className="text-sm font-bold uppercase tracking-widest text-primary dark:text-white">Stress Test</h3>
           <p className="text-[10px] text-slate-400 mt-0.5">Simulation automatique de scénarios dégradés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nominal (Reference) */}
        {renderScenarioCard('nominal', <TrendingUp size={16} />, 'text-indigo-500 bg-indigo-500', 'border-indigo-200 dark:border-indigo-900 ring-1 ring-indigo-500/20')}

        {/* Scenarios */}
        {renderScenarioCard('vacancy', <AlertTriangle size={16} />, 'text-amber-500 bg-amber-500', 'border-slate-200 dark:border-slate-700')}
        {renderScenarioCard('rentDrop', <TrendingDown size={16} />, 'text-rose-500 bg-rose-500', 'border-slate-200 dark:border-slate-700')}
        {renderScenarioCard('chargesUp', <TrendingDown size={16} />, 'text-rose-500 bg-rose-500', 'border-slate-200 dark:border-slate-700')}
      </div>

      <div className="text-[10px] text-slate-400 italic text-center">
        * Hypothèses : Vacance = 16.6% (2 mois), Loyers -15%, Charges +25%.
      </div>
    </div>
  );
}
