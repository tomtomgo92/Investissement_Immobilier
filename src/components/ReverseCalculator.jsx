import React, { useState, useMemo, useCallback, useDeferredValue } from 'react';
import { Target, TrendingUp, Handshake, AlertCircle, Loader2 } from 'lucide-react';
import DashboardSection from './GlassSection';
import PremiumInput from './PremiumInput';
import { calculateResults } from '../utils/finance';
import { formatE } from '../utils/formatters';

export default function ReverseCalculator({ data, onApplyMaxPrice, onApplyMinRent }) {
  const [targetCashflow, setTargetCashflow] = useState(0);

  // ⚡ Bolt Optimization: useDeferredValue deprioritizes the heavy calculations.
  // Impact: Keeps the main thread free so typing in the input field remains snappy,
  // pushing the 50-iteration binary search to a background update.
  const deferredTargetCashflow = useDeferredValue(targetCashflow);
  const isCalculating = deferredTargetCashflow !== targetCashflow;

  // Helper to deep copy and recalculate
  const evaluateCashflow = useCallback((simData) => {
    // Re-calculate derived data (like notary fees) if needed by the app logic
    if (simData.prixAchat !== data.prixAchat) {
       simData.fraisNotaire = Math.round(simData.prixAchat * 0.08);
    }

    const results = calculateResults(simData);
    return results.cashflowNetNet; // Our main target metric
  }, [data.prixAchat]);

  const maxPrice = useMemo(() => {
    let minPrice = 1000;
    let maxPrice = 5000000; // 5M max
    let bestPrice = null;
    let tolerance = 1; // 1 euro tolerance

    // Check if target is even reachable at lowest price
    const baseSim = { ...data };
    baseSim.prixAchat = minPrice;
    if (evaluateCashflow(baseSim) < deferredTargetCashflow) {
      return null; // Not reachable even at 1000€
    }

    // ⚡ Bolt Optimization: Reuse shallow copy object to prevent GC thrashing inside loop.
    // Impact: Reduces memory allocations during the 50-iteration binary search.
    const testSim = { ...data };

    // Binary search
    for (let i = 0; i < 50; i++) {
      let midPrice = (minPrice + maxPrice) / 2;
      testSim.prixAchat = midPrice;

      const cf = evaluateCashflow(testSim);

      if (Math.abs(cf - deferredTargetCashflow) <= tolerance) {
        bestPrice = midPrice;
        break;
      }

      // If CF is higher than target, we can afford a higher purchase price
      if (cf > deferredTargetCashflow) {
        minPrice = midPrice;
      } else {
        // If CF is lower than target, we need a lower purchase price
        maxPrice = midPrice;
      }
      bestPrice = midPrice;
    }
    return bestPrice ? Math.floor(bestPrice) : null;
  }, [data, evaluateCashflow, deferredTargetCashflow]);

  const minRent = useMemo(() => {
     let minRent = 0;
     let maxRent = 10000; // 10k per roommate max
     let bestRent = null;
     let tolerance = 1; // 1 euro tolerance

     // ⚡ Bolt Optimization: Reuse shallow copy object to prevent GC thrashing inside loop.
     const testSim = { ...data };

     // Binary search
     for (let i = 0; i < 50; i++) {
        let midRent = (minRent + maxRent) / 2;
        testSim.loyers = data.loyers.map(() => midRent);

        const cf = evaluateCashflow(testSim);

        if (Math.abs(cf - deferredTargetCashflow) <= tolerance) {
          bestRent = midRent;
          break;
        }

        if (cf < deferredTargetCashflow) {
           minRent = midRent;
        } else {
           maxRent = midRent;
        }
        bestRent = midRent;
     }
     return bestRent ? Math.ceil(bestRent) : null;
  }, [data, evaluateCashflow, deferredTargetCashflow]);

  return (
    <DashboardSection title="Négociation & Objectif" icon={<Target size={18} className="text-emerald-500" />}>
      <div className="space-y-6">
        <PremiumInput
          label="Objectif Cashflow Net"
          value={targetCashflow}
          onChange={(v) => setTargetCashflow(parseFloat(v) || 0)}
          tooltip="Objectif de cash-flow mensuel dans la poche"
          suffix="€/mois"
        />

        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity duration-200 ${isCalculating ? 'opacity-50' : 'opacity-100'}`}>

          {/* Max Price Result */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity flex items-center gap-2">
              {isCalculating ? <Loader2 size={48} className="animate-spin text-slate-400" /> : <Handshake size={48} />}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Prix d'achat Max</p>
            {maxPrice ? (
               <>
                 <p className="text-xl font-black text-primary dark:text-white">
                   {formatE(maxPrice)}
                 </p>
                 <button
                   onClick={() => onApplyMaxPrice(maxPrice)}
                   disabled={isCalculating}
                   className="mt-3 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded font-bold uppercase tracking-wide transition-colors z-10 relative cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Appliquer ce prix
                 </button>
               </>
            ) : (
               <div className="flex items-center gap-2 mt-2 text-rose-500">
                 <AlertCircle size={14} />
                 <span className="text-xs font-bold">Inatteignable</span>
               </div>
            )}
          </div>

          {/* Min Rent Result */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity flex items-center gap-2">
               {isCalculating ? <Loader2 size={48} className="animate-spin text-slate-400" /> : <TrendingUp size={48} />}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Loyer Minimum</p>
            <div className="flex items-baseline gap-1">
               <p className="text-xl font-black text-primary dark:text-white">
                 {formatE(minRent)}
               </p>
               <span className="text-xs text-slate-400 font-medium">/locataire</span>
            </div>
             <button
               onClick={() => onApplyMinRent(minRent)}
               disabled={isCalculating}
               className="mt-3 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded font-bold uppercase tracking-wide transition-colors z-10 relative cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Appliquer ces loyers
             </button>
          </div>

        </div>
      </div>
    </DashboardSection>
  );
}
