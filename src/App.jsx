import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Home, Euro, Users, Receipt, TrendingUp, Landmark, ArrowRightLeft, Plus,
  Building2, Download, Share2, Wallet, X, BarChart3, Eye, EyeOff, Info, Scale,
  Trash2, PlusCircle, PieChart, Calculator, FileText
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Utilities
import {
  INITIAL_DATA, INITIAL_CHARGES, TMI_OPTIONS,
  calculateResults, updateSimulationData
} from './utils/finance';
import { encodeShareCode, decodeShareCode } from './utils/share';
import { formatE } from './utils/formatters';

// Components
import DashboardSection from './components/GlassSection';
import PremiumInput from './components/PremiumInput';
import InfoTooltip from './components/InfoTooltip';
import HeroKPI from './components/HeroKPI';
import Toggle from './components/Toggle';
import DimensionToggle from './components/DimensionToggle';
import CalculationBreakdown from './components/CalculationBreakdown';
import PdfReport from './components/PdfReport';
import ScenarioComparator from './components/ScenarioComparator';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function App() {
  const [viewMode, setViewMode] = useState('dashboard');

  // --- State Initialization with Persistence & Share Logic ---
  const [simulations, setSimulations] = useState(() => {
    // 1. Check for shared data in URL
    if (window.location.hash.startsWith('#share=')) {
      const encoded = window.location.hash.replace('#share=', '');
      const sharedSim = decodeShareCode(encoded);
      if (sharedSim) {
        window.history.replaceState(null, '', window.location.pathname);
        return [sharedSim];
      }
    }
    // 2. Check local storage
    const saved = localStorage.getItem('invest_simulations');
    if (saved) return JSON.parse(saved);

    // 3. Default fallback
    return [{ id: uuidv4(), name: 'Investissement Lyon 3', data: { ...INITIAL_DATA } }];
  });

  const [activeSimId, setActiveSimId] = useState(() => simulations[0]?.id || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Auto-Save Effect
  useEffect(() => {
    localStorage.setItem('invest_simulations', JSON.stringify(simulations));
  }, [simulations]);

  // Dark Mode Toggle Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Graph visibility state
  const [visibleDimensions, setVisibleDimensions] = useState({
    netWorth: true,
    debt: true,
    cashflow: true,
    charges: false
  });

  const reportRef = useRef(null);
  const activeSim = simulations.find(s => s.id === activeSimId) || simulations[0];

  const calculations = useMemo(() => calculateResults(activeSim.data), [activeSim]);

  const updateData = (f, v) => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: updateSimulationData(s.data, f, v) } : s));

  const updateCharge = (id, field, value) => {
    setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, charges: s.data.charges.map(c => c.id === id ? { ...c, [field]: field === 'value' ? (parseFloat(value) || 0) : value } : c) } } : s));
  };

  const addCharge = () => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, charges: [...s.data.charges, { id: uuidv4(), name: 'Nouvelle Charge', value: 0 }] } } : s));

  const removeCharge = (id) => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, charges: s.data.charges.filter(c => c.id !== id) } } : s));

  useEffect(() => {
    if (isGenerating && reportRef.current) {
      const generatePdf = async () => {
        try {
          const canvas = await html2canvas(reportRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: 1200,
            onclone: (clonedDoc) => {
              // Remove all styles/links to prevent oklch parsing errors
              const styles = clonedDoc.getElementsByTagName('style');
              for (let i = styles.length - 1; i >= 0; i--) styles[i].remove();
              const links = clonedDoc.getElementsByTagName('link');
              for (let i = links.length - 1; i >= 0; i--) links[i].remove();
            }
          });
          const pdf = new jsPDF('p', 'mm', 'a4');
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
          pdf.save(`Simu_${activeSim.name}.pdf`);
        } catch (err) {
          console.error(err);
          alert("Erreur PDF: " + err.message);
        } finally {
          setIsGenerating(false);
        }
      };
      generatePdf();
    }
  }, [isGenerating, activeSim.name]);

  const exportSyntheticPDF = () => setIsGenerating(true);

  const shareSimulation = () => {
    const encoded = encodeShareCode(activeSim);
    const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
    navigator.clipboard.writeText(url).then(() => alert('Lien copié dans le presse-papier !'));
  };

  const toggleDimension = (dim) => setVisibleDimensions(p => ({ ...p, [dim]: !p[dim] }));

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">

      {/* Header Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-lg">
              <Building2 size={20} />
            </div>
            <input
              value={activeSim.name}
              onChange={(e) => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, name: e.target.value } : s))}
              className="text-lg font-bold text-primary dark:text-white bg-transparent border-none focus:ring-0 p-0 w-48 sm:w-64"
            />
          </div>

          <nav className="hidden md:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {simulations.map(sim => (
              <button
                key={sim.id}
                onClick={() => setActiveSimId(sim.id)}
                className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeSimId === sim.id ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                {sim.name}
              </button>
            ))}
            <button
              onClick={() => {
                const n = {
                  id: uuidv4(),
                  name: `Projet ${simulations.length + 1}`,
                  data: { ...INITIAL_DATA, charges: JSON.parse(JSON.stringify(INITIAL_CHARGES)) }
                };
                setSimulations([...simulations, n]);
                setActiveSimId(n.id);
              }}
              className="px-2 text-accent"
            >
              <Plus size={16} />
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-slate-400 hover:text-primary dark:hover:text-white transition-colors"
          >
            {isDarkMode ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          <button
            onClick={() => setViewMode(viewMode === 'dashboard' ? 'comparator' : 'dashboard')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'comparator' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Scale size={14} /> {viewMode === 'dashboard' ? 'Comparer' : 'Tableau de Bord'}
          </button>
          <button
            onClick={shareSimulation}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Share2 size={14} /> Partager
          </button>
          <button
            onClick={exportSyntheticPDF}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-sm active:scale-95"
          >
            {isGenerating ? <div className="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full" /> : <><FileText size={14} /> Exporter PDF</>}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto w-full p-6 space-y-8 animate-in fade-in duration-700">

        {viewMode === 'comparator' ? (
          <ScenarioComparator
            simulations={simulations}
            activeSimId={activeSimId}
            setActiveSimId={(id) => { setActiveSimId(id); setViewMode('dashboard'); }}
          />
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <HeroKPI label="Cashflow Net" value={formatE(calculations.cashflowM)} color={calculations.cashflowM >= 0 ? "emerald" : "rose"} icon={<ArrowRightLeft />} highlight sub="Projection Mensuelle" />
              <HeroKPI label="Cashflow Net-Net" value={formatE(calculations.cashflowNetNet)} color={calculations.cashflowNetNet >= 0 ? "indigo" : "slate"} icon={<Wallet />} sub={`Pression Fiscale (TMI ${activeSim.data.tmi}%)`} />
              <HeroKPI label="Rendement Net" value={`${calculations.rNet.toFixed(2)}%`} color="emerald" icon={<TrendingUp />} sub="Performance Annuelle" />
              <HeroKPI label="Enrichissement" value={formatE(calculations.beneficeAn * 20 + (calculations.investTotal - activeSim.data.apport))} color="indigo" icon={<Building2 />} sub="Projection à 20 ans" />
            </div>

            {/* Input Zones */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              <div className="space-y-8">
                <DashboardSection title="Patrimoine" icon={<Home size={18} className="text-accent" />}>
                  <PremiumInput label="Prix d'achat" value={activeSim.data.prixAchat} onChange={(v) => updateData('prixAchat', v)} tooltip="Prix hors frais d'agence" />
                  <PremiumInput label="Travaux" value={activeSim.data.travaux} onChange={(v) => updateData('travaux', v)} tooltip="Rénovation et ameublement" />
                  <PremiumInput label="Frais Notaire" value={activeSim.data.fraisNotaire} onChange={(v) => updateData('fraisNotaire', v)} tooltip="Estimation automatique à 8%" />
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Coût Total Projet</span>
                    <span className="text-lg font-bold text-primary dark:text-white">{formatE(calculations.investTotal)}</span>
                  </div>
                </DashboardSection>

                <DashboardSection title="Banque" icon={<Landmark size={18} className="text-amber-500" />}>
                  <PremiumInput label="Apport Personnel" value={activeSim.data.apport} onChange={(v) => updateData('apport', v)} />
                  <div className="grid grid-cols-2 gap-4">
                    <PremiumInput label="Taux %" value={activeSim.data.tauxInteret} onChange={(v) => updateData('tauxInteret', v)} suffix="%" />
                    <PremiumInput label="Durée" value={activeSim.data.dureeCredit} onChange={(v) => updateData('dureeCredit', v)} suffix="Ans" />
                  </div>
                  <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">Auto-Calcul</span>
                      <Toggle active={activeSim.data.autoCredit} onToggle={() => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, autoCredit: !s.data.autoCredit } } : s))} />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400">Mensualité Estimée</p>
                      <p className="text-lg font-bold text-primary dark:text-white">{formatE(calculations.mCredit)}</p>
                    </div>
                  </div>
                </DashboardSection>
              </div>

              <div className="space-y-8">
                <DashboardSection title="Fiscalité & Taxes" icon={<Scale size={18} className="text-rose-500" />}>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Tranche TMI</label>
                      <InfoTooltip text="Votre tranche marginale d'imposition (0, 11, 30, 41, 45%)" />
                    </div>
                    <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-lg gap-1">
                      {TMI_OPTIONS.map(t => (
                        <button
                          key={t}
                          onClick={() => updateData('tmi', t)}
                          className={`flex-1 py-2 rounded-md text-[10px] font-bold transition-all ${activeSim.data.tmi === t ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {t}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <PremiumInput label="Vacance Locative" value={activeSim.data.vacanceLocative} onChange={(v) => updateData('vacanceLocative', v)} suffix="%" />
                </DashboardSection>

                <DashboardSection
                  title="Détail Charges (An)"
                  icon={<Receipt size={18} className="text-rose-500" />}
                  rightElement={<button onClick={addCharge} className="text-accent hover:opacity-80"><PlusCircle size={20} /></button>}
                >
                  <div className="space-y-3 pr-2">
                    {activeSim.data.charges.map((c) => (
                      <div key={c.id} className="group relative">
                        <div className="flex items-center gap-3">
                          <input
                            value={c.name}
                            onChange={(e) => updateCharge(c.id, 'name', e.target.value)}
                            className="bg-transparent border-none text-[10px] font-bold text-slate-400 uppercase p-0 focus:ring-0 flex-1"
                          />
                          <div className="relative w-32">
                            <input
                              type="number"
                              value={c.value}
                              onChange={(e) => updateCharge(c.id, 'value', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-white pr-8"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 leading-none">€</span>
                          </div>
                          <button onClick={() => removeCharge(c.id)} className="opacity-0 group-hover:opacity-100 text-danger hover:text-red-600 transition-opacity">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardSection>
              </div>

              <div className="space-y-8">
                <DashboardSection
                  title="Revenus Locatifs"
                  icon={<Users size={18} className="text-success" />}
                  rightElement={
                    <div className="flex items-center gap-2">
                      <button onClick={() => { const c = Math.max(0, activeSim.data.nbColocs - 1); setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, nbColocs: c, loyers: s.data.loyers.slice(0, c) } } : s)); }} className="w-6 h-6 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-500">-</button>
                      <button onClick={() => { const c = activeSim.data.nbColocs + 1; setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, nbColocs: c, loyers: [...s.data.loyers, 0] } } : s)); }} className="w-6 h-6 flex items-center justify-center bg-success text-white rounded hover:opacity-90 shadow-sm transition-all">+</button>
                    </div>
                  }
                >
                  <div className="space-y-4 pr-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                      <span>Unité</span>
                      <span>Loyer Mensuel</span>
                    </div>
                    {activeSim.data.loyers.map((l, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                        <div className="relative flex-1">
                          <input
                            type="number"
                            value={l}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value) || 0;
                              setSimulations(p => p.map(s => {
                                if (s.id !== activeSimId) return s;
                                const nl = [...s.data.loyers];
                                nl[i] = v;
                                return { ...s, data: { ...s.data, loyers: nl } };
                              }));
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-bold text-primary dark:text-white"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">€</span>
                        </div>
                      </div>
                    ))}

                    <div className="mt-8 p-5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Total Mensuel</span>
                        <span className="text-xl font-bold text-primary dark:text-white">{formatE(calculations.recetteMensuelleBrute)}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Annuel (Estimé)</span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{formatE(calculations.recetteAnnuelle)} / an</span>
                      </div>
                    </div>
                  </div>
                </DashboardSection>
              </div>

            </div>

            {/* Projection Chart */}
            <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1 block">Analyse Patrimoniale</span>
                  <h2 className="text-xl font-bold text-primary dark:text-white">Projection 20 ans</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <DimensionToggle active={visibleDimensions.netWorth} onClick={() => toggleDimension('netWorth')} dot="bg-accent" label="Nette" />
                  <DimensionToggle active={visibleDimensions.debt} onClick={() => toggleDimension('debt')} dot="bg-danger" label="Dette" />
                  <DimensionToggle active={visibleDimensions.cashflow} onClick={() => toggleDimension('cashflow')} dot="bg-success" label="Cash" />
                </div>
              </div>

              <div className="w-full h-[450px] relative">
                <Line
                  data={{
                    labels: calculations.projectionData.map(d => `${d.year} an${d.year > 1 ? 's' : ''}`),
                    datasets: [
                      { label: 'Valeur Nette', data: calculations.projectionData.map(d => d.netWorth), borderColor: '#6366f1', borderWidth: 3.5, tension: 0.4, pointRadius: (ctx) => ctx.dataIndex % 4 === 0 ? 4 : 0, fill: false, hidden: !visibleDimensions.netWorth },
                      { label: 'Dette', data: calculations.projectionData.map(d => d.remainingDebt), borderColor: '#ef4444', borderWidth: 2, borderDash: [6, 6], tension: 0, pointRadius: 0, fill: false, hidden: !visibleDimensions.debt },
                      { label: 'Cashflow', data: calculations.projectionData.map(d => d.cumCashflow), borderColor: '#10b981', borderWidth: 2.5, tension: 0.4, pointRadius: 0, fill: false, hidden: !visibleDimensions.cashflow }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { size: 10, weight: 'bold' },
                        bodyFont: { size: 12 }
                      }
                    },
                    scales: {
                      y: {
                        grid: { color: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
                        ticks: { color: '#94a3b8', font: { weight: 'bold', size: 10 }, callback: (v) => `${v / 1000}k€` }
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { weight: 'bold', size: 10 }, maxTicksLimit: 6 }
                      }
                    }
                  }}
                />
              </div>
            </section>

            {/* Calculation Breakdown */}
            <CalculationBreakdown
              data={activeSim.data}
              calculations={calculations}
              formatE={formatE}
            />
          </>
        )}

        <footer className="pt-12 pb-16 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
          <div>© 2026 - Simulateur d'Investissement Analyste Pro</div>
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-success" /> Système Connecté</span>
            <span className="text-slate-300 dark:text-slate-600">v1.2.0 - Optimisé par Stitch</span>
          </div>
        </footer>
      </main>

      {/* SYNTHETIC PDF TEMPLATE (LAZY LOADED) */}
      {isGenerating && (
        <div className="fixed left-[-9999px] top-0 pointer-events-none">
          <PdfReport ref={reportRef} activeSim={activeSim} calculations={calculations} />
        </div>
      )}
    </div>
  );
}
