import React, { useState, useMemo, useRef } from 'react';
import {
  Calculator, Home, Euro, Percent, Users, Receipt, CreditCard, ShieldCheck,
  TrendingUp, Landmark, ArrowRightLeft, UserPlus, Plus, Trash2, Info,
  ChevronDown, ChevronUp, Download, Share2, Link as LinkIcon, Building2,
  Calendar, LineChart as ChartIcon, FileText, Trash, Copy, Sparkles, CheckCircle2
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend
);

const INITIAL_DATA = {
  prixAchat: 92000, travaux: 20000, fraisNotaire: 7360, apport: 15000,
  tauxInteret: 3.85, dureeCredit: 20, mensualiteCredit: 567,
  autoCredit: true,
  nbColocs: 3, loyers: [493, 493, 493],
  chargesCopro: 2733, assurancePNO: 159.81, internet: 420, electricite: 600, eau: 696,
  taxeFonciere: 1170, travauxCopro: 0, cfe: 354, compta: 289, rentila: 48, ogi: 102, cotisationBancaire: 0
};

export default function App() {
  const [simulations, setSimulations] = useState([
    { id: uuidv4(), name: 'Appart Lyon 3', data: { ...INITIAL_DATA } }
  ]);
  const [activeSimId, setActiveSimId] = useState(simulations[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef(null);

  const activeSim = simulations.find(s => s.id === activeSimId) || simulations[0];

  const calculations = useMemo(() => {
    const d = activeSim.data;
    const investissementTotal = d.prixAchat + d.travaux + d.fraisNotaire;
    const montantAEmprunter = Math.max(0, investissementTotal - d.apport);

    let mCredit = d.mensualiteCredit;
    if (d.autoCredit) {
      const r = d.tauxInteret / 100 / 12;
      const n = d.dureeCredit * 12;
      if (n > 0) {
        if (r === 0) mCredit = montantAEmprunter / n;
        else mCredit = (montantAEmprunter * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      } else mCredit = 0;
    }

    const recetteMensuelle = d.loyers.reduce((acc, curr) => acc + curr, 0);
    const recetteAnnuelle = recetteMensuelle * 12;
    const chargesServicesAnnuel = d.internet + d.electricite + d.eau;
    const chargesFixesAnnuelles = d.taxeFonciere + d.travauxCopro + d.cfe + d.assurancePNO + d.compta + d.rentila + d.ogi + d.cotisationBancaire;
    const totalChargesAnnuelles = d.chargesCopro + chargesServicesAnnuel + chargesFixesAnnuelles;
    const coutCreditAnnuel = mCredit * 12;

    const rentabiliteBrute = investissementTotal > 0 ? (recetteAnnuelle / investissementTotal) * 100 : 0;
    const rentabiliteNet = investissementTotal > 0 ? ((recetteAnnuelle - totalChargesAnnuelles) / investissementTotal) * 100 : 0;
    const beneficeAnnuel = recetteAnnuelle - (coutCreditAnnuel + totalChargesAnnuelles);
    const cashflowMensuel = beneficeAnnuel / 12;

    return {
      investissementTotal, montantAEmprunter, recetteMensuelle, recetteAnnuelle,
      totalChargesAnnuelles, coutCreditAnnuel, rentabiliteBrute, rentabiliteNet,
      beneficeAnnuel, cashflowMensuel, calculatedMensualite: mCredit
    };
  }, [activeSim]);

  const updateSimData = (field, value) => {
    setSimulations(prev => prev.map(s => {
      if (s.id !== activeSimId) return s;
      let val = parseFloat(value) || 0;
      const newData = { ...s.data, [field]: val };
      if (field === 'prixAchat') newData.fraisNotaire = Math.round(val * 0.08);
      return { ...s, data: newData };
    }));
  };

  const exportSyntheticPDF = async () => {
    setIsGenerating(true);
    const element = reportRef.current;
    // Optimization for PDF generation: wait for layout
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 1200
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Rapport_Synthetique_${activeSim.name}.pdf`);
    setIsGenerating(false);
  };

  const formatEuro = (val) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="h-screen w-screen bg-[#0f172a] text-slate-300 flex flex-col items-center overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Background Aesthetic */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Premium Header */}
      <header className="relative w-full z-10 bg-slate-900/40 backdrop-blur-xl border-b border-white/5 px-8 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform cursor-pointer overflow-hidden group">
            <Building2 size={20} className="group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <input
              value={activeSim.name}
              onChange={(e) => setSimulations(prev => prev.map(s => s.id === activeSimId ? { ...s, name: e.target.value } : s))}
              className="font-black text-white bg-transparent border-none focus:ring-0 p-0 text-xl w-64 tracking-tight"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
          {simulations.map(sim => (
            <button
              key={sim.id}
              onClick={() => setActiveSimId(sim.id)}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all shrink-0 uppercase tracking-widest ${activeSimId === sim.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              {sim.name}
            </button>
          ))}
          <button
            onClick={() => {
              const newSim = { id: uuidv4(), name: `Appart ${simulations.length + 1}`, data: { ...INITIAL_DATA } };
              setSimulations([...simulations, newSim]);
              setActiveSimId(newSim.id);
            }}
            className="p-2 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={exportSyntheticPDF} disabled={isGenerating} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] border border-indigo-500/10 hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95">
            {isGenerating ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" /> : <><Download size={16} /> Rapport PDF</>}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full p-6 grid grid-cols-12 gap-6 overflow-hidden max-w-[1700px]">

        <aside className="col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide py-2 animate-in fade-in slide-in-from-left-4 duration-700">
          <GlassSection title="Investissement" icon={<Home size={18} className="text-indigo-400" />}>
            <PremiumInput label="Prix d'achat" value={activeSim.data.prixAchat} onChange={(v) => updateSimData('prixAchat', v)} />
            <PremiumInput label="Travaux" value={activeSim.data.travaux} onChange={(v) => updateSimData('travaux', v)} />
            <PremiumInput label="Notaire" value={activeSim.data.fraisNotaire} onChange={(v) => updateSimData('fraisNotaire', v)} />

            <div className="mt-4 p-5 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 rounded-[1.5rem] flex flex-col gap-1 shadow-lg shadow-indigo-500/5">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.25em]">Coût Total Projet</span>
              <span className="text-2xl font-black text-white tracking-tighter">{formatEuro(calculations.investissementTotal)}</span>
            </div>
          </GlassSection>

          <GlassSection title="Financement" icon={<Landmark size={18} className="text-amber-400" />}>
            <PremiumInput label="Apport Personnel" value={activeSim.data.apport} onChange={(v) => updateSimData('apport', v)} />
            <div className="grid grid-cols-2 gap-4">
              <PremiumInput label="Intérêt %" value={activeSim.data.tauxInteret} onChange={(v) => updateSimData('tauxInteret', v)} />
              <PremiumInput label="Durée (Ans)" value={activeSim.data.dureeCredit} onChange={(v) => updateSimData('dureeCredit', v)} />
            </div>
            <div className="mt-2 p-4 bg-slate-800/40 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calcul Auto</span>
                <Toggle active={activeSim.data.autoCredit} onToggle={() => setSimulations(prev => prev.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, autoCredit: !s.data.autoCredit } } : s))} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none px-1">Mensualité Crédit</label>
                <div className="relative">
                  <input
                    type="number"
                    disabled={activeSim.data.autoCredit}
                    value={activeSim.data.autoCredit ? calculations.calculatedMensualite.toFixed(0) : activeSim.data.mensualiteCredit}
                    onChange={(e) => updateSimData('mensualiteCredit', e.target.value)}
                    className={`w-full bg-slate-900/50 border border-white/5 rounded-xl p-3 text-lg font-black text-white focus:ring-2 focus:ring-indigo-500/20 transition-all ${activeSim.data.autoCredit ? 'opacity-40 select-none' : ''}`}
                  />
                  {activeSim.data.autoCredit && <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full"><Sparkles size={10} /> Auto</div>}
                </div>
              </div>
            </div>
          </GlassSection>

          <GlassSection title="Revenus Coloc" icon={<Users size={18} className="text-emerald-400" />}>
            <div className="flex items-center justify-between mb-4 bg-white/5 p-2 rounded-2xl border border-white/5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Locataires ({activeSim.data.nbColocs})</span>
              <div className="flex gap-2">
                <button onClick={() => {
                  const count = Math.max(0, activeSim.data.nbColocs - 1);
                  setSimulations(prev => prev.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, nbColocs: count, loyers: s.data.loyers.slice(0, count) } } : s));
                }} className="w-8 h-8 flex items-center justify-center bg-slate-700/50 rounded-xl text-slate-300 hover:text-white transition-colors">-</button>
                <button onClick={() => {
                  const count = activeSim.data.nbColocs + 1;
                  setSimulations(prev => prev.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, nbColocs: count, loyers: [...s.data.loyers, 0] } } : s));
                }} className="w-8 h-8 flex items-center justify-center bg-emerald-600 rounded-xl text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20">+</button>
              </div>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
              {activeSim.data.loyers.map((loyer, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <span className="text-[10px] font-black text-slate-600 w-4 tracking-tighter transition-colors group-hover:text-indigo-400">{i + 1}</span>
                  <div className="relative flex-1">
                    <input type="number" value={loyer} onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setSimulations(prev => prev.map(s => {
                        if (s.id !== activeSimId) return s;
                        const nl = [...s.data.loyers]; nl[i] = val;
                        return { ...s, data: { ...s.data, loyers: nl } };
                      }));
                    }} className="w-full bg-white/5 text-sm font-black text-white border border-white/5 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 transition-all pr-10" />
                    <Euro size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </GlassSection>
        </aside>

        <div className="col-span-9 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="grid grid-cols-4 gap-6 h-36 shrink-0 pt-2">
            <HeroKPI label="Cashflow Mensuel" value={formatEuro(calculations.cashflowMensuel)} color={calculations.cashflowMensuel >= 0 ? "emerald" : "rose"} icon={<ArrowRightLeft />} highlight />
            <HeroKPI label="Rentabilité Nette" value={`${calculations.rentabiliteNet.toFixed(2)}%`} color="indigo" icon={<TrendingUp />} />
            <HeroKPI label="Rentabilité Brute" value={`${calculations.rentabiliteBrute.toFixed(2)}%`} color="slate" icon={<Percent />} />
            <HeroKPI label="Total Charges / an" value={formatEuro(calculations.totalChargesAnnuelles)} color="rose" icon={<ShieldCheck />} />
          </div>

          <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
            <div className="col-span-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 flex flex-col shadow-2xl overflow-hidden relative group">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-xs font-black uppercase text-indigo-400 tracking-[0.3em] flex items-center gap-2 mb-1">Projection de Croissance</h4>
                  <p className="text-xl font-bold text-white tracking-tight">Patrimoine & Cashflow Cumulés</p>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <Line
                  data={{
                    labels: [0, 5, 10, 15, 20],
                    datasets: [{
                      label: 'Total €',
                      data: [0, 5, 10, 15, 20].map(y => calculations.investissementTotal + (calculations.beneficeAnnuel * y)),
                      borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#fff', pointBorderWidth: 3, pointBorderColor: '#6366f1'
                    }]
                  }}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { weight: 'bold', size: 11 }, callback: (v) => `${v / 1000}k€` } },
                      x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: 'bold', size: 11 } } }
                    }
                  }}
                />
              </div>
            </div>

            <div className="col-span-4 flex flex-col gap-6">
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 text-white flex-1 flex flex-col justify-center relative overflow-hidden shadow-2xl border border-white/5 group">
                <Building2 size={160} className="absolute -bottom-8 -right-8 opacity-5 rotate-12" />
                <div className="relative">
                  <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.4em] mb-4">Valeur du Projet à 20 ans</p>
                  <p className="text-5xl font-black text-white mb-8 tracking-tighter leading-none">
                    {formatEuro(calculations.beneficeAnnuel * 20 + calculations.investissementTotal)}
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-black text-emerald-300 bg-white/5 p-4 rounded-xl border border-white/10 uppercase tracking-tighter">
                      <span>Cashflow Total</span>
                      <span>+{formatEuro(calculations.beneficeAnnuel * 20)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 h-48 flex gap-8 shrink-0 shadow-lg relative overflow-hidden">
                <div className="w-28 shrink-0 relative flex items-center">
                  <Doughnut
                    data={{
                      labels: ['Fixes', 'Charge'],
                      datasets: [{ data: [calculations.totalChargesAnnuelles - (activeSim.data.electricite + activeSim.data.internet + activeSim.data.eau), (activeSim.data.electricite + activeSim.data.internet + activeSim.data.eau)], backgroundColor: ['#6366f1', '#f59e0b'], borderWidth: 0 }]
                    }}
                    options={{ cutout: '78%', plugins: { legend: { display: false } } }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <ShieldCheck size={18} className="text-slate-700" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-3">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Détails Charges</p>
                  <div className="space-y-2">
                    <MiniRow label="Copro" value={formatEuro(activeSim.data.chargesCopro)} dot="indigo" />
                    <MiniRow label="Fiscalité" value={formatEuro(activeSim.data.taxeFonciere + activeSim.data.cfe)} dot="slate" />
                    <MiniRow label="Exploit" value={formatE(activeSim.data.internet + activeSim.data.eau + activeSim.data.electricite)} dot="amber" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* HIDDEN SYNTHETIC PDF TEMPLATE (Always white/clean styles) */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none">
        <div ref={reportRef} className="w-[210mm] p-[20mm] bg-white text-slate-900 flex flex-col gap-10 font-sans shadow-none">
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-indigo-600 mb-2 uppercase">Synthèse d'Investissement</h1>
              <p className="text-xl font-bold text-slate-400">{activeSim.name}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl text-right">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Date</p>
              <p className="font-bold">{new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <ReportKPI label="Rentabilité Nette" value={`${calculations.rentabiliteNet.toFixed(2)}%`} sub="Après charges & taxes" />
            <ReportKPI label="Cashflow Mensuel" value={formatEuro(calculations.cashflowMensuel)} sub="Net d'impôts & crédit" border />
            <ReportKPI label="Patrimoine 20 ans" value={formatEuro(calculations.investissementTotal + calculations.beneficeAnnuel * 20)} sub="Capital + Gains cumulés" />
          </div>

          <div className="grid grid-cols-2 gap-12 mt-4">
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 border-b pb-2">Investissement</h3>
              <div className="space-y-3 font-medium text-sm">
                <ReportRow label="Prix d'achat" value={formatEuro(activeSim.data.prixAchat)} />
                <ReportRow label="Travaux" value={formatEuro(activeSim.data.travaux)} />
                <ReportRow label="Frais de notaire" value={formatEuro(activeSim.data.fraisNotaire)} />
                <div className="pt-2 flex justify-between font-black text-lg border-t-2 border-slate-900 mt-2">
                  <span>TOTAL PROJET</span>
                  <span>{formatEuro(calculations.investissementTotal)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 border-b pb-2">Exploitation</h3>
              <div className="space-y-3 font-medium text-sm">
                <ReportRow label="Revenus Annuels" value={formatEuro(calculations.recetteAnnuelle)} />
                <ReportRow label="Mensualité Crédit" value={formatEuro(calculations.calculatedMensualite)} />
                <ReportRow label="Charges Annuelles" value={formatEuro(calculations.totalChargesAnnuelles)} />
                <div className="pt-2 flex justify-between font-black text-lg border-t-2 border-indigo-600 mt-2 text-indigo-600">
                  <span>CASHFLOW ANNUEL</span>
                  <span>{formatEuro(calculations.beneficeAnnuel)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-10 bg-indigo-600 rounded-[2.5rem] text-white">
            <div className="grid grid-cols-2 gap-10">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">Analyse du projet</h3>
                <p className="text-indigo-100 text-sm mb-6 leading-relaxed italic">
                  Cet actif génère un rendement net de <span className="font-black underline">{calculations.rentabiliteNet.toFixed(2)}%</span>.
                  Le cashflow mensuel de <span className="font-black">{formatEuro(calculations.cashflowMensuel)}</span> permet de couvrir largement les dépenses courantes.
                </p>
                <div className="flex items-center gap-2 text-white/80 text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Validation Rentabilité Positive
                </div>
              </div>
              <div className="bg-white/10 p-8 rounded-3xl border border-white/20 flex flex-col justify-center">
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-2">Profit Net Cumulé (20 ans)</p>
                <p className="text-5xl font-black">{formatEuro(calculations.beneficeAnnuel * 20)}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-10 border-t text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 flex justify-between">
            <span>Investissement Immobilier Pro</span>
            <span>Performance Immobilière &copy; 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS (RESTORED FROM PREMIUM DESIGN) ---

function GlassSection({ title, icon, children }) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 shadow-xl transition-all hover:border-white/10 group">
      <h3 className="text-xs font-black text-white border-b border-white/5 pb-4 mb-5 flex items-center justify-between uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">
        <div className="flex items-center gap-3">{icon}{title}</div>
        <ChevronDown size={16} className="text-slate-600 transition-transform group-hover:translate-y-0.5" />
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function PremiumInput({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2 group/input">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none px-1 group-focus-within/input:text-indigo-400 transition-colors">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-500/5 border border-white/5 rounded-xl p-3 text-sm font-black text-white focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 transition-all shadow-inner"
        />
      </div>
    </div>
  );
}

function HeroKPI({ label, value, color, icon, highlight = false }) {
  const colors = {
    emerald: 'text-emerald-400', indigo: 'text-indigo-400', slate: 'text-slate-400', rose: 'text-rose-400'
  };
  const bgColors = {
    emerald: 'bg-emerald-500/10', indigo: 'bg-indigo-500/10', slate: 'bg-slate-500/10', rose: 'bg-rose-500/10'
  };

  return (
    <div className={`bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-6 flex flex-col justify-center relative shadow-xl hover:-translate-y-1 transition-all duration-500 group overflow-hidden ${highlight ? 'ring-2 ring-emerald-500/30 shadow-2xl shadow-emerald-500/10' : ''}`}>
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-1.5 rounded-lg ${bgColors[color]} ${colors[color]}`}>
            {React.cloneElement(icon, { size: 14 })}
          </div>
          <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.25em] leading-none">{label}</p>
        </div>
        <p className={`text-3xl font-black tracking-tighter ${colors[color]}`}>{value}</p>
      </div>
    </div>
  );
}

function Toggle({ active, onToggle }) {
  return (
    <button onClick={onToggle} className={`w-10 h-5 rounded-full transition-all relative ${active ? 'bg-indigo-600' : 'bg-slate-700'}`}>
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-all ${active ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

function MiniRow({ label, value, dot }) {
  const dotColors = { indigo: 'bg-indigo-500', slate: 'bg-slate-500', amber: 'bg-amber-500' };
  return (
    <div className="flex justify-between items-center text-[10px] group transition-all hover:translate-x-1">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${dotColors[dot]}`} />
        <span className="font-bold text-slate-500 group-hover:text-white transition-colors uppercase tracking-tighter">{label}</span>
      </div>
      <span className="font-black text-white group-hover:text-indigo-400 transition-colors">{value}</span>
    </div>
  );
}

function ReportRow({ label, value }) {
  return (
    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
      <span className="font-black text-slate-950">{value}</span>
    </div>
  );
}

function ReportKPI({ label, value, sub, border = false }) {
  return (
    <div className={`p-8 bg-slate-50 rounded-[2rem] ${border ? 'border-2 border-indigo-600 shadow-xl shadow-indigo-100' : ''}`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{value}</p>
      <p className="text-[10px] font-bold text-indigo-500 italic">{sub}</p>
    </div>
  );
}

function formatE(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);
}
