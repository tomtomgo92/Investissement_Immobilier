import React, { useState } from 'react';
import { Target, TrendingUp, Handshake, AlertCircle } from 'lucide-react';
import DashboardSection from './GlassSection';
import PremiumInput from './PremiumInput';
import { calculateResults } from '../utils/finance';
import { formatE } from '../utils/formatters';

export default function ReverseCalculator({ data, onApplyMaxPrice, onApplyMinRent }) {
  const [targetCashflow, setTargetCashflow] = useState(0);

  // Helper to deep copy and recalculate
  const evaluateCashflow = (simData) => {
    // Re-calculate derived data (like notary fees) if needed by the app logic
    if (simData.prixAchat !== data.prixAchat) {
       simData.fraisNotaire = Math.round(simData.prixAchat * 0.08);
    }

    const results = calculateResults(simData);
    return results.cashflowNetNet; // Our main target metric
  };

  const calculateMaxPurchasePrice = () => {
    let minPrice = 1000;
    let maxPrice = 5000000; // 5M max
    let bestPrice = null;
    let tolerance = 1; // 1 euro tolerance

    // Check if target is even reachable at lowest price
    const baseSim = JSON.parse(JSON.stringify(data));
    baseSim.prixAchat = minPrice;
    if (evaluateCashflow(baseSim) < targetCashflow) {
      return null; // Not reachable even at 1000€
    }

    // Binary search
    for (let i = 0; i < 50; i++) {
      let midPrice = (minPrice + maxPrice) / 2;
      const testSim = JSON.parse(JSON.stringify(data));
      testSim.prixAchat = midPrice;

      const cf = evaluateCashflow(testSim);

      if (Math.abs(cf - targetCashflow) <= tolerance) {
        bestPrice = midPrice;
        break;
      }

      // If CF is higher than target, we can afford a higher purchase price
      if (cf > targetCashflow) {
        minPrice = midPrice;
      } else {
        // If CF is lower than target, we need a lower purchase price
        maxPrice = midPrice;
      }
      bestPrice = midPrice;
    }
    return bestPrice ? Math.floor(bestPrice) : null;
  };

  const calculateMinRents = () => {
     let minRent = 0;
     let maxRent = 10000; // 10k per roommate max
     let bestRent = null;
     let tolerance = 1; // 1 euro tolerance

     // Binary search
     for (let i = 0; i < 50; i++) {
        let midRent = (minRent + maxRent) / 2;
        const testSim = JSON.parse(JSON.stringify(data));
        testSim.loyers = testSim.loyers.map(() => midRent);

        const cf = evaluateCashflow(testSim);

        if (Math.abs(cf - targetCashflow) <= tolerance) {
          bestRent = midRent;
          break;
        }

        if (cf < targetCashflow) {
           minRent = midRent;
        } else {
           maxRent = midRent;
        }
        bestRent = midRent;
     }
     return bestRent ? Math.ceil(bestRent) : null;
  };

  const maxPrice = calculateMaxPurchasePrice();
  const minRent = calculateMinRents();

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Max Price Result */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Handshake size={48} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Prix d'achat Max</p>
            {maxPrice ? (
               <>
                 <p className="text-xl font-black text-primary dark:text-white">{formatE(maxPrice)}</p>
                 <button
                   onClick={() => onApplyMaxPrice(maxPrice)}
                   className="mt-3 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded font-bold uppercase tracking-wide transition-colors z-10 relative cursor-pointer"
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
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
               <TrendingUp size={48} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Loyer Minimum</p>
            <div className="flex items-baseline gap-1">
               <p className="text-xl font-black text-primary dark:text-white">{formatE(minRent)}</p>
               <span className="text-xs text-slate-400 font-medium">/locataire</span>
            </div>
             <button
               onClick={() => onApplyMinRent(minRent)}
               className="mt-3 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded font-bold uppercase tracking-wide transition-colors z-10 relative cursor-pointer"
             >
               Appliquer ces loyers
             </button>
          </div>

        </div>
      </div>
    </DashboardSection>
  );
}
