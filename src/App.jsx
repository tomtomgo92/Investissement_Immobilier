import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Calculator, Home, Euro, Percent, Users, Receipt, CreditCard, ShieldCheck,
  TrendingUp, Landmark, ArrowRightLeft, Plus, Building2,
  Download, Share2, ChevronDown, Sparkles, CheckCircle2,
  Wallet, X, AlertTriangle, BarChart3, LayoutDashboard, Eye, EyeOff, Info, Scale
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const INITIAL_CHARGES = [
  { id: uuidv4(), name: 'Copropriété', value: 2733 },
  { id: uuidv4(), name: 'Taxe Foncière', value: 1170 },
  { id: uuidv4(), name: 'Assurance PNO', value: 159.81 },
  { id: uuidv4(), name: 'Électricité', value: 600 },
  { id: uuidv4(), name: 'Eau', value: 696 },
  { id: uuidv4(), name: 'Internet', value: 420 },
  { id: uuidv4(), name: 'CFE', value: 354 },
  { id: uuidv4(), name: 'Comptabilité', value: 289 },
];

const INITIAL_DATA = {
  prixAchat: 92000, travaux: 20000, fraisNotaire: 7360, apport: 15000,
  tauxInteret: 3.85, dureeCredit: 20, mensualiteCredit: 567,
  autoCredit: true, nbColocs: 3, loyers: [493, 493, 493],
  charges: [...INITIAL_CHARGES],
  vacanceLocative: 5,
  tmi: 30, // Tranche Marginale d'Imposition default
};

