import React, { useMemo } from 'react';
import { calculateResults } from '../utils/finance';
import { formatE } from '../utils/formatters';
import { ArrowRight, CheckCircle2, TrendingUp, Wallet, Building2, Scale } from 'lucide-react';

export interface ScenarioComparatorProps {
  simulations: any[];
  activeSimId: string;
  setActiveSimId: (id: string) => void;
}

export default function ScenarioComparator({ simulations, activeSimId, setActiveSimId }: ScenarioComparatorProps) {

  const comparedData = useMemo(() => {
    return simulations.map(sim => {
      const results = calculateResults(sim.data);
      return {
        id: sim.id,
        name: sim.name,
        ...results
      };
    });
  }, [simulations]);

  // Helper to find the best value for highlighting
  const getBest = (key: string, type = 'max') => {
    const values = comparedData.map(d => (d as any)[key]);
    return type === 'max' ? Math.max(...values) : Math.min(...values);
  };

  const bestCashflow = getBest('cashflowNetNet');
  const bestYield = getBest('rNet');

  return (
    <div className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/50 dark:border-white/[0.05] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 border-b border-slate-100 dark:border-white/[0.05] flex justify-between items-center bg-white/50 dark:bg-[#0B0F19]/50">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <Scale className="text-indigo-600 dark:text-indigo-400" />
            </div>
            Comparateur de Scénarios
          </h2>
          <p className="text-sm text-slate-500 mt-2">Analysez vos options côte à côte pour prendre la meilleure décision.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-6 w-48 bg-slate-50/80 dark:bg-white/[0.03] border-b border-slate-200/60 dark:border-white/[0.05] text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] sticky left-0 z-10 backdrop-blur-sm">
                Métrique Clé
              </th>
              {comparedData.map(sim => (
                <th key={sim.id} className={`p-6 min-w-[220px] border-b border-slate-200/60 dark:border-white/[0.05] transition-colors ${activeSimId === sim.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">{sim.name}</span>
                    {activeSimId !== sim.id && (
                      <button
                        onClick={() => setActiveSimId(sim.id)}
                        aria-label={`Voir les détails pour le scénario ${sim.name}`}
                        className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 hover:text-indigo-600 hover:underline text-left transition-colors"
                      >
                        Voir détails &rarr;
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">

            {/* Investment Section */}
            <tr className="bg-slate-50/50 dark:bg-white/[0.02]"><td colSpan={simulations.length + 1} className="p-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Investissement</td></tr>

            <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
              <td className="p-6 font-semibold text-slate-500 text-xs tracking-wide sticky left-0 bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm">Prix Total</td>
              {comparedData.map(sim => (
                <td key={sim.id} className="p-6 border-b border-slate-100 dark:border-white/[0.05] font-bold text-slate-800 dark:text-slate-200">
                  {formatE(sim.investTotal)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
              <td className="p-6 font-semibold text-slate-500 text-xs tracking-wide sticky left-0 bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm">Apport</td>
              {comparedData.map(sim => (
                <td key={sim.id} className="p-6 border-b border-slate-100 dark:border-white/[0.05] font-bold text-slate-800 dark:text-slate-200">
                  {formatE(sim.investTotal - sim.loanAmount)}
                </td>
              ))}
            </tr>

             {/* Performance Section */}
             <tr className="bg-slate-50/50 dark:bg-white/[0.02]"><td colSpan={simulations.length + 1} className="p-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Rentabilité & Cashflow</td></tr>

            <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
              <td className="p-6 font-semibold text-slate-500 text-xs tracking-wide flex items-center gap-3 sticky left-0 bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm">
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"><Wallet size={14} className="text-emerald-500" /></div> Cashflow Net-Net
              </td>
              {comparedData.map(sim => {
                const isBest = sim.cashflowNetNet === bestCashflow && simulations.length > 1;
                return (
                  <td key={sim.id} className={`p-6 border-b border-slate-100 dark:border-white/[0.05] font-bold ${sim.cashflowNetNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} ${isBest ? 'bg-emerald-50/50 dark:bg-emerald-900/20' : ''}`}>
                    {formatE(sim.cashflowNetNet)}
                    {isBest && <span className="ml-3 text-[9px] font-bold tracking-widest bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md uppercase">Top</span>}
                  </td>
                );
              })}
            </tr>

            <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
              <td className="p-6 font-semibold text-slate-500 text-xs tracking-wide flex items-center gap-3 sticky left-0 bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"><TrendingUp size={14} className="text-indigo-500" /></div> Rendement Net
              </td>
              {comparedData.map(sim => {
                const isBest = sim.rNet === bestYield && simulations.length > 1;
                return (
                  <td key={sim.id} className={`p-6 border-b border-slate-100 dark:border-white/[0.05] font-bold text-slate-800 dark:text-slate-200 ${isBest ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                    {sim.rNet.toFixed(2)}%
                  </td>
                );
              })}
            </tr>

            <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
              <td className="p-6 font-semibold text-slate-500 text-xs tracking-wide sticky left-0 bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm">Fiscalité Optimale</td>
              {comparedData.map(sim => (
                <td key={sim.id} className="p-6 border-b border-slate-100 dark:border-white/[0.05] text-xs">
                  <span className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest text-[9px] ${sim.bestRegime === 'reel' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800' : 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800'}`}>
                    {sim.bestRegime === 'reel' ? 'Réel' : 'Micro'}
                  </span>
                </td>
              ))}
            </tr>

            {/* Projection Section */}
            <tr className="bg-slate-50/50 dark:bg-white/[0.02]"><td colSpan={simulations.length + 1} className="p-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Projection (20 Ans)</td></tr>

            <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
              <td className="p-6 font-semibold text-slate-500 text-xs tracking-wide flex items-center gap-3 sticky left-0 bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"><Building2 size={14} className="text-indigo-500" /></div> Enrichissement
              </td>
              {comparedData.map(sim => {
                 const finalNetWorth = sim.projectionData[sim.projectionData.length - 1]?.netWorth || 0;
                 const allWealths = comparedData.map(s => s.projectionData[s.projectionData.length - 1]?.netWorth || 0);
                 const maxWealth = Math.max(...allWealths);
                 const isBest = finalNetWorth === maxWealth && simulations.length > 1;

                return (
                  <td key={sim.id} className={`p-6 border-b border-slate-100 dark:border-white/[0.05] font-bold text-slate-800 dark:text-slate-200 ${isBest ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                    {formatE(finalNetWorth)}
                  </td>
                );
              })}
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}
