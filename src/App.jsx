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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const INITIAL_DATA = {
  prixAchat: 92000, travaux: 20000, fraisNotaire: 7360, apport: 15000,
  tauxInteret: 3.85, dureeCredit: 20, mensualiteCredit: 567,
  autoCredit: true, nbColocs: 3, loyers: [493, 493, 493],
  chargesCopro: 2733, assurancePNO: 159.81, internet: 420, electricite: 600, eau: 696,
  taxeFonciere: 1170, travauxCopro: 0, cfe: 354, compta: 289, rentila: 48, ogi: 102, cotisationBancaire: 0
};

export default function App() {
  const [simulations, setSimulations] = useState([{ id: uuidv4(), name: 'Investissement Test', data: { ...INITIAL_DATA } }]);
  const [activeSimId, setActiveSimId] = useState(simulations[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef(null);

  const activeSim = simulations.find(s => s.id === activeSimId) || simulations[0];

  const calculations = useMemo(() => {
    const d = activeSim.data;
    const investTotal = d.prixAchat + d.travaux + d.fraisNotaire;
    const loanAmount = Math.max(0, investTotal - d.apport);
    let mCredit = d.mensualiteCredit;
    if (d.autoCredit) {
      const r = d.tauxInteret / 100 / 12;
      const n = d.dureeCredit * 12;
      if (n > 0) mCredit = r === 0 ? loanAmount / n : (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      else mCredit = 0;
    }
    const rMensuelle = d.loyers.reduce((acc, curr) => acc + curr, 0);
    const rAnnuelle = rMensuelle * 12;
    const fixCharges = d.taxeFonciere + d.travauxCopro + d.cfe + d.assurancePNO + d.compta + d.rentila + d.ogi + d.cotisationBancaire + d.chargesCopro;
    const serviceCharges = d.internet + d.electricite + d.eau;
    const totalCharges = fixCharges + serviceCharges;
    const creditAnnee = mCredit * 12;
    const rBrute = investTotal > 0 ? (rAnnuelle / investTotal) * 100 : 0;
    const rNet = investTotal > 0 ? ((rAnnuelle - totalCharges) / investTotal) * 100 : 0;
    const beneficeAn = rAnnuelle - (creditAnnee + totalCharges);
    return {
      investTotal, loanAmount, rMensuelle, rAnnuelle, totalCharges, creditAnnee,
      rBrute, rNet, beneficeAn, cashflowM: beneficeAn / 12, mCredit
    };
  }, [activeSim]);

  const updateData = (f, v) => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, [f]: parseFloat(v) || 0, ...(f === 'prixAchat' && { fraisNotaire: Math.round(parseFloat(v) * 0.08) }) } } : s));

  const exportSyntheticPDF = async () => {
    setIsGenerating(true);
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Rapport_${activeSim.name}.pdf`);
    setIsGenerating(false);
  };

  const formatE = (v) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);

  return (
    <div className="h-screen w-screen bg-[#0b0f19] text-slate-300 flex flex-col items-center overflow-hidden font-sans">
      {/* Main App Header */}
      <header className="w-full z-20 bg-slate-900/60 backdrop-blur-xl border-b border-white/5 px-8 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20"><Building2 size={20} /></div>
          <input value={activeSim.name} onChange={(e) => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, name: e.target.value } : s))} className="font-black text-white bg-transparent border-none focus:ring-0 p-0 text-xl w-64 tracking-tight" />
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
          {simulations.map(sim => (
            <button key={sim.id} onClick={() => setActiveSimId(sim.id)} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeSimId === sim.id ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-300'}`}>{sim.name}</button>
          ))}
          <button onClick={() => { const n = { id: uuidv4(), name: 'Nouveau', data: { ...INITIAL_DATA } }; setSimulations([...simulations, n]); setActiveSimId(n.id); }} className="p-2 text-indigo-400"><Plus size={18} /></button>
        </div>
        <div className="flex gap-4">
          <button onClick={exportSyntheticPDF} disabled={isGenerating} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            {isGenerating ? 'Génération...' : <><Download size={16} /> Rapport Synthétique</>}
          </button>
        </div>
      </header>

      {/* Dashboard View */}
      <main className="flex-1 w-full p-6 grid grid-cols-12 gap-6 overflow-hidden max-w-[1700px] relative z-10">
        <aside className="col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide py-2">
          <Box title="Investissement" icon={<Home size={18} className="text-indigo-400" />}>
            <Field label="Prix d'achat" value={activeSim.data.prixAchat} onChange={(v) => updateData('prixAchat', v)} />
            <Field label="Travaux" value={activeSim.data.travaux} onChange={(v) => updateData('travaux', v)} />
            <Field label="Notaire (8%)" value={activeSim.data.fraisNotaire} onChange={(v) => updateData('fraisNotaire', v)} />
            <div className="mt-4 p-4 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex flex-col">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Total Projet</span>
              <span className="text-xl font-black text-white">{formatE(calculations.investTotal)}</span>
            </div>
          </Box>
          <Box title="Financement" icon={<Landmark size={18} className="text-amber-400" />}>
            <Field label="Apport" value={activeSim.data.apport} onChange={(v) => updateData('apport', v)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Taux %" value={activeSim.data.tauxInteret} onChange={(v) => updateData('tauxInteret', v)} />
              <Field label="Ans" value={activeSim.data.dureeCredit} onChange={(v) => updateData('dureeCredit', v)} />
            </div>
            <div className="mt-2 p-3 bg-slate-800/50 rounded-xl border border-white/5 flex flex-col gap-2">
              <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase">Auto</span><button onClick={() => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, autoCredit: !s.data.autoCredit } } : s))} className={`w-8 h-4 rounded-full transition-all relative ${activeSim.data.autoCredit ? 'bg-indigo-500' : 'bg-slate-700'}`}><div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${activeSim.data.autoCredit ? 'left-4.5' : 'left-0.5'}`} /></button></div>
              <span className="text-[9px] font-black text-slate-500 uppercase">Mensualité</span>
              <div className="text-lg font-black text-white">{formatE(calculations.mCredit)}</div>
            </div>
          </Box>
        </aside>

        <div className="col-span-9 flex flex-col gap-6 animate-in fade-in duration-700">
          <div className="grid grid-cols-4 gap-6 h-32 shrink-0">
            <KPI label="Cashflow Mensuel" value={formatE(calculations.cashflowM)} color={calculations.cashflowM >= 0 ? 'emerald' : 'rose'} icon={<ArrowRightLeft />} highlight />
            <KPI label="Rentabilité Nette" value={`${calculations.rNet.toFixed(2)}%`} color="indigo" icon={<TrendingUp />} />
            <KPI label="Recette Annuelle" value={formatE(calculations.rAnnuelle)} color="emerald" icon={<Receipt />} />
            <KPI label="Total Charges / an" value={formatE(calculations.totalCharges)} color="rose" icon={<ShieldCheck />} />
          </div>

          <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
            <div className="col-span-12 bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 flex flex-col shadow-2xl">
              <h4 className="text-xs font-black uppercase text-indigo-400 tracking-widest mb-6">Projection sur 20 ans</h4>
              <div className="flex-1 min-h-0">
                <Line
                  data={{
                    labels: [0, 5, 10, 15, 20],
                    datasets: [{
                      label: 'Patrimoine + Cashflow',
                      data: [0, 5, 10, 15, 20].map(y => calculations.investTotal + (calculations.beneficeAn * y)),
                      borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.4, pointRadius: 4
                    }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#475569' } }, x: { grid: { display: false }, ticks: { color: '#475569' } } } }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SYNTHETIC REPORT TEMPLATE (Hidden for View, only for PDF) */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={reportRef} className="w-[210mm] p-[20mm] bg-white text-slate-900 flex flex-col gap-10 font-sans">
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-indigo-600 mb-2 uppercase">Rapport d'Investissement</h1>
              <p className="text-xl font-bold text-slate-400">{activeSim.name}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl text-right">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Date du rapport</p>
              <p className="font-bold">{new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <ReportKPI label="Rentabilité Nette" value={`${calculations.rNet.toFixed(2)}%`} sub="Après toutes charges" />
            <ReportKPI label="Cashflow Mensuel" value={formatE(calculations.cashflowM)} sub="Net de crédit" border />
            <ReportKPI label="Patrimoine à 20 ans" value={formatE(calculations.investTotal + calculations.beneficeAn * 20)} sub="Capital + Cashflow" />
          </div>

          <div className="grid grid-cols-2 gap-12 mt-4">
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 border-b pb-2">Plan d'Investissement</h3>
              <div className="space-y-3">
                <ReportRow label="Prix d'achat" value={formatE(activeSim.data.prixAchat)} />
                <ReportRow label="Travaux" value={formatE(activeSim.data.travaux)} />
                <ReportRow label="Frais de notaire" value={formatE(activeSim.data.fraisNotaire)} />
                <div className="pt-2 flex justify-between font-black text-lg border-t-2 border-slate-900 mt-2">
                  <span>TOTAL PROJET</span>
                  <span>{formatE(calculations.investTotal)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 border-b pb-2">Financement & Charges</h3>
              <div className="space-y-3">
                <ReportRow label="Apport Personnel" value={formatE(activeSim.data.apport)} />
                <ReportRow label="Emprunt Bancaire" value={formatE(calculations.loanAmount)} />
                <ReportRow label="Mensualité Crédit" value={formatE(calculations.mCredit)} />
                <ReportRow label="Charges Annuelles" value={formatE(calculations.totalCharges)} />
              </div>
            </div>
          </div>

          <div className="mt-8 p-10 bg-indigo-600 rounded-[2.5rem] text-white">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 underline underline-offset-8">Conclusion Financière</h3>
            <div className="grid grid-cols-2 gap-10">
              <div>
                <p className="text-indigo-100 text-sm mb-4 leading-relaxed italic">Ce projet génère un cashflow net de <span className="font-black underline">{formatE(calculations.cashflowM)} par mois</span>, ce qui en fait un investissement en {calculations.cashflowM > 0 ? 'autofinancement positif' : 'virement mensuel'}.</p>
                <div className="flex items-center gap-2 text-indigo-200 text-xs font-black uppercase">
                  <CheckCircle2 size={16} /> Indicateur de performance validé
                </div>
              </div>
              <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-2">Profit Total Estimé (20 ans)</p>
                <p className="text-4xl font-black">{formatE(calculations.beneficeAn * 20)}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-10 border-t text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 flex justify-between">
            <span>Investissement Immobilier Pro</span>
            <span>tomtomgo92.github.io/Investissement_Immobilier</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Box({ title, icon, children }) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 shadow-xl transition-all hover:border-white/10 group">
      <h3 className="text-xs font-black text-white border-b border-white/5 pb-4 mb-5 flex items-center justify-between uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">
        <div className="flex items-center gap-3">{icon}{title}</div>
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-500/5 border border-white/5 rounded-xl p-2.5 text-xs font-black text-white focus:ring-2 focus:ring-indigo-500/20 transition-all" />
    </div>
  );
}

function KPI({ label, value, color, icon, highlight = false }) {
  const c = { emerald: 'text-emerald-400', indigo: 'text-indigo-400', rose: 'text-rose-400', slate: 'text-slate-400' };
  return (
    <div className={`bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 flex flex-col justify-center relative shadow-xl hover:-translate-y-1 transition-all duration-500 ${highlight ? 'ring-2 ring-emerald-500/30' : ''}`}>
      <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] leading-none mb-3">{label}</p>
      <p className={`text-3xl font-black tracking-tighter ${c[color]}`}>{value}</p>
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

function ReportRow({ label, value }) {
  return (
    <div className="flex justify-between items-end border-b border-slate-50 pb-2">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{label}</span>
      <span className="font-black text-slate-900">{value}</span>
    </div>
  );
}