const TMI_OPTIONS = [0, 11, 30, 41, 45];

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export default function App() {
  // --- State Initialization with Persistence & Share Logic ---
  const [simulations, setSimulations] = useState(() => {
    // 1. Check for shared data in URL
    if (window.location.hash.startsWith('#share=')) {
      try {
        const encoded = window.location.hash.replace('#share=', '');
        const json = atob(encoded);
        const sharedSim = JSON.parse(json);
        // Clean URL
        window.history.replaceState(null, '', window.location.pathname);
        return [sharedSim]; // Load shared sim as the only one
      } catch (e) {
        console.error("Failed to load shared simulation", e);
      }
    }
    // 2. Check local storage
    const saved = localStorage.getItem('invest_simulations');
    if (saved) return JSON.parse(saved);

    // 3. Default fallback
    return [{ id: uuidv4(), name: 'Appart Lyon 3', data: { ...INITIAL_DATA } }];
  });

  const [activeSimId, setActiveSimId] = useState(() => simulations[0]?.id || null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-Save Effect
  useEffect(() => {
    localStorage.setItem('invest_simulations', JSON.stringify(simulations));
  }, [simulations]);

  // Graph visibility state
  const [visibleDimensions, setVisibleDimensions] = useState({
    netWorth: true,
    debt: true,
    cashflow: true,
    charges: false
  });

  const reportRef = useRef(null);
  const activeSim = simulations.find(s => s.id === activeSimId) || simulations[0];

  const calculations = useMemo(() => {
    const d = activeSim.data;
    const investTotal = d.prixAchat + d.travaux + d.fraisNotaire;
    const loanAmount = Math.max(0, investTotal - d.apport);
    const rMensuel = d.tauxInteret / 100 / 12;
    const nMensuel = d.dureeCredit * 12;

    let mCredit = d.mensualiteCredit;
    if (d.autoCredit) {
      if (nMensuel > 0) {
        mCredit = rMensuel === 0 ? loanAmount / nMensuel : (loanAmount * rMensuel * Math.pow(1 + rMensuel, nMensuel)) / (Math.pow(1 + rMensuel, nMensuel) - 1);
      } else mCredit = 0;
    }

    const recetteMensuelleBrute = d.loyers.reduce((acc, curr) => acc + curr, 0);
    const recetteMensuelleRéelle = recetteMensuelleBrute * (1 - (d.vacanceLocative / 100));
    const recetteAnnuelle = recetteMensuelleRéelle * 12;
    const totalChargesAnnuelles = d.charges.reduce((acc, c) => acc + c.value, 0);
    const creditAnnee = mCredit * 12;

    const rBrute = investTotal > 0 ? ((recetteMensuelleBrute * 12) / investTotal) * 100 : 0;
    const rNet = investTotal > 0 ? ((recetteAnnuelle - totalChargesAnnuelles) / investTotal) * 100 : 0;
    const beneficeAn = recetteAnnuelle - (creditAnnee + totalChargesAnnuelles);
    const cashflowM = beneficeAn / 12;

    // --- Tax Calculation (Simplified LMNP Réel) ---
    // Base Imposable = Loyers - Charges - Intérêts - Amortissement
    // Amortissement Estimation: (85% Prix + FaN + Travaux) / 25 ans approx
    const amortissementAnnuel = ((d.prixAchat * 0.85) + d.fraisNotaire + d.travaux) / 25;
    // Intérêts Annuels (Approx for average year): Loan * Rate (Roughly)
    // Better: Use average interest over duration or 1st year interest. Let's use 1st year for simplicity/conservatism.
    const interetsAnnuels = loanAmount * (d.tauxInteret / 100);

    const resultatFiscal = Math.max(0, recetteAnnuelle - totalChargesAnnuelles - interetsAnnuels - amortissementAnnuel);
    const impots = resultatFiscal * ((d.tmi + 17.2) / 100); // TMI + CSG
    const cashflowNetNet = cashflowM - (impots / 12);

    const years = Array.from({ length: 21 }, (_, i) => i);
    const projectionData = years.map(year => {
      const months = year * 12;
      let remainingDebt = loanAmount;
      if (rMensuel > 0 && months > 0) {
        remainingDebt = loanAmount * (Math.pow(1 + rMensuel, nMensuel) - Math.pow(1 + rMensuel, months)) / (Math.pow(1 + rMensuel, nMensuel) - 1);
      } else if (months > 0) {
        remainingDebt = Math.max(0, loanAmount - (mCredit * months));
      }
      if (year > d.dureeCredit) remainingDebt = 0;
      const cumCashflow = beneficeAn * year; // Uses simple cashflow for projection, ignoring tax variation for simplicity graph
      const netWorth = (d.prixAchat + d.travaux) - remainingDebt + cumCashflow;
      return { year, remainingDebt, cumCashflow, netWorth, cumCharges: totalChargesAnnuelles * year };
    });

    return {
      investTotal, loanAmount, recetteMensuelleBrute, recetteAnnuelle, totalChargesAnnuelles,
      creditAnnee, rBrute, rNet, beneficeAn, cashflowM, mCredit, projectionData, recetteMensuelleRéelle,
      impots, cashflowNetNet
    };
  }, [activeSim]);

  const updateData = (f, v) => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, [f]: parseFloat(v) || 0, ...(f === 'prixAchat' && { fraisNotaire: Math.round(parseFloat(v) * 0.08) }) } } : s));
  const updateCharge = (id, field, value) => {
    setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, charges: s.data.charges.map(c => c.id === id ? { ...c, [field]: field === 'value' ? (parseFloat(value) || 0) : value } : c) } } : s));
  };
  const addCharge = () => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, charges: [...s.data.charges, { id: uuidv4(), name: 'Nouvelle Charge', value: 0 }] } } : s));
  const removeCharge = (id) => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, charges: s.data.charges.filter(c => c.id !== id) } } : s));

  const exportSyntheticPDF = async () => {
    setIsGenerating(true);
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 1200 });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save(`Simu_${activeSim.name}.pdf`);
    setIsGenerating(false);
  };

  const shareSimulation = () => {
    const json = JSON.stringify(activeSim);
    const encoded = btoa(json);
    const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
    navigator.clipboard.writeText(url).then(() => alert('Lien copié dans le presse-papier ! Envoyer ce lien partage cette simulation.'));
  };

  const toggleDimension = (dim) => setVisibleDimensions(p => ({ ...p, [dim]: !p[dim] }));

  const formatE = (v) => euroFormatter.format(v);

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-300 flex flex-col items-center overflow-x-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px]" />
      </div>

      <header className="relative w-full z-10 bg-slate-900/40 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4 sm:py-0 sm:h-16 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-4 sm:gap-0">
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-xl text-white shadow-lg"><Building2 size={20} /></div>
            <input value={activeSim.name} onChange={(e) => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, name: e.target.value } : s))} className="font-black text-white bg-transparent border-none focus:ring-0 p-0 text-lg sm:text-xl w-48 sm:w-64 tracking-tight truncate" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 w-full sm:w-auto overflow-x-auto scrollbar-hide">
            {simulations.map(sim => (
              <button key={sim.id} onClick={() => setActiveSimId(sim.id)} className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeSimId === sim.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>{sim.name}</button>
            ))}
            <button onClick={() => { const n = { id: uuidv4(), name: `Projet ${simulations.length + 1}`, data: { ...INITIAL_DATA, charges: JSON.parse(JSON.stringify(INITIAL_CHARGES)) } }; setSimulations([...simulations, n]); setActiveSimId(n.id); }} className="p-2 text-indigo-400"><Plus size={18} /></button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button onClick={shareSimulation} className="bg-white/5 text-white p-2.5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 justify-center flex-1 sm:flex-initial" title="Copier le lien de partage">
              <Share2 size={16} /> <span className="sm:hidden xl:inline">Partager</span>
            </button>
            <button onClick={exportSyntheticPDF} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] border border-white/10 hover:bg-indigo-500 transition-all flex items-center gap-2 justify-center flex-1 sm:flex-initial shadow-lg active:scale-95">
              {isGenerating ? <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> : <><Download size={16} /> PDF</>}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full p-4 sm:p-6 flex flex-col lg:grid lg:grid-cols-12 gap-6 max-w-[1700px]">
        <aside className="w-full lg:col-span-3 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2 scrollbar-hide py-2 animate-in fade-in slide-in-from-left-4 duration-700 order-2 lg:order-1">
          <GlassSection title="Patrimoine" icon={<Home size={18} className="text-indigo-400" />}>
            <PremiumInput label="Prix d'achat" value={activeSim.data.prixAchat} onChange={(v) => updateData('prixAchat', v)} tooltip="Prix net vendeur hors frais" />
            <PremiumInput label="Travaux" value={activeSim.data.travaux} onChange={(v) => updateData('travaux', v)} tooltip="Montant estimé des rénovations" />
            <PremiumInput label="Frais Notaire" value={activeSim.data.fraisNotaire} onChange={(v) => updateData('fraisNotaire', v)} tooltip="Environ 7-8% dans l'ancien" />
            <div className="mt-4 p-4 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex flex-col gap-1 items-center"><span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Coût Total</span><span className="text-xl font-black text-white">{formatE(calculations.investTotal)}</span></div>
          </GlassSection>

          <GlassSection title="Banque" icon={<Landmark size={18} className="text-amber-400" />}>
            <PremiumInput label="Apport Personnel" value={activeSim.data.apport} onChange={(v) => updateData('apport', v)} />
            <div className="grid grid-cols-2 gap-4"><PremiumInput label="Taux %" value={activeSim.data.tauxInteret} onChange={(v) => updateData('tauxInteret', v)} /><PremiumInput label="Ans" value={activeSim.data.dureeCredit} onChange={(v) => updateData('dureeCredit', v)} /></div>
            <div className="mt-2 p-4 bg-slate-800/40 rounded-2xl border border-white/5 space-y-3"><div className="flex items-center justify-between"><span className="text-[10px] font-black text-slate-500 uppercase">Calcul Mensuel</span><Toggle active={activeSim.data.autoCredit} onToggle={() => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, autoCredit: !s.data.autoCredit } } : s))} /></div><div className="text-lg font-black text-white text-center py-1 border-y border-white/5">{formatE(calculations.mCredit)} <span className="text-[10px] text-slate-500">/ mois</span></div></div>
          </GlassSection>

          <GlassSection title="Fiscalité & Risques" icon={<Scale size={18} className="text-rose-400" />}>
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between items-center"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none px-1">TMI (Impôts)</label><InfoTooltip text="Tranche Marginale d'Imposition. Sert à calculer l'impôt estimé sur les loyers." /></div>
              <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                {TMI_OPTIONS.map(t => (
                  <button key={t} onClick={() => updateData('tmi', t)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeSim.data.tmi === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>{t}%</button>
                ))}
              </div>
            </div>
            <PremiumInput label="Vacance Locative %" value={activeSim.data.vacanceLocative} onChange={(v) => updateData('vacanceLocative', v)} tooltip="Estimation du % de temps vide ou impayé" />
          </GlassSection>

          <GlassSection title="Revenus Locatifs" icon={<Users size={18} className="text-emerald-400" />}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">Locataires ({activeSim.data.nbColocs})</span>
              <div className="flex gap-2"><button onClick={() => { const c = Math.max(0, activeSim.data.nbColocs - 1); setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, nbColocs: c, loyers: s.data.loyers.slice(0, c) } } : s)); }} className="w-7 h-7 flex items-center justify-center bg-slate-700/50 rounded-lg text-slate-300">-</button><button onClick={() => { const c = activeSim.data.nbColocs + 1; setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, nbColocs: c, loyers: [...s.data.loyers, 0] } } : s)); }} className="w-7 h-7 flex items-center justify-center bg-emerald-600 rounded-lg text-white">+</button></div>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide shrink-0">
              {activeSim.data.loyers.map((l, i) => <div key={i} className="flex items-center gap-2 group"><span className="text-[10px] font-black text-slate-600 w-3">{i + 1}</span><div className="relative flex-1"><input type="number" value={l} onChange={(e) => { const v = parseFloat(e.target.value) || 0; setSimulations(p => p.map(s => { if (s.id !== activeSimId) return s; const nl = [...s.data.loyers]; nl[i] = v; return { ...s, data: { ...s.data, loyers: nl } }; })); }} className="w-full bg-white/5 text-xs font-black text-white border border-white/5 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500/20" /></div></div>)}
            </div>
          </GlassSection>

          <GlassSection title="Détail Charges" icon={<Receipt size={18} className="text-rose-400" />}>
            <div className="space-y-3 max-h-32 overflow-y-auto pr-1 scrollbar-hide">
              {activeSim.data.charges.map((c) => (
                <div key={c.id} className="flex flex-col gap-1 relative group"><div className="flex justify-between px-1"><input value={c.name} onChange={(e) => updateCharge(c.id, 'name', e.target.value)} className="bg-transparent border-none text-[8px] font-black text-slate-500 uppercase p-0 focus:ring-0 w-24 focus:text-indigo-400 focus:lowercase" /><button onClick={() => removeCharge(c.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400 transition-opacity"><X size={10} /></button></div><div className="relative"><input type="number" value={c.value} onChange={(e) => updateCharge(c.id, 'value', e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-lg p-1.5 text-[11px] font-black text-white pr-8" /><Euro size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" /></div></div>
              ))}
              <button onClick={addCharge} className="w-full py-2 bg-white/5 border border-dashed border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 flex items-center justify-center gap-2 mt-1"><Plus size={12} /> Ajouter</button>
            </div>
          </GlassSection>
        </aside>

        <div className="w-full lg:col-span-9 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-700 order-1 lg:order-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 shrink-0 pt-2 lg:h-36">
            <HeroKPI label="Cashflow Net" value={formatE(calculations.cashflowM)} color={calculations.cashflowM >= 0 ? "emerald" : "rose"} icon={<ArrowRightLeft />} highlight sub="Avant impôts" />
            <HeroKPI label="Cashflow Net-Net" value={formatE(calculations.cashflowNetNet)} color={calculations.cashflowNetNet >= 0 ? "indigo" : "slate"} icon={<Wallet />} sub={`Après impôts (TMI ${activeSim.data.tmi}%)`} />
            <HeroKPI label="Rendement Net" value={`${calculations.rNet.toFixed(2)}%`} color="emerald" icon={<TrendingUp />} />
            <HeroKPI label="Enrichissement" value={formatE(calculations.beneficeAn * 20 + (calculations.investTotal - activeSim.data.apport))} color="indigo" icon={<Building2 />} sub="Total à 20 ans" />
          </div>

          <div className="w-full bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-4 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col min-h-[400px] lg:flex-1 lg:min-h-0">
            <div className="flex flex-col lg:flex-row justify-between items-start mb-6 shrink-0 gap-4">
              <div><h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.4em] flex items-center gap-2 mb-1"><BarChart3 size={14} /> Projection 20 ans</h4><p className="text-xl font-bold text-white tracking-tight">Analyse patrimoniale</p></div>
              <div className="flex flex-wrap gap-2 justify-end w-full lg:w-auto">
                <DimensionToggle active={visibleDimensions.netWorth} onClick={() => toggleDimension('netWorth')} dot="bg-indigo-500" label="Nette" />
                <DimensionToggle active={visibleDimensions.debt} onClick={() => toggleDimension('debt')} dot="bg-rose-500" label="Dette" />
                <DimensionToggle active={visibleDimensions.cashflow} onClick={() => toggleDimension('cashflow')} dot="bg-emerald-500" label="Cash" />
                <DimensionToggle active={visibleDimensions.charges} onClick={() => toggleDimension('charges')} dot="bg-slate-500" label="Chrg" />
              </div>
            </div>
            <div className="flex-1 w-full min-h-[300px] lg:min-h-0 relative">
              <Line
                data={{
                  labels: calculations.projectionData.map(d => `${d.year} an${d.year > 1 ? 's' : ''}`),
                  datasets: [
                    { label: 'Valeur Nette', data: calculations.projectionData.map(d => d.netWorth), borderColor: '#6366f1', borderWidth: 4, tension: 0.4, pointRadius: 3, fill: false, hidden: !visibleDimensions.netWorth },
                    { label: 'Dette', data: calculations.projectionData.map(d => d.remainingDebt), borderColor: '#f43f5e', borderWidth: 2, borderDash: [5, 5], tension: 0, pointRadius: 0, fill: false, hidden: !visibleDimensions.debt },
                    { label: 'Cashflow', data: calculations.projectionData.map(d => d.cumCashflow), borderColor: '#10b981', borderWidth: 2, tension: 0.4, pointRadius: 0, fill: false, hidden: !visibleDimensions.cashflow },
                    { label: 'Charges', data: calculations.projectionData.map(d => d.cumCharges), borderColor: '#64748b', borderWidth: 1, tension: 0, pointRadius: 0, fill: false, hidden: !visibleDimensions.charges }
                  ]
                }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', padding: 12, cornerRadius: 16 } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { weight: 'bold', size: 10 }, callback: (v) => `${v / 1000}k€` } }, x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: 'bold', size: 10 }, maxTicksLimit: 6 } } } }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* SYNTHETIC PDF TEMPLATE (HIDDEN) */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none">
        <div ref={reportRef} className="w-[210mm] p-[15mm] bg-white text-slate-900 flex flex-col gap-6 font-sans">
          <div className="flex justify-between border-b-4 border-indigo-600 pb-6"><div><h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Bilan Immobilier</h1><p className="text-xl font-bold text-indigo-500 uppercase tracking-widest">{activeSim.name}</p></div><div className="text-right"><p className="text-[10px] font-black uppercase text-slate-300">Rapport émis le</p><p className="font-black text-lg">{new Date().toLocaleDateString('fr-FR')}</p></div></div>
          <div className="grid grid-cols-4 gap-4">
            <RepKPI label="Rendement Net" value={`${calculations.rNet.toFixed(2)}%`} /><RepKPI label="Cashflow Net-Net" value={formatE(calculations.cashflowNetNet)} highlight sub={`Après Impôts (TMI ${activeSim.data.tmi}%)`} /><RepKPI label="Mensualité" value={formatE(calculations.mCredit)} /><RepKPI label="Gains (20 ans)" value={formatE(calculations.beneficeAn * 20)} />
          </div>
          <div className="grid grid-cols-2 gap-10">
            <section className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100"><h3 className="text-xs font-black uppercase text-slate-900 border-b-2 border-indigo-500 mb-4 pb-1">Financement</h3><div className="space-y-2 text-sm"><RepRow label="Investissement Total" value={formatE(calculations.investTotal)} /><RepRow label="Apport Personnel" value={formatE(activeSim.data.apport)} /><div className="flex justify-between font-black text-lg border-t-2 pt-2 border-slate-900 mt-2"><span>CRÉDIT BANCAIRE</span><span>{formatE(calculations.loanAmount)}</span></div></div></section>
            <section className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100"><h3 className="text-xs font-black uppercase text-slate-900 border-b-2 border-indigo-500 mb-4 pb-1">Fiscalité & Cashflow</h3><div className="space-y-2 text-sm"><RepRow label="Cashflow Brut / mois" value={formatE(calculations.beneficeAn / 12 + calculations.totalChargesAnnuelles / 12)} /><RepRow label="Impôt Estimé / mois" value={formatE(calculations.impots / 12)} /><div className="flex justify-between font-black text-lg border-t-2 pt-2 border-emerald-500 mt-2 text-emerald-600"><span>NET-NET / MOIS</span><span>{formatE(calculations.cashflowNetNet)}</span></div></div></section>
          </div>
          <div className="mt-8 p-10 bg-indigo-600 rounded-[3rem] text-white flex justify-between items-center shadow-2xl shadow-indigo-100"><div><h3 className="text-2xl font-black mb-2 uppercase tracking-tighter italic">Projet Net-Net</h3><p className="text-indigo-100 text-sm">Après fiscalité (TMI {activeSim.data.tmi}%), le projet génère <span className="font-black underline text-white">{formatE(calculations.cashflowNetNet)}</span> par mois.</p></div></div>
        </div>
      </div>
    </div>
  );
}

