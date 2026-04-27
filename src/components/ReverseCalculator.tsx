import React, { useState, useMemo, useCallback } from 'react';
import { Target, TrendingUp, Handshake, AlertCircle } from 'lucide-react';
import DashboardSection from './GlassSection';
import PremiumInput from './PremiumInput';
import { calculateResults } from '../utils/finance';
import { formatE } from '../utils/formatters';

interface ReverseCalculatorProps {
  data: Record<string, any>;
  onApplyMaxPrice: (price: number) => void;
  onApplyMinRent: (rent: number) => void;
}

export default function ReverseCalculator({ data, onApplyMaxPrice, onApplyMinRent }: ReverseCalculatorProps) {
  const [targetCashflow, setTargetCashflow] = useState(0);

  const evaluateCashflow = useCallback((simData: Record<string, any>) => {
    if (simData.prixAchat !== data.prixAchat) {
       simData.fraisNotaire = Math.round(simData.prixAchat * 0.08);
    }
    const results = calculateResults(simData);
    return results.cashflowNetNet;
  }, [data.prixAchat]);

  const { maxPrice, minRent } = useMemo(() => {
    const calculateMaxPurchasePrice = () => {
      let minPrice = 1000;
      let maxPrice = 5000000;
      let bestPrice: number | null = null;
      let tolerance = 1;

      const baseSim = { ...data };
      baseSim.prixAchat = minPrice;
      if (evaluateCashflow(baseSim) < targetCashflow) {
        return null;
      }

      const testSim = { ...data };

      for (let i = 0; i < 50; i++) {
        let midPrice = (minPrice + maxPrice) / 2;
        testSim.prixAchat = midPrice;

        const cf = evaluateCashflow(testSim);

        if (Math.abs(cf - targetCashflow) <= tolerance) {
          bestPrice = midPrice;
          break;
        }

        if (cf > targetCashflow) {
          minPrice = midPrice;
        } else {
          maxPrice = midPrice;
        }
        bestPrice = midPrice;
      }
      return bestPrice ? Math.floor(bestPrice) : null;
    };

    const calculateMinRents = () => {
       let minRent = 0;
       let maxRent = 10000;
       let bestRent: number | null = null;
       let tolerance = 1;

       const testSim = { ...data };

       for (let i = 0; i < 50; i++) {
          let midRent = (minRent + maxRent) / 2;
          testSim.loyers = data.loyers.map(() => midRent);

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

    return {
      maxPrice: calculateMaxPurchasePrice(),
      minRent: calculateMinRents()
    };
  }, [data, targetCashflow, evaluateCashflow]);

  return (
    <DashboardSection title="Négociation & Objectif" icon={<Target size={18} className="text-emerald-500" />}>
      <div className="space-y-6">
        <PremiumInput
          label="Objectif Cashflow Net"
          value={targetCashflow}
          onChange={(v) => setTargetCashflow(parseFloat(v as string) || 0)}
          tooltip="Objectif de cash-flow mensuel dans la poche"
          suffix="€/mois"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Max Price Result */}
          <div className="p-4 rounded-xl border border-slate-200/60 dark:border-white/[0.05]/60 bg-white/50 dark:bg-[#0B0F19]/30 backdrop-blur-md relative overflow-hidden group transition-all duration-300 hover:shadow-sm">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
              <Handshake size={48} className="text-slate-500" />
            </div>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 mb-1">Prix d'achat Max</p>
            {maxPrice ? (
               <>
                 <p className="text-xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">{formatE(maxPrice)}</p>
                 <button
                   onClick={() => onApplyMaxPrice(maxPrice)}
                   className="mt-3 text-[10px] bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-md font-medium uppercase tracking-widest transition-colors z-10 relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900"
                 >
                   Appliquer ce prix
                 </button>
               </>
            ) : (
               <div className="flex items-center gap-1.5 mt-2 text-rose-500 dark:text-rose-400">
                 <AlertCircle size={14} />
                 <span className="text-[10px] font-medium uppercase tracking-wider">Inatteignable</span>
               </div>
            )}
          </div>

          {/* Min Rent Result */}
          <div className="p-4 rounded-xl border border-slate-200/60 dark:border-white/[0.05]/60 bg-white/50 dark:bg-[#0B0F19]/30 backdrop-blur-md relative overflow-hidden group transition-all duration-300 hover:shadow-sm">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
               <TrendingUp size={48} className="text-slate-500" />
            </div>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 mb-1">Loyer Minimum</p>
            <div className="flex items-baseline gap-1.5">
               <p className="text-xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">{formatE(minRent || 0)}</p>
               <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">/ locataire</span>
            </div>
             <button
               onClick={() => minRent && onApplyMinRent(minRent)}
               className="mt-3 text-[10px] bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-md font-medium uppercase tracking-widest transition-colors z-10 relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900"
             >
               Appliquer ces loyers
             </button>
          </div>

        </div>
      </div>
    </DashboardSection>
  );
}
