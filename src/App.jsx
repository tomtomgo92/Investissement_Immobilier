import React, { useState, useMemo, useRef } from 'react';
import {
  Calculator, Home, Euro, Percent, Users, Receipt, CreditCard, ShieldCheck,
  TrendingUp, Landmark, ArrowRightLeft, Plus, Building2,
  Download, Share2, ChevronDown, Sparkles, CheckCircle2,
  Wallet, X, AlertTriangle, BarChart3
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
  vacanceLocative: 5, // 5% vacancy by default
};

export default function App() {
  const [simulations, setSimulations] = useState([{ id: uuidv4(), name: 'Appart Lyon 3', data: { ...INITIAL_DATA } }]);
  const [activeSimId, setActiveSimId] = useState(simulations[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef(null);

  const activeSim = simulations.find(s => s.id === activeSimId) || simulations[0];

  // --- Core Financial Engine ---
  const calculations = useMemo(() => {
    const d = activeSim.data;
    const investTotal = d.prixAchat + d.travaux + d.fraisNotaire;
    const loanAmount = Math.max(0, investTotal - d.apport);

    // Mortgage Math
    const rMensuel = d.tauxInteret / 100 / 12;
    const nMensuel = d.dureeCredit * 12;
    let mCredit = d.mensualiteCredit;
    if (d.autoCredit) {
      if (nMensuel > 0) {
        mCredit = rMensuel === 0 ? loanAmount / nMensuel : (loanAmount * rMensuel * Math.pow(1 + rMensuel, nMensuel)) / (Math.pow(1 + rMensuel, nMensuel) - 1);
      } else mCredit = 0;
    }

    const recetteMensuelleBrute = d.loyers.reduce((acc, curr) => acc + curr, 0);
    // Apply vacancy rate
    const recetteMensuelleRéelle = recetteMensuelleBrute * (1 - (d.vacanceLocative / 100));
    const recetteAnnuelle = recetteMensuelleRéelle * 12;

    const totalChargesAnnuelles = d.charges.reduce((acc, c) => acc + c.value, 0);
    const creditAnnee = mCredit * 12;

    const rBrute = investTotal > 0 ? ((recetteMensuelleBrute * 12) / investTotal) * 100 : 0;
    const rNet = investTotal > 0 ? ((recetteAnnuelle - totalChargesAnnuelles) / investTotal) * 100 : 0;
    const beneficeAn = recetteAnnuelle - (creditAnnee + totalChargesAnnuelles);
    const cashflowM = beneficeAn / 12;

    // Amortization Schedule for Chart
    const years = [0, 1, 2, 3, 5, 10, 15, 20];
    const projectionData = years.map(year => {
      const months = year * 12;
      let remainingDebt = loanAmount;
      if (rMensuel > 0 && months > 0) {
        remainingDebt = loanAmount * (Math.pow(1 + rMensuel, nMensuel) - Math.pow(1 + rMensuel, months)) / (Math.pow(1 + rMensuel, nMensuel) - 1);
      } else if (months > 0) {
        remainingDebt = Math.max(0, loanAmount - (mCredit * months));
      }
      if (year > d.dureeCredit) remainingDebt = 0;

      const cumCashflow = beneficeAn * year;
      const netWorth = (d.prixAchat + d.travaux) - remainingDebt + cumCashflow;

      return { year, remainingDebt, cumCashflow, netWorth, cumCharges: totalChargesAnnuelles * year };
    });

    return {
      investTotal, loanAmount, recetteMensuelleBrute, recetteAnnuelle, totalChargesAnnuelles,
      creditAnnee, rBrute, rNet, beneficeAn, cashflowM, mCredit, projectionData,
      recetteMensuelleRéelle
    };
  }, [activeSim]);

  // --- Handlers ---
  const updateData = (f, v) => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, [f]: parseFloat(v) || 0, ...(f === 'prixAchat' && { fraisNotaire: Math.round(parseFloat(v) * 0.08) }) } } : s));
  const updateCharge = (id, field, value) => {
    setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, charges: s.data.charges.map(c => c.id === id ? { ...c, [field]: field === 'value' ? (parseFloat(value) || 0) : value } : c) } } : s));
  };
  const addCharge = () => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, charges: [...s.data.charges, { id: uuidv4(), name: 'Nouvelle Charge', value: 0 }] } } : s));
  const removeCharge = (id) => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, charges: s.data.charges.filter(c => c.id !== id) } } : s));

  const exportSyntheticPDF = async () => {
    setIsGenerating(true);
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 1200 });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save(`Rapport_${activeSim.name}.pdf`);
    setIsGenerating(false);
  };

  const formatE = (v) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="h-screen w-screen bg-[#0f172a] text-slate-300 flex flex-col items-center overflow-hidden font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px]" />
      </div>

      <header className="relative w-full z-10 bg-slate-900/40 backdrop-blur-xl border-b border-white/5 px-8 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20"><Building2 size={20} /></div>
          <input value={activeSim.name} onChange={(e) => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, name: e.target.value } : s))} className="font-black text-white bg-transparent border-none focus:ring-0 p-0 text-xl w-64 tracking-tight" />
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          {simulations.map(sim => (
            <button key={sim.id} onClick={() => setActiveSimId(sim.id)} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeSimId === sim.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>{sim.name}</button>
          ))}
          <button onClick={() => { const n = { id: uuidv4(), name: `Projet ${simulations.length + 1}`, data: { ...INITIAL_DATA, charges: JSON.parse(JSON.stringify(INITIAL_CHARGES)) } }; setSimulations([...simulations, n]); setActiveSimId(n.id); }} className="p-2 text-indigo-400"><Plus size={18} /></button>
        </div>
        <button onClick={exportSyntheticPDF} disabled={isGenerating} className="bg-white/10 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] border border-white/10 hover:bg-white/20 transition-all flex items-center gap-2 shadow-lg active:scale-95">
          {isGenerating ? <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> : <><Download size={16} /> Rapport PDF</>}
        </button>
      </header>

      <main className="relative z-10 flex-1 w-full p-6 grid grid-cols-12 gap-6 overflow-hidden max-w-[1700px]">
        <aside className="col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide py-2 animate-in fade-in slide-in-from-left-4 duration-700">
          <GlassSection title="Investissement" icon={<Home size={18} className="text-indigo-400" />}>
            <PremiumInput label="Prix d'achat" value={activeSim.data.prixAchat} onChange={(v) => updateData('prixAchat', v)} />
            <PremiumInput label="Travaux" value={activeSim.data.travaux} onChange={(v) => updateData('travaux', v)} />
            <PremiumInput label="Notaire" value={activeSim.data.fraisNotaire} onChange={(v) => updateData('fraisNotaire', v)} />
            <div className="mt-4 p-5 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 rounded-[1.5rem] flex flex-col gap-1">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none">Total Projet</span>
              <span className="text-2xl font-black text-white tracking-tighter">{formatE(calculations.investTotal)}</span>
            </div>
          </GlassSection>

          <GlassSection title="Financement" icon={<Landmark size={18} className="text-amber-400" />}>
            <PremiumInput label="Apport Personnel" value={activeSim.data.apport} onChange={(v) => updateData('apport', v)} />
            <div className="grid grid-cols-2 gap-4">
              <PremiumInput label="Intérêt %" value={activeSim.data.tauxInteret} onChange={(v) => updateData('tauxInteret', v)} />
              <PremiumInput label="Durée (Ans)" value={activeSim.data.dureeCredit} onChange={(v) => updateData('dureeCredit', v)} />
            </div>
            <div className="mt-2 p-4 bg-slate-800/40 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calcul Auto</span><Toggle active={activeSim.data.autoCredit} onToggle={() => setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, autoCredit: !s.data.autoCredit } } : s))} /></div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none px-1">Mensualité</label>
                <div className="relative"><input type="number" disabled={activeSim.data.autoCredit} value={activeSim.data.autoCredit ? calculations.mCredit.toFixed(0) : activeSim.data.mensualiteCredit} onChange={(e) => updateData('mensualiteCredit', e.target.value)} className={`w-full bg-slate-900/50 border border-white/5 rounded-xl p-3 text-lg font-black text-white focus:ring-2 focus:ring-indigo-500/20 transition-all ${activeSim.data.autoCredit ? 'opacity-40' : ''}`} />{activeSim.data.autoCredit && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full">Auto</div>}</div>
              </div>
            </div>
          </GlassSection>

          <GlassSection title="Risques & Scénarios" icon={<AlertTriangle size={18} className="text-rose-400" />}>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none px-1">Vacance & Impayés (%)</label>
                <div className="relative">
                  <input type="number" value={activeSim.data.vacanceLocative} onChange={(e) => updateData('vacanceLocative', e.target.value)} className="w-full bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 text-sm font-black text-white focus:ring-2 focus:ring-rose-500/20 transition-all" />
                  <Percent size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500" />
                </div>
                <p className="text-[10px] text-slate-500 italic px-1 font-medium">Réduit les revenus bruts de {activeSim.data.vacanceLocative}% par mois.</p>
              </div>
            </div>
          </GlassSection>

          <GlassSection title="Loyers" icon={<Users size={18} className="text-emerald-400" />}>
            <div className="flex items-center justify-between mb-4 bg-white/5 p-2 rounded-2xl border border-white/5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Locataires ({activeSim.data.nbColocs})</span>
              <div className="flex gap-2">
                <button onClick={() => { const c = Math.max(0, activeSim.data.nbColocs - 1); setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, nbColocs: c, loyers: s.data.loyers.slice(0, c) } } : s)); }} className="w-8 h-8 flex items-center justify-center bg-slate-700/50 rounded-xl text-slate-300">-</button>
                <button onClick={() => { const c = activeSim.data.nbColocs + 1; setSimulations(p => p.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, nbColocs: c, loyers: [...s.data.loyers, 0] } } : s)); }} className="w-8 h-8 flex items-center justify-center bg-emerald-600 rounded-xl text-white shadow-lg">+</button>
              </div>
            </div>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
              {activeSim.data.loyers.map((l, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <span className="text-[10px] font-black text-slate-600 w-4 group-hover:text-indigo-400 transition-colors">{i + 1}</span>
                  <div className="relative flex-1 group">
                    <input type="number" value={l} onChange={(e) => { const v = parseFloat(e.target.value) || 0; setSimulations(p => p.map(s => { if (s.id !== activeSimId) return s; const nl = [...s.data.loyers]; nl[i] = v; return { ...s, data: { ...s.data, loyers: nl } }; })); }} className="w-full bg-white/5 text-sm font-black text-white border border-white/5 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-10" />
                    <Euro size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </GlassSection>

          <GlassSection title="Charges Annuelles" icon={<Receipt size={18} className="text-rose-400" />}>
            <div className="space-y-3 pt-1">
              {activeSim.data.charges.map((c) => (
                <div key={c.id} className="flex flex-col gap-1 relative group">
                  <div className="flex justify-between px-1"><input value={c.name} onChange={(e) => updateCharge(c.id, 'name', e.target.value)} className="bg-transparent border-none text-[9px] font-black text-slate-500 uppercase p-0 focus:ring-0 w-32 focus:text-indigo-400 transition-colors" /><button onClick={() => removeCharge(c.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400"><X size={12} /></button></div>
                  <div className="relative"><input type="number" value={c.value} onChange={(e) => updateCharge(c.id, 'value', e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs font-black text-white pr-10" /><Euro size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" /></div>
                </div>
              ))}
              <button onClick={addCharge} className="w-full py-3 bg-white/5 border border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 flex items-center justify-center gap-2 mt-2"><Plus size={14} /> Ajouter une charge</button>
            </div>
          </GlassSection>
        </aside>

        <div className="col-span-9 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="grid grid-cols-4 gap-6 h-36 shrink-0 pt-2">
            <HeroKPI label="Cashflow Réel" value={formatE(calculations.cashflowM)} color={calculations.cashflowM >= 0 ? "emerald" : "rose"} icon={<ArrowRightLeft />} highlight sub={`Après vacance (${activeSim.data.vacanceLocative}%)`} />
            <HeroKPI label="Rentabilité Nette" value={`${calculations.rNet.toFixed(2)}%`} color="indigo" icon={<TrendingUp />} />
            <HeroKPI label="Loyer Réel / mois" value={formatE(calculations.recetteMensuelleRéelle)} color="emerald" icon={<Receipt />} />
            <HeroKPI label="Charges / mois" value={formatE(calculations.totalChargesAnnuelles / 12)} color="rose" icon={<ShieldCheck />} />
          </div>

          <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
            <div className="col-span-12 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 flex flex-col shadow-2xl relative">
              <div className="flex justify-between items-center mb-10 shrink-0">
                <div><h4 className="text-xs font-black uppercase text-indigo-400 tracking-[0.3em] flex items-center gap-2 mb-1"><BarChart3 size={14} /> Simulation Patrimoniale Complète</h4><p className="text-xl font-bold text-white tracking-tight">Analyse de la dette, des charges et de l'enrichissement net (20 ans)</p></div>
                <div className="flex gap-4 p-2 bg-white/5 rounded-2xl border border-white/5">
                  <LegendI dot="bg-indigo-500" label="Valeur Nette (Enrichissement)" />
                  <LegendI dot="bg-rose-500" label="Dette Bancaire" />
                  <LegendI dot="bg-emerald-500" label="Cashflow Cumulé" />
                  <LegendI dot="bg-slate-500" label="Charges Cumulées" />
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <Line
                  data={{
                    labels: calculations.projectionData.map(d => `${d.year} an${d.year > 1 ? 's' : ''}`),
                    datasets: [
                      { label: 'Valeur Nette', data: calculations.projectionData.map(d => d.netWorth), borderColor: '#6366f1', borderWidth: 4, tension: 0.4, pointRadius: 5, fill: false },
                      { label: 'Dette', data: calculations.projectionData.map(d => d.remainingDebt), borderColor: '#f43f5e', borderWidth: 2, borderDash: [5, 5], tension: 0, pointRadius: 0, fill: false },
                      { label: 'Cashflow', data: calculations.projectionData.map(d => d.cumCashflow), borderColor: '#10b981', borderWidth: 2, tension: 0.4, pointRadius: 0, fill: false },
                      { label: 'Charges', data: calculations.projectionData.map(d => d.cumCharges), borderColor: '#64748b', borderWidth: 1, tension: 0, pointRadius: 0, fill: false }
                    ]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', padding: 12, cornerRadius: 16 } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { weight: 'bold', size: 10 }, callback: (v) => `${v / 1000}k€` } }, x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: 'bold', size: 10 } } } } }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* HIDDEN PDF TEMPLATE */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none">
        <div ref={reportRef} className="w-[210mm] p-[15mm] bg-white text-slate-900 flex flex-col gap-8 font-sans">
          <div className="flex justify-between border-b pb-6"><div><h1 className="text-3xl font-black text-indigo-600 uppercase tracking-tighter">Bilan Prévisionnel</h1><p className="font-bold text-slate-400">{activeSim.name}</p></div><div className="text-right"><p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Généré le</p><p className="font-bold">{new Date().toLocaleDateString('fr-FR')}</p></div></div>
          <div className="grid grid-cols-4 gap-4">
            <RepKPI label="Rendement Net" value={`${calculations.rNet.toFixed(2)}%`} /><RepKPI label="Cashflow Net" value={formatE(calculations.cashflowM)} highlight /><RepKPI label="Mensualité" value={formatE(calculations.mCredit)} /><RepKPI label="Vacance" value={`${activeSim.data.vacanceLocative}%`} />
          </div>
          <div className="grid grid-cols-2 gap-10 mt-2">
            <section><h3 className="text-xs font-black uppercase text-indigo-600 border-b mb-3 pb-1 text-center">Plan de Financement</h3><div className="space-y-2 text-sm"><RepRow label="Prix d'achat" value={formatE(activeSim.data.prixAchat)} /><RepRow label="Travaux" value={formatE(activeSim.data.travaux)} /><RepRow label="Frais Notaire" value={formatE(activeSim.data.fraisNotaire)} /><div className="flex justify-between font-black text-lg border-t-2 pt-2 border-slate-900 mt-2"><span>INVESTISSEMENT</span><span>{formatE(calculations.investTotal)}</span></div><RepRow label="Apport" value={formatE(activeSim.data.apport)} /><RepRow label="CRÉDIT" value={formatE(calculations.loanAmount)} /></div></section>
            <section><h3 className="text-xs font-black uppercase text-indigo-600 border-b mb-3 pb-1 text-center">Exploitation Mensuelle</h3><div className="space-y-2 text-sm"><RepRow label="Loyers Bruts" value={formatE(calculations.recetteMensuelleBrute)} /><RepRow label="Vacance Locative" value={`-${activeSim.data.vacanceLocative}%`} /><RepRow label="LOYER RÉEL" value={formatE(calculations.recetteMensuelleRéelle)} /><RepRow label="Crédit Mensuel" value={formatE(calculations.mCredit)} /><RepRow label="Charges Mensuelles" value={formatE(calculations.totalChargesAnnuelles / 12)} /><div className="flex justify-between font-black text-lg border-t-2 pt-2 border-indigo-600 mt-2 text-indigo-600"><span>BÉNÉFICE NET</span><span>{formatE(calculations.cashflowM)}</span></div></div></section>
          </div>
          <div className="mt-2"><h3 className="text-[10px] font-black uppercase text-slate-400 border-b mb-2 pb-1">Détails des Charges (Annuel)</h3><div className="grid grid-cols-2 gap-x-10 gap-y-1">{activeSim.data.charges.map(c => <div key={c.id} className="flex justify-between text-[10px] border-b pb-0.5"><span className="text-slate-500 font-bold uppercase">{c.name}</span><span className="font-black">{formatE(c.value)}</span></div>)}</div></div>
          <div className="mt-8 p-8 bg-indigo-600 rounded-[2rem] text-white flex justify-between items-center"><div><h3 className="text-lg font-bold mb-2">Conclusion financière</h3><p className="text-indigo-100 text-xs italic">Projet validé avec un enrichissement net estimé à <span className="font-black underline">{formatE(calculations.beneficeAn * 20)}</span> sur 20 ans.</p></div><div className="bg-white/10 p-5 rounded-2xl border border-white/20 text-center"><p className="text-[10px] uppercase font-black opacity-60">Gains Cumulés (20 ans)</p><p className="text-3xl font-black">{formatE(calculations.beneficeAn * 20)}</p></div></div>
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS (REUSED) ---
function GlassSection({ title, icon, children }) {
  return <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 shadow-xl transition-all group shrink-0-"><h3 className="text-xs font-black text-white border-b border-white/5 pb-4 mb-5 flex items-center justify-between uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors"><div className="flex items-center gap-3">{icon}{title}</div><ChevronDown size={16} className="text-slate-600 group-hover:translate-y-0.5 transition-transform" /></h3><div className="space-y-4">{children}</div></div>;
}
function PremiumInput({ label, value, onChange }) {
  return <div className="flex flex-col gap-2 group/input"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none px-1 group-focus-within/input:text-indigo-400 transition-colors">{label}</label> <div className="relative"><input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-500/5 border border-white/5 rounded-xl p-3 text-sm font-black text-white focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 transition-all shadow-inner" /></div></div>;
}
function HeroKPI({ label, value, color, icon, highlight = false, sub }) {
  const c = { emerald: 'text-emerald-400', indigo: 'text-indigo-400', slate: 'text-slate-400', rose: 'text-rose-400' };
  const bg = { emerald: 'bg-emerald-500/10', indigo: 'bg-indigo-500/10', slate: 'bg-slate-500/10', rose: 'bg-rose-500/10' };
  return <div className={`bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-6 flex flex-col justify-center relative shadow-xl hover:-translate-y-1 transition-all duration-500 group overflow-hidden ${highlight ? 'ring-2 ring-emerald-500/30' : ''}`}><div className="relative"><div className="flex items-center gap-2 mb-2"><div className={`p-1.5 rounded-lg ${bg[color]} ${c[color]}`}>{React.cloneElement(icon, { size: 14 })}</div><p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{label}</p></div><p className={`text-3xl font-black tracking-tighter ${c[color]}`}>{value}</p>{sub && <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">{sub}</p>}</div></div>;
}
function Toggle({ active, onToggle }) {
  return <button onClick={onToggle} className={`w-10 h-5 rounded-full transition-all relative ${active ? 'bg-indigo-600' : 'bg-slate-700'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-all ${active ? 'left-6' : 'left-1'}`} /></button>;
}
function MiniRow({ label, value, dot }) {
  const dots = { indigo: 'bg-indigo-500', slate: 'bg-slate-500', amber: 'bg-amber-500' };
  return <div className="flex justify-between items-center text-[10px] group transition-all hover:translate-x-1 shrink-0"><div className="flex items-center gap-2 truncate"><div className={`w-1.5 h-1.5 rounded-full ${dots[dot]}`} /><span className="font-bold text-slate-500 group-hover:text-white transition-colors uppercase tracking-tighter truncate">{label}</span></div><span className="font-black text-white group-hover:text-indigo-400 transition-colors shrink-0">{value}</span></div>;
}
function LegendI({ dot, label }) {
  return <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-tighter"><div className={`w-2 h-2 rounded-full ${dot}`} />{label}</div>;
}
function RepKPI({ label, value, highlight }) {
  return <div className={`p-6 bg-slate-50 rounded-2xl ${highlight ? 'border-2 border-indigo-600 ring-4 ring-indigo-50' : ''}`}><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p><p className="text-2xl font-black text-slate-950 tracking-tight">{value}</p></div>;
}
function RepRow({ label, value }) {
  return <div className="flex justify-between items-end border-b border-slate-100 pb-1.5"><span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span><span className="font-black text-slate-900">{value}</span></div>;
}