// --- UI COMPONENTS ---
function GlassSection({ title, icon, children }) {
  return <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 shadow-xl transition-all group shrink-0 w-full"><h3 className="text-xs font-black text-white border-b border-white/5 pb-4 mb-5 flex items-center justify-between uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors"><div className="flex items-center gap-3">{icon}{title}</div></h3><div className="space-y-4">{children}</div></div>;
}
function PremiumInput({ label, value, onChange, tooltip }) {
  return <div className="flex flex-col gap-2 group/input"><div className="flex justify-between items-center"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none px-1 group-focus-within/input:text-indigo-400 transition-colors">{label}</label>{tooltip && <InfoTooltip text={tooltip} />}</div><input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-500/5 border border-white/5 rounded-xl p-3 text-sm font-black text-white focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 transition-all font-mono" /></div>;
}
function InfoTooltip({ text }) {
  return <div className="group relative cursor-help"><Info size={12} className="text-slate-600 hover:text-indigo-400 transition-colors" /><div className="absolute right-0 bottom-full mb-2 px-3 py-2 bg-slate-900 text-white text-[10px] w-48 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-white/10 shadow-xl z-50 text-center leading-relaxed">{text}</div></div>;
}
function HeroKPI({ label, value, color, icon, highlight = false, sub }) {
  const c = { emerald: 'text-emerald-400', indigo: 'text-indigo-400', slate: 'text-slate-400', rose: 'text-rose-400' };
  const bg = { emerald: 'bg-emerald-500/10', indigo: 'bg-indigo-500/10', slate: 'bg-slate-500/10', rose: 'bg-rose-500/10' };
  return <div className={`bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-4 sm:p-6 flex flex-col justify-center relative shadow-xl hover:-translate-y-1 transition-all duration-500 group overflow-hidden ${highlight ? 'ring-2 ring-emerald-500/30' : ''}`}><div className="relative"><div className="flex items-center gap-2 mb-2"><div className={`p-1.5 rounded-lg ${bg[color]} ${c[color]}`}>{React.cloneElement(icon, { size: 14 })}</div><p className="text-[9px] font-black uppercase text-slate-500 tracking-widest truncate">{label}</p></div><p className={`text-2xl sm:text-3xl font-black tracking-tighter truncate ${c[color]}`}>{value}</p>{sub && <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic truncate">{sub}</p>}</div></div>;
}
function Toggle({ active, onToggle }) {
  return <button onClick={onToggle} className={`w-10 h-5 rounded-full transition-all relative ${active ? 'bg-indigo-600' : 'bg-slate-700'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-all ${active ? 'left-6' : 'left-1'}`} /></button>;
}
function DimensionToggle({ active, onClick, dot, label }) {
  return <button onClick={onClick} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border flex items-center gap-2 transition-all ${active ? 'bg-white/10 border-indigo-500 text-white' : 'border-white/5 text-slate-500 opacity-50 hover:opacity-100 hover:bg-white/5'}`}><div className={`w-2 h-2 rounded-full ${dot} ${!active ? 'grayscale' : ''}`} /><span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest hidden sm:inline">{label}</span><span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest sm:hidden">{label.slice(0, 4)}</span>{active ? <Eye size={12} className="ml-1 opacity-50" /> : <EyeOff size={12} className="ml-1 opacity-20" />}</button>;
}
function RepKPI({ label, value, highlight }) {
  return <div className={`p-8 bg-slate-50 rounded-[2.5rem] ${highlight ? 'border-2 border-indigo-600 ring-8 ring-indigo-50' : ''}`}><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p><p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p></div>;
}
function RepRow({ label, value }) {
  return <div className="flex justify-between items-end border-b border-slate-100 pb-1.5 leading-none"><span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span><span className="font-black text-slate-900">{value}</span></div>;
}
