import React, { useMemo } from 'react';
import { calculateResults } from '../utils/finance';
import { formatE } from '../utils/formatters';
import { ArrowLeft, ArrowRight, Wallet, TrendingUp, Search, PhoneCall, Calendar, Send, CheckCircle2, LayoutList } from 'lucide-react';

const COLUMNS = [
  { id: 'À analyser', label: 'À analyser', icon: <Search size={14} /> },
  { id: 'Contacté', label: 'Contacté', icon: <PhoneCall size={14} /> },
  { id: 'Visite prévue', label: 'Visite prévue', icon: <Calendar size={14} /> },
  { id: 'Offre envoyée', label: 'Offre envoyée', icon: <Send size={14} /> },
  { id: 'Accepté/Refusé', label: 'Accepté/Refusé', icon: <CheckCircle2 size={14} /> }
];

export default function DealPipeline({ simulations, setSimulations, setActiveSimId, setViewMode }) {
  // Pre-calculate results for each simulation to display key metrics
  const pipelineData = useMemo(() => {
    return simulations.map(sim => {
      const results = calculateResults(sim.data);
      return {
        id: sim.id,
        name: sim.name,
        status: sim.pipelineStatus || 'À analyser',
        ...results
      };
    });
  }, [simulations]);

  const changeStatus = (simId, currentIndex, direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      const newStatus = COLUMNS[newIndex].id;
      setSimulations(prev => prev.map(s => s.id === simId ? { ...s, pipelineStatus: newStatus } : s));
    }
  };

  const openSimulation = (id) => {
    setActiveSimId(id);
    setViewMode('dashboard');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-primary dark:text-white flex items-center gap-2">
          <LayoutList className="text-accent" /> Deal Pipeline
        </h2>
        <p className="text-xs text-slate-400 mt-1">Suivez l'avancement de vos projets d'investissement, du sourcing à la signature.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 items-stretch min-h-[500px]">
        {COLUMNS.map((col, colIndex) => {
          const columnSims = pipelineData.filter(s => s.status === col.id);

          return (
            <div key={col.id} className="flex-1 min-w-[280px] bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col">
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100/50 dark:bg-slate-800/80 rounded-t-xl">
                <div className="flex items-center gap-2 text-primary dark:text-white font-bold text-sm">
                  <span className="text-accent">{col.icon}</span>
                  {col.label}
                </div>
                <span className="text-xs font-bold text-slate-400 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full shadow-sm">
                  {columnSims.length}
                </span>
              </div>

              {/* Column Body / Cards */}
              <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto">
                {columnSims.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 italic mt-4 opacity-50">Aucun projet</div>
                ) : (
                  columnSims.map(sim => (
                    <div key={sim.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex justify-between items-start mb-2">
                        <button onClick={() => openSimulation(sim.id)} className="font-bold text-sm text-primary dark:text-white hover:text-accent text-left">
                          {sim.name}
                        </button>
                      </div>

                      <div className="space-y-1 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Investissement</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{formatE(sim.investTotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-slate-500"><Wallet size={10} /> Cashflow</span>
                          <span className={`font-bold ${sim.cashflowNetNet >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {formatE(sim.cashflowNetNet)}/m
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-slate-500"><TrendingUp size={10} /> Renda. Net</span>
                          <span className="font-bold text-indigo-500">{sim.rNet.toFixed(2)}%</span>
                        </div>
                      </div>

                      {/* Card Actions (Move buttons) */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          aria-label="Déplacer à l'étape précédente"
                          onClick={() => changeStatus(sim.id, colIndex, -1)}
                          disabled={colIndex === 0}
                          className="p-1.5 rounded-md text-slate-400 hover:text-accent hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-20 transition-colors"
                        >
                          <ArrowLeft size={14} />
                        </button>

                        <button
                          onClick={() => openSimulation(sim.id)}
                          className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary dark:hover:text-white"
                        >
                          Ouvrir
                        </button>

                        <button
                          aria-label="Déplacer à l'étape suivante"
                          onClick={() => changeStatus(sim.id, colIndex, 1)}
                          disabled={colIndex === COLUMNS.length - 1}
                          className="p-1.5 rounded-md text-slate-400 hover:text-accent hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-20 transition-colors"
                        >
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
