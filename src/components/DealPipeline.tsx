import React, { useMemo } from 'react';
import { calculatePipelineMetrics } from '../utils/finance';
import { formatE } from '../utils/formatters';
import { ArrowLeft, ArrowRight, Wallet, TrendingUp, Search, PhoneCall, Calendar, Send, CheckCircle2, LayoutList, Bell, BellRing } from 'lucide-react';

const COLUMNS = [
  { id: 'À analyser', label: 'À analyser', icon: <Search size={14} /> },
  { id: 'Contacté', label: 'Contacté', icon: <PhoneCall size={14} /> },
  { id: 'Visite prévue', label: 'Visite prévue', icon: <Calendar size={14} /> },
  { id: 'Offre envoyée', label: 'Offre envoyée', icon: <Send size={14} /> },
  { id: 'Accepté/Refusé', label: 'Accepté/Refusé', icon: <CheckCircle2 size={14} /> }
];

export interface DealPipelineProps {
  simulations: any[];
  setSimulations: (updater: (prev: any[]) => any[]) => void;
  setActiveSimId: (id: string) => void;
  setViewMode: (mode: string) => void;
}

export default function DealPipeline({ simulations, setSimulations, setActiveSimId, setViewMode }: DealPipelineProps) {
  // Pre-calculate results for each simulation to display key metrics
  const pipelineData = useMemo(() => {
    return simulations.map(sim => {
      const results = calculatePipelineMetrics(sim.data);
      return {
        id: sim.id,
        name: sim.name,
        status: sim.pipelineStatus || 'À analyser',
        hasAlert: sim.hasAlert || false,
        ...results
      };
    });
  }, [simulations]);

  const toggleAlert = (simId: string) => {
    setSimulations(prev => prev.map(s => {
      if (s.id === simId) {
        const isEnabling = !s.hasAlert;
        if (isEnabling) {
          alert(`Alerte activée pour "${s.name}". Vous serez notifié si le prix baisse ou dans 45 jours.`);
        }
        return { ...s, hasAlert: isEnabling };
      }
      return s;
    }));
  };

  const changeStatus = (simId: string, currentIndex: number, direction: number) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      const newStatus = COLUMNS[newIndex].id;
      setSimulations(prev => prev.map(s => s.id === simId ? { ...s, pipelineStatus: newStatus } : s));
    }
  };

  const openSimulation = (id: string) => {
    setActiveSimId(id);
    setViewMode('dashboard');
  };

  return (
    <div className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/50 dark:border-white/[0.05] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
            <LayoutList className="text-indigo-600 dark:text-indigo-400" />
          </div>
          Deal Pipeline
        </h2>
        <p className="text-sm text-slate-500 mt-2">Suivez l'avancement de vos projets d'investissement, du sourcing à la signature.</p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 items-stretch min-h-[500px] snap-x">
        {COLUMNS.map((col, colIndex) => {
          const columnSims = pipelineData.filter(s => s.status === col.id);

          return (
            <div key={col.id} className="flex-1 min-w-[300px] snap-start bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/[0.05] flex flex-col overflow-hidden">
              {/* Column Header */}
              <div className="p-4 border-b border-slate-100 dark:border-white/[0.05] flex items-center justify-between bg-white/50 dark:bg-white/[0.04] backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm">
                  <span className="text-indigo-500">{col.icon}</span>
                  {col.label}
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/50 dark:bg-white/[0.08] px-2.5 py-1 rounded-full">
                  {columnSims.length}
                </span>
              </div>

              {/* Column Body / Cards */}
              <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
                {columnSims.length === 0 ? (
                  <div className="text-center text-xs font-medium text-slate-400 mt-6 px-4">Aucun projet dans cette phase</div>
                ) : (
                  columnSims.map(sim => (
                    <div key={sim.id} className="bg-white dark:bg-[#0B0F19] p-4 rounded-xl border border-slate-200/60 dark:border-white/[0.08] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
                      <div className="flex justify-between items-start mb-4">
                        <button onClick={() => openSimulation(sim.id)} className="font-bold text-sm text-slate-800 dark:text-white hover:text-indigo-600 transition-colors text-left pr-2 truncate">
                          {sim.name}
                        </button>
                        <button
                          onClick={() => toggleAlert(sim.id)}
                          title={sim.hasAlert ? "Désactiver l'alerte" : "Créer une alerte de prix"}
                          className={`p-1.5 rounded-lg transition-colors shrink-0 ${sim.hasAlert ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          {sim.hasAlert ? <BellRing size={14} /> : <Bell size={14} />}
                        </button>
                      </div>

                      <div className="space-y-2.5 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Investissement</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{formatE(sim.investTotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-slate-500 font-medium"><Wallet size={12} /> Cashflow</span>
                          <span className={`font-bold ${sim.cashflowNetNet >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {formatE(sim.cashflowNetNet)}/m
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-slate-500 font-medium"><TrendingUp size={12} /> Renda. Net</span>
                          <span className="font-bold text-indigo-500">{sim.rNet.toFixed(2)}%</span>
                        </div>
                      </div>

                      {/* Card Actions (Move buttons) */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.05]">
                        <button
                          aria-label="Déplacer à l'étape précédente"
                          onClick={() => changeStatus(sim.id, colIndex, -1)}
                          disabled={colIndex === 0}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                          <ArrowLeft size={14} />
                        </button>

                        <button
                          onClick={() => openSimulation(sim.id)}
                          className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          Ouvrir
                        </button>

                        <button
                          aria-label="Déplacer à l'étape suivante"
                          onClick={() => changeStatus(sim.id, colIndex, 1)}
                          disabled={colIndex === COLUMNS.length - 1}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
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
