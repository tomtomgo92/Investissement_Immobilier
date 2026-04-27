import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Home, Users, Receipt, TrendingUp, Landmark, ArrowRightLeft, Plus,
  Building2, Share2, Wallet, BarChart3, Eye, EyeOff, Scale,
  Trash2, PlusCircle, FileText, Wand2, DownloadCloud, Loader2, MapPin, AlertTriangle
} from 'lucide-react';

import {
  REGIME_LABELS, TYPE_LOCATION_LABELS,
  calculateResults, autoEstimateCharges,
  TMI_OPTIONS
} from './utils/finance';
import { useSimulationStore } from './store/useSimulationStore';
import { scrapeUrl } from './utils/scraping';
import { encodeShareCode } from './utils/share';
import { formatE } from './utils/formatters';
import { getMarketData } from './utils/market';

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

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
import BankabilityIndicator from './components/BankabilityIndicator';
import AmortizationChart from './components/AmortizationChart';
import StressTestModule from './components/StressTestModule';
import ReverseCalculator from './components/ReverseCalculator';
import DealPipeline from './components/DealPipeline';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function App() {
  const simulations = useSimulationStore(state => state.simulations);
  const activeSimId = useSimulationStore(state => state.activeSimId);
  const viewMode = useSimulationStore(state => state.viewMode);
  const isDarkMode = useSimulationStore(state => state.isDarkMode);

  const setSimulations = useSimulationStore(state => state.setSimulations);
  const setActiveSimId = useSimulationStore(state => state.setActiveSimId);
  const setViewMode = useSimulationStore(state => state.setViewMode);
  const toggleDarkMode = useSimulationStore(state => state.toggleDarkMode);
  const addSimulation = useSimulationStore(state => state.addSimulation);
  const importSharedSimulation = useSimulationStore(state => state.importSharedSimulation);
  
  const updateData = useSimulationStore(state => state.updateSimulationData);
  const updateCharge = useSimulationStore(state => state.updateCharge);
  const addCharge = useSimulationStore(state => state.addCharge);
  const removeCharge = useSimulationStore(state => state.removeCharge);
  const applyAutoEstimateCharges = useSimulationStore(state => state.applyAutoEstimateCharges);

  // Handle Hash Import on Mount
  useEffect(() => {
    if (window.location.hash) {
      if (importSharedSimulation(window.location.hash)) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [importSharedSimulation]);

  // Ensure activeSimId is set
  useEffect(() => {
    if (!activeSimId && simulations.length > 0) {
      setActiveSimId(simulations[0].id);
    }
  }, [activeSimId, simulations, setActiveSimId]);

  // Backward compatibility: ensure existing simulations have a pipelineStatus
  useEffect(() => {
    let changed = false;
    const updated = simulations.map(sim => {
      if (!sim.pipelineStatus) {
        changed = true;
        return { ...sim, pipelineStatus: 'À analyser' };
      }
      return sim;
    });
    if (changed) setSimulations(updated);
  }, [simulations, setSimulations]);

  const [isGenerating, setIsGenerating] = useState(false);

  // URL Scraping state
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Market Intelligence state
  const [marketData, setMarketData] = useState<any>(null);
  const [, setIsFetchingMarketData] = useState(false);

  const activeSim = simulations.find(s => s.id === activeSimId) || simulations[0];
  const activeSimPostalCode = activeSim?.data?.codePostal;

  // Market Data Fetching Effect
  useEffect(() => {
    if (activeSimPostalCode) {
      setIsFetchingMarketData(true);
      getMarketData(activeSimPostalCode).then((data) => {
        setMarketData(data);
        setIsFetchingMarketData(false);
      });
    } else {
      setMarketData(null);
    }
  }, [activeSimPostalCode]);

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

  const reportRef = useRef<HTMLDivElement>(null);

  // ⚡ Bolt Optimization: Memoize calculations strictly on activeSim.data rather than activeSim.
  const calculations = useMemo(() => activeSim ? calculateResults(activeSim.data) : null, [activeSim?.data]);

  // ⚡ Bolt Optimization: Memoize Chart.js inline config to prevent deep chart re-renders.
  const lineChartData = useMemo(() => ({
    labels: calculations?.projectionData.map(d => `${d.year} an${d.year > 1 ? 's' : ''}`) || [],
    datasets: [
      { label: 'Valeur Nette', data: calculations?.projectionData.map(d => d.netWorth) || [], borderColor: '#6366f1', borderWidth: 3.5, tension: 0.4, pointRadius: (ctx: any) => ctx.dataIndex % 4 === 0 ? 4 : 0, fill: false, hidden: !visibleDimensions.netWorth },
      { label: 'Dette', data: calculations?.projectionData.map(d => d.remainingDebt) || [], borderColor: '#ef4444', borderWidth: 2, borderDash: [6, 6], tension: 0, pointRadius: 0, fill: false, hidden: !visibleDimensions.debt },
      { label: 'Cashflow', data: calculations?.projectionData.map(d => d.cumCashflow) || [], borderColor: '#10b981', borderWidth: 2.5, tension: 0.4, pointRadius: 0, fill: false, hidden: !visibleDimensions.cashflow }
    ]
  }), [calculations?.projectionData, visibleDimensions]);

  const lineChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 10, weight: 600 as const },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      y: {
        grid: { color: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
        ticks: { color: '#94a3b8', font: { weight: 600 as const, size: 10 }, callback: (v: any) => `${v / 1000}k€` }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { weight: 600 as const, size: 10 }, maxTicksLimit: 6 }
      }
    }
  }), [isDarkMode]);


  useEffect(() => {
    if (isGenerating && reportRef.current && activeSim) {
      const generatePdf = async () => {
        try {
          const { default: html2canvas } = await import('html2canvas');
          const { default: jsPDF } = await import('jspdf');

          const canvas = await html2canvas(reportRef.current!, {
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
        } catch (err: any) {
          console.error(err);
          alert("Erreur PDF: " + err.message);
        } finally {
          setIsGenerating(false);
        }
      };
      generatePdf();
    }
  }, [isGenerating, activeSim]);

  const exportSyntheticPDF = () => setIsGenerating(true);

  const shareSimulation = () => {
    if (!activeSim) return;
    const encoded = encodeShareCode(activeSim);
    const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
    navigator.clipboard.writeText(url).then(() => alert('Lien copié dans le presse-papier !'));
  };

  const shareBankerSimulation = () => {
    if (!activeSim) return;
    const encoded = encodeShareCode(activeSim, true);
    const url = `${window.location.origin}${window.location.pathname}#banker=${encoded}`;
    navigator.clipboard.writeText(url).then(() => alert('Lien Banquier copié dans le presse-papier !'));
  };

  const toggleDimension = (dim: keyof typeof visibleDimensions) => setVisibleDimensions(p => ({ ...p, [dim]: !p[dim] }));

  const handleImport = async () => {
    if (!importUrl) return;
    setIsImporting(true);
    try {
      const data = await scrapeUrl(importUrl);

      // Update active simulation with scraped data
      setSimulations(p => p.map(s => {
        if (s.id !== activeSimId) return s;

        let newData = {
          ...s.data,
          prixAchat: data.prixAchat,
          surface: data.surface || s.data.surface,
          codePostal: data.codePostal || s.data.codePostal
        };
        // Estimate charges based on new price and current rents
        const loyerMensuelTotal = s.data.loyers.reduce((acc: number, val: number) => acc + val, 0);
        newData.charges = autoEstimateCharges(data.prixAchat, loyerMensuelTotal);

        // Also update notaire fees
        newData.fraisNotaire = Math.round(data.prixAchat * 0.08);

        return {
          ...s,
          name: data.titre || s.name,
          data: newData
        };
      }));
      setImportUrl('');
    } catch (err: any) {
      alert("Erreur lors de l'import : " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  if (!activeSim || !calculations) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">

      {/* Header Bar */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-6 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-sm">
              <Building2 size={18} />
            </div>
            <input
              value={activeSim.name}
              aria-label="Nom du projet de simulation"
              onChange={(e) => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, name: e.target.value } : s))}
              className="text-lg font-bold text-slate-800 dark:text-white bg-transparent border-none focus:ring-0 p-0 w-48 sm:w-64 outline-none"
            />
          </div>

          <nav role="tablist" aria-label="Projets de simulation" className="hidden md:flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl">
            {simulations.map(sim => (
              <button
                key={sim.id}
                role="tab"
                aria-selected={activeSimId === sim.id}
                onClick={() => setActiveSimId(sim.id)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800 ${activeSimId === sim.id ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                {sim.name}
              </button>
            ))}
            <button
              aria-label="Créer un nouveau projet"
              onClick={addSimulation}
              className="px-3 text-indigo-500 hover:text-indigo-600 transition-colors rounded-lg"
            >
              <Plus size={16} />
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Activer le mode sombre/clair"
            onClick={toggleDarkMode}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {isDarkMode ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
          <button
            onClick={() => setViewMode(viewMode === 'pipeline' ? 'dashboard' : 'pipeline')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'pipeline' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300 shadow-sm' : 'border-slate-200/50 dark:border-slate-800/50 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <BarChart3 size={14} /> Pipeline
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'comparator' ? 'dashboard' : 'comparator')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'comparator' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300 shadow-sm' : 'border-slate-200/50 dark:border-slate-800/50 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Scale size={14} /> Comparer
          </button>
          <button
            onClick={shareSimulation}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200/50 dark:border-slate-800/50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Share2 size={14} /> Partager
          </button>
          <button
            onClick={exportSyntheticPDF}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-[0_2px_10px_rgba(79,70,229,0.2)] active:scale-95"
          >
            {isGenerating ? <div className="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full" /> : <><FileText size={14} /> Exporter PDF</>}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto w-full p-6 space-y-8 animate-in fade-in duration-700">

        {viewMode === 'pipeline' ? (
          <DealPipeline
            simulations={simulations}
            setSimulations={setSimulations}
            setActiveSimId={setActiveSimId}
            setViewMode={setViewMode}
          />
        ) : viewMode === 'comparator' ? (
          <ScenarioComparator
            simulations={simulations}
            activeSimId={activeSimId}
            setActiveSimId={(id: string) => { setActiveSimId(id); setViewMode('dashboard'); }}
          />
        ) : activeSim.isBanker ? (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-8 text-center shadow-sm">
              <div className="inline-flex p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 mb-6">
                <Landmark size={40} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">Espace Banquier</h1>
              <p className="text-sm text-indigo-600 dark:text-indigo-300 mt-2">Vue simplifiée. Ajustez les conditions de financement ci-dessous pour voir l'impact immédiat.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <HeroKPI label="Cashflow Net" value={formatE(calculations.cashflowM)} color={calculations.cashflowM >= 0 ? "emerald" : "rose"} icon={<ArrowRightLeft />} highlight />
              <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-slate-800/50 p-6 shadow-sm">
                <BankabilityIndicator bankability={calculations.bankability} />
              </div>
            </div>

            <DashboardSection title="Financement (Modifiable)" icon={<Landmark size={18} className="text-amber-500" />}>
              <PremiumInput label="Apport Personnel" value={activeSim.data.apport} onChange={(v) => updateData('apport', Number(v))} />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <PremiumInput label="Taux %" value={activeSim.data.tauxInteret} onChange={(v) => updateData('tauxInteret', Number(v))} suffix="%" />
                <PremiumInput label="Durée" value={activeSim.data.dureeCredit} onChange={(v) => updateData('dureeCredit', Number(v))} suffix="Ans" />
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={shareBankerSimulation}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Share2 size={16} /> Copier mon offre modifiée
                </button>
              </div>
            </DashboardSection>

            <DashboardSection title="Détails du Projet (Lecture Seule)" icon={<Home size={18} className="text-indigo-500" />}>
               <div className="grid grid-cols-2 gap-6 text-sm">
                 <div>
                   <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-widest mb-1">Prix d'Achat</span>
                   <span className="font-bold text-lg text-slate-800 dark:text-white">{formatE(activeSim.data.prixAchat)}</span>
                 </div>
                 <div>
                   <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-widest mb-1">Travaux</span>
                   <span className="font-bold text-lg text-slate-800 dark:text-white">{formatE(activeSim.data.travaux)}</span>
                 </div>
                 <div>
                   <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-widest mb-1">Revenus Locatifs Brut/Mois</span>
                   <span className="font-bold text-lg text-slate-800 dark:text-white">{formatE(calculations.recetteMensuelleBrute)}</span>
                 </div>
                 <div>
                   <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-widest mb-1">Charges Annuelles</span>
                   <span className="font-bold text-lg text-slate-800 dark:text-white">{formatE(calculations.totalChargesAnnuelles)}</span>
                 </div>
               </div>
            </DashboardSection>
          </div>
        ) : (
          <>
            {/* URL Import Banner */}
            <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <DownloadCloud size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">Import Magique</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Collez un lien Leboncoin ou SeLoger pour pré-remplir l'analyse.</p>
                </div>
              </div>
              <div className="flex w-full sm:w-auto gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                <input
                  type="url"
                  placeholder="https://www.leboncoin.fr/ad/..."
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  className="flex-1 sm:w-64 text-sm bg-transparent border-none px-3 py-2 focus:ring-0 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
                />
                <button
                  onClick={handleImport}
                  disabled={!importUrl || isImporting}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-sm"
                >
                  {isImporting ? <Loader2 size={16} className="animate-spin" /> : "Importer"}
                </button>
              </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <HeroKPI label="Cashflow Net" value={formatE(calculations.cashflowM)} color={calculations.cashflowM >= 0 ? "emerald" : "rose"} icon={<ArrowRightLeft />} highlight sub="Projection Mensuelle" />
              <HeroKPI label="Cashflow Net-Net" value={formatE(calculations.cashflowNetNet)} color={calculations.cashflowNetNet >= 0 ? "indigo" : "slate"} icon={<Wallet />} sub={`Pression Fiscale (TMI ${activeSim.data.tmi}%)`} />
              <HeroKPI label="Rendement Net" value={`${calculations.rNet.toFixed(2)}%`} color="emerald" icon={<TrendingUp />} sub="Performance Annuelle" />
              <HeroKPI label="Enrichissement" value={formatE(calculations.beneficeAn * 20 + (calculations.investTotal - activeSim.data.apport))} color="indigo" icon={<Building2 />} sub="Projection à 20 ans" />
            </div>

            {/* Input Zones */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              <div className="space-y-8 flex flex-col">
                <DashboardSection title="Patrimoine" icon={<Home size={18} />}>
                  <PremiumInput label="Code Postal" value={activeSim.data.codePostal} onChange={(v) => updateData('codePostal', v)} suffix="" />
                  <PremiumInput label="Surface" value={activeSim.data.surface} onChange={(v) => updateData('surface', Number(v))} suffix="m²" />
                  <PremiumInput label="Prix d'achat" value={activeSim.data.prixAchat} onChange={(v) => updateData('prixAchat', Number(v))} tooltip="Prix hors frais d'agence" />
                  <PremiumInput label="Travaux" value={activeSim.data.travaux} onChange={(v) => updateData('travaux', Number(v))} tooltip="Rénovation et ameublement" />
                  <PremiumInput label="Frais Notaire" value={activeSim.data.fraisNotaire} onChange={(v) => updateData('fraisNotaire', Number(v))} tooltip="Estimation automatique à 8%" />
                  <div className="mt-6 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Coût Total Projet</span>
                    <span className="text-xl font-bold text-slate-800 dark:text-white">{formatE(calculations.investTotal)}</span>
                  </div>
                </DashboardSection>

                <DashboardSection title="Banque" icon={<Landmark size={18} className="text-slate-400" />}>
                  <PremiumInput label="Apport Personnel" value={activeSim.data.apport} onChange={(v) => updateData('apport', Number(v))} />
                  <div className="grid grid-cols-2 gap-4">
                    <PremiumInput label="Taux %" value={activeSim.data.tauxInteret} onChange={(v) => updateData('tauxInteret', Number(v))} suffix="%" />
                    <PremiumInput label="Durée" value={activeSim.data.dureeCredit} onChange={(v) => updateData('dureeCredit', Number(v))} suffix="Ans" />
                  </div>
                  <div className="pt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Auto-Calcul</span>
                      <Toggle active={activeSim.data.autoCredit} ariaLabel="Auto-calcul de la mensualité de crédit" onToggle={() => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, autoCredit: !s.data.autoCredit } } : s))} />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mensualité Estimée</p>
                      <p className="text-xl font-bold text-slate-800 dark:text-white">{formatE(calculations.mCredit)}</p>
                    </div>
                  </div>
                </DashboardSection>

                {/* Bankability Section */}
                <DashboardSection title="Profil Investisseur" icon={<Users size={18} className="text-slate-400" />} className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                     <PremiumInput label="Revenus Foyer" value={activeSim.data.revenusFoyer} onChange={(v) => updateData('revenusFoyer', Number(v))} tooltip="Revenus nets mensuels avant impôt" />
                     <PremiumInput label="Charges Actuelles" value={activeSim.data.chargesFoyer} onChange={(v) => updateData('chargesFoyer', Number(v))} tooltip="Crédits en cours + Loyer RP" />
                  </div>
                  <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <BankabilityIndicator bankability={calculations.bankability} />
                  </div>
                </DashboardSection>
              </div>

              <div className="space-y-8 flex flex-col">
                <DashboardSection title="Fiscalité & Taxes" icon={<Scale size={18} className="text-slate-400" />}>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type de Location</label>
                    </div>
                    <select
                      value={activeSim.data.typeLocation || 'meuble_long'}
                      onChange={(e) => updateData('typeLocation', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
                    >
                      {Object.entries(TYPE_LOCATION_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 mt-5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Régime Fiscal</label>
                    </div>
                    <select
                      value={activeSim.data.regimeFiscal || 'auto'}
                      onChange={(e) => updateData('regimeFiscal', e.target.value)}
                       className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
                       style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
                    >
                      {Object.entries(REGIME_LABELS).map(([k, v]) => {
                         const typeLoc = activeSim.data.typeLocation || 'meuble_long';
                         let isValid = true;
                         if (k !== 'auto') {
                             if (typeLoc === 'nue') {
                                isValid = ['micro_foncier', 'foncier_reel', 'sci_ir', 'sci_is'].includes(k);
                                if (calculations.recetteAnnuelle > 15000 && k === 'micro_foncier') isValid = false;
                             } else {
                                isValid = ['micro_bic', 'bic_reel', 'sci_is'].includes(k);
                                const limit = (typeLoc === 'courte_duree') ? 15000 : 77700;
                                if (calculations.recetteAnnuelle > limit && k === 'micro_bic') isValid = false;
                             }
                         }
                         return isValid ? <option key={k} value={k}>{v}</option> : null;
                      })}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 mt-5">
                    <div className="flex justify-between items-center px-1">
                      <label id="tmi-label" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tranche TMI</label>
                      <InfoTooltip text="Votre tranche marginale d'imposition (0, 11, 30, 41, 45%)" />
                    </div>
                    <div role="tablist" aria-labelledby="tmi-label" className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl gap-1 border border-slate-100 dark:border-slate-700">
                      {TMI_OPTIONS.map(t => (
                        <button
                          key={t}
                          role="tab"
                          aria-selected={activeSim.data.tmi === t}
                          onClick={() => updateData('tmi', t)}
                          className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800 ${activeSim.data.tmi === t ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        >
                          {t}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6">
                    <PremiumInput label="Vacance Locative" value={activeSim.data.vacanceLocative} onChange={(v) => updateData('vacanceLocative', Number(v))} suffix="%" />
                  </div>
                </DashboardSection>

                <DashboardSection
                  title="Détail Charges (An)"
                  icon={<Receipt size={18} className="text-slate-400" />}
                  className="flex-1"
                  rightElement={
                    <div className="flex items-center gap-3">
                      <button aria-label="Auto-estimer les charges" onClick={applyAutoEstimateCharges} className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
                        <Wand2 size={12} /> Auto
                      </button>
                      <button aria-label="Ajouter une charge" onClick={addCharge} className="text-indigo-500 hover:text-indigo-600 transition-colors bg-indigo-50 dark:bg-indigo-900/30 p-1.5 rounded-lg"><Plus size={16} /></button>
                    </div>
                  }
                >
                  <div className="space-y-4 pr-1">
                    {activeSim.data.charges.map((c: any) => (
                      <div key={c.id} className="group relative">
                        <div className="flex items-center gap-3">
                          <input
                            value={c.name}
                            aria-label={`Nom de la charge ${c.name}`}
                            onChange={(e) => updateCharge(c.id, 'name', e.target.value)}
                            className="bg-transparent border-none text-xs font-bold text-slate-500 uppercase tracking-wider p-0 focus:ring-0 flex-1 placeholder-slate-300 outline-none"
                            placeholder="Nom..."
                          />
                          <div className="relative w-32">
                            <input
                              type="number"
                              value={c.value}
                              aria-label={`Valeur de la charge ${c.name}`}
                              onChange={(e) => updateCharge(c.id, 'value', Number(e.target.value))}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 dark:text-white pr-8 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                            <span aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">€</span>
                          </div>
                          <button aria-label={`Supprimer la charge ${c.name}`} onClick={() => removeCharge(c.id)} className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity bg-rose-50 dark:bg-rose-900/30 p-2 rounded-lg">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardSection>
              </div>

              <div className="space-y-8 flex flex-col">
                <DashboardSection
                  title="Revenus Locatifs"
                  icon={<Users size={18} className="text-slate-400" />}
                  className="flex-1"
                  rightElement={
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                      <button aria-label="Diminuer le nombre de colocataires" onClick={() => { const c = Math.max(0, activeSim.data.nbColocs - 1); setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, nbColocs: c, loyers: s.data.loyers.slice(0, c) } } : s)); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all text-slate-500">-</button>
                      <button aria-label="Augmenter le nombre de colocataires" onClick={() => { const c = activeSim.data.nbColocs + 1; setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, nbColocs: c, loyers: [...s.data.loyers, 0] } } : s)); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all">+</button>
                    </div>
                  }
                >
                  <div className="space-y-4 pr-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
                      <span>Unité</span>
                      <span>Loyer Mensuel</span>
                    </div>
                    {activeSim.data.loyers.map((l: number, i: number) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">{i + 1}</div>
                        <div className="relative flex-1">
                          <input
                            type="number"
                            value={l}
                            aria-label={`Loyer de l'unité ${i + 1}`}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value) || 0;
                              setSimulations(p => p.map(s => {
                                if (s.id !== activeSimId) return s;
                                const nl = [...s.data.loyers];
                                nl[i] = v;
                                return { ...s, data: { ...s.data, loyers: nl } };
                              }));
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          />
                          <span aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium pointer-events-none">€</span>
                        </div>
                      </div>
                    ))}

                    <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Mensuel</span>
                        <span className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{formatE(calculations.recetteMensuelleBrute)}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-200/50 dark:border-slate-700 pt-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Annuel (Estimé)</span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{formatE(calculations.recetteAnnuelle)} / an</span>
                      </div>
                    </div>

                    {marketData && activeSim.data.surface > 0 && (() => {
                      const rentPerSqm = calculations.recetteMensuelleBrute / activeSim.data.surface;
                      const isHigh = rentPerSqm > marketData.avgRentPerSqm * 1.15;
                      const isLow = rentPerSqm < marketData.avgRentPerSqm * 0.85;

                      return (
                        <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 text-xs ${isHigh ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200' : isLow ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200' : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'}`}>
                          <div className="mt-0.5"><MapPin size={16} /></div>
                          <div>
                            <p className="font-bold text-sm">Benchmarking Local ({marketData.marketName})</p>
                            <div className="mt-2 space-y-1">
                                <p className="opacity-90 flex justify-between">Loyer marché moy: <span className="font-bold">{marketData.avgRentPerSqm}€/m²</span></p>
                                <p className="opacity-90 flex justify-between">Votre estimation: <span className="font-bold">{rentPerSqm.toFixed(1)}€/m²</span></p>
                            </div>
                            {isHigh && <p className="mt-3 font-bold flex items-center gap-1.5"><AlertTriangle size={14} /> Loyer visé très optimiste par rapport au marché.</p>}
                            {isLow && <p className="mt-3 font-bold flex items-center gap-1.5"><AlertTriangle size={14} /> Loyer visé sous-évalué, potentiel d'optimisation.</p>}
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                </DashboardSection>
              </div>

            </div>

            {/* Projection Chart & Amortization Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-2xl border border-white/50 dark:border-slate-800/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 block group-hover:text-indigo-500 transition-colors">Analyse Patrimoniale</span>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">Trajectoire 20 ans</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <DimensionToggle active={visibleDimensions.netWorth} onClick={() => toggleDimension('netWorth')} dot="bg-indigo-500" label="Nette" />
                      <DimensionToggle active={visibleDimensions.debt} onClick={() => toggleDimension('debt')} dot="bg-rose-500" label="Dette" />
                      <DimensionToggle active={visibleDimensions.cashflow} onClick={() => toggleDimension('cashflow')} dot="bg-emerald-500" label="Cash" />
                    </div>
                  </div>

                  <div className="w-full h-[300px] relative">
                    <Line
                      data={lineChartData}
                      options={lineChartOptions}
                    />
                  </div>
                </section>

                <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-2xl border border-white/50 dark:border-slate-800/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 group">
                    <div className="mb-8">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 block group-hover:text-amber-500 transition-colors">Structure Fiscale</span>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Amortissement & Impôts</h2>
                    </div>
                    <AmortizationChart data={calculations.projectionData} isDarkMode={isDarkMode} />
                </section>
            </div>

            {/* Calculation Breakdown */}
            <CalculationBreakdown
              data={activeSim.data}
              calculations={calculations}
              formatE={formatE}
            />

            {/* Reverse Calculator (Objectif & Négociation) */}
            <ReverseCalculator
              data={activeSim.data}
              onApplyMaxPrice={(price) => updateData('prixAchat', price)}
              onApplyMinRent={(rent) => {
                 setSimulations(p => p.map(s => {
                    if (s.id !== activeSimId) return s;
                    return { ...s, data: { ...s.data, loyers: s.data.loyers.map(() => rent) } };
                 }));
              }}
            />

            {/* Stress Test Module */}
            <StressTestModule
              data={activeSim.data}
              formatE={formatE}
            />
          </>
        )}

        <footer className="pt-16 pb-12 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em]">
          <div>© 2026 - Simulateur d'Investissement</div>
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" /> Optimisé</span>
            <span className="text-slate-300 dark:text-slate-600">v2.0.0</span>
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
