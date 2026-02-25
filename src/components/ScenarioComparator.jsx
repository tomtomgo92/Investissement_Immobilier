import React, { useMemo } from 'react';
import { calculateResults } from '../utils/finance';
import { formatE } from '../utils/formatters';
import { ArrowRight, CheckCircle2, TrendingUp, Wallet, Building2, Scale } from 'lucide-react';

export default function ScenarioComparator({ simulations, activeSimId, setActiveSimId }) {

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
  const getBest = (key, type = 'max') => {
    const values = comparedData.map(d => d[key]);
    return type === 'max' ? Math.max(...values) : Math.min(...values);
  };

  const bestCashflow = getBest('cashflowNetNet');
  const bestYield = getBest('rNet');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-primary dark:text-white flex items-center gap-2">
            <Scale className="text-accent" /> Comparateur de Scénarios
          </h2>
          <p className="text-xs text-slate-400 mt-1">Analysez vos options côte à côte pour prendre la meilleure décision.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 w-48 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-widest sticky left-0 z-10">
                Métrique Clé
              </th>
              {comparedData.map(sim => (
                <th key={sim.id} className={`p-4 min-w-[200px] border-b border-slate-200 dark:border-slate-800 ${activeSimId === sim.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-primary dark:text-white">{sim.name}</span>
                    {activeSimId !== sim.id && (
                      <button
                        onClick={() => setActiveSimId(sim.id)}
                        className="text-[9px] text-accent hover:underline text-left"
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
            <tr className="bg-slate-50/50 dark:bg-slate-800/30"><td colSpan={simulations.length + 1} className="p-2 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Investissement</td></tr>

            <tr>
              <td className="p-4 font-bold text-slate-500 text-xs">Prix Total</td>
              {comparedData.map(sim => (
                <td key={sim.id} className="p-4 border-b border-slate-100 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {formatE(sim.investTotal)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-bold text-slate-500 text-xs">Apport</td>
              {comparedData.map(sim => (
                <td key={sim.id} className="p-4 border-b border-slate-100 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {formatE(sim.investTotal - sim.loanAmount)}
                </td>
              ))}
            </tr>

             {/* Performance Section */}
             <tr className="bg-slate-50/50 dark:bg-slate-800/30"><td colSpan={simulations.length + 1} className="p-2 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rentabilité & Cashflow</td></tr>

            <tr>
              <td className="p-4 font-bold text-slate-500 text-xs flex items-center gap-2">
                <Wallet size={14} className="text-emerald-500" /> Cashflow Net-Net
              </td>
              {comparedData.map(sim => {
                const isBest = sim.cashflowNetNet === bestCashflow && simulations.length > 1;
                return (
                  <td key={sim.id} className={`p-4 border-b border-slate-100 dark:border-slate-800 font-bold ${sim.cashflowNetNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} ${isBest ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
                    {formatE(sim.cashflowNetNet)}
                    {isBest && <span className="ml-2 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase">Top</span>}
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="p-4 font-bold text-slate-500 text-xs flex items-center gap-2">
                <TrendingUp size={14} className="text-indigo-500" /> Rendement Net
              </td>
              {comparedData.map(sim => {
                const isBest = sim.rNet === bestYield && simulations.length > 1;
                return (
                  <td key={sim.id} className={`p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 ${isBest ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                    {sim.rNet.toFixed(2)}%
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="p-4 font-bold text-slate-500 text-xs">Fiscalité Optimale</td>
              {comparedData.map(sim => (
                <td key={sim.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <span className={`px-2 py-1 rounded-full font-bold uppercase text-[9px] ${sim.bestRegime === 'reel' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'}`}>
                    {sim.bestRegime === 'reel' ? 'Réel' : 'Micro'}
                  </span>
                </td>
              ))}
            </tr>

            {/* Projection Section */}
            <tr className="bg-slate-50/50 dark:bg-slate-800/30"><td colSpan={simulations.length + 1} className="p-2 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Projection (20 Ans)</td></tr>

            <tr>
              <td className="p-4 font-bold text-slate-500 text-xs flex items-center gap-2">
                <Building2 size={14} className="text-indigo-500" /> Enrichissement
              </td>
              {comparedData.map(sim => {
                 const finalNetWorth = sim.projectionData[sim.projectionData.length - 1]?.netWorth || 0;
                 const allWealths = comparedData.map(s => s.projectionData[s.projectionData.length - 1]?.netWorth || 0);
                 const maxWealth = Math.max(...allWealths);
                 const isBest = finalNetWorth === maxWealth && simulations.length > 1;

                return (
                  <td key={sim.id} className={`p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 ${isBest ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
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
