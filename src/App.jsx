import React, { useState, useMemo, useRef } from 'react';
import {
  Calculator, Home, Euro, Percent, Users, Receipt, CreditCard, ShieldCheck,
  TrendingUp, Landmark, ArrowRightLeft, UserPlus, Plus, Trash2, Info,
  ChevronDown, ChevronUp, Download, Share2, Link as LinkIcon, Building2,
  Calendar, LineChart as ChartIcon, FileText, Trash, Copy
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend
);

const INITIAL_DATA = {
  prixAchat: 92000, travaux: 20000, fraisNotaire: 7360, apport: 15000,
  tauxInteret: 3.85, dureeCredit: 20, mensualiteCredit: 567,
  nbColocs: 3, loyers: [493, 493, 493],
  chargesCopro: 2733, assurancePNO: 159.81, internet: 420, electricite: 600, eau: 696,
  taxeFonciere: 1170, travauxCopro: 0, cfe: 354, compta: 289, rentila: 48, ogi: 102, cotisationBancaire: 0
};

export default function App() {
  const [simulations, setSimulations] = useState([
    { id: uuidv4(), name: 'Appart Lyon 3', link: '', data: { ...INITIAL_DATA } }
  ]);
  const [activeSimId, setActiveSimId] = useState(simulations[0].id);
  const [activeTab, setActiveTab] = useState('investment');
  const reportRef = useRef(null);

  const activeSim = simulations.find(s => s.id === activeSimId) || simulations[0];

  const calculations = useMemo(() => {
    const data = activeSim.data;
    const investissementTotal = data.prixAchat + data.travaux + data.fraisNotaire;
    const montantAEmprunter = Math.max(0, investissementTotal - data.apport);
    const recetteMensuelle = data.loyers.reduce((acc, curr) => acc + curr, 0);
    const recetteAnnuelle = recetteMensuelle * 12;
    const chargesServicesAnnuel = data.internet + data.electricite + data.eau;
    const chargesFixesAnnuelles = data.taxeFonciere + data.travauxCopro + data.cfe + data.assurancePNO + data.compta + data.rentila + data.ogi + data.cotisationBancaire;
    const totalChargesAnnuelles = data.chargesCopro + chargesServicesAnnuel + chargesFixesAnnuelles;
    const coutCreditAnnuel = data.mensualiteCredit * 12;
    const rentabiliteBrute = investissementTotal > 0 ? (recetteAnnuelle / investissementTotal) * 100 : 0;
    const rentabiliteNet = investissementTotal > 0 ? ((recetteAnnuelle - totalChargesAnnuelles) / investissementTotal) * 100 : 0;
    const beneficeAnnuel = recetteAnnuelle - (coutCreditAnnuel + totalChargesAnnuelles);
    const cashflowMensuel = beneficeAnnuel / 12;

    return {
      investissementTotal, montantAEmprunter, recetteMensuelle, recetteAnnuelle,
      totalChargesAnnuelles, coutCreditAnnuel, rentabiliteBrute, rentabiliteNet,
      beneficeAnnuel, cashflowMensuel
    };
  }, [activeSim]);

  const updateSimData = (field, value) => {
    setSimulations(prev => prev.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, [field]: parseFloat(value) || 0 } } : s));
  };

  const updateSimMeta = (field, value) => {
    setSimulations(prev => prev.map(s => s.id === activeSimId ? { ...s, [field]: value } : s));
  };

  const formatEuro = (val) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col items-center overflow-hidden font-sans text-slate-800">
      {/* Minimal Header */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-1.5 rounded-lg text-white"><Calculator size={18} /></div>
          <input
            value={activeSim.name}
            onChange={(e) => updateSimMeta('name', e.target.value)}
            className="font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0 text-lg w-40"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto max-w-[50%] scrollbar-hide">
          {simulations.map(sim => (
            <button
              key={sim.id}
              onClick={() => setActiveSimId(sim.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${activeSimId === sim.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {sim.name}
            </button>
          ))}
          <button
            onClick={() => {
              const newSim = { id: uuidv4(), name: `Appart ${simulations.length + 1}`, link: '', data: { ...INITIAL_DATA } };
              setSimulations([...simulations, newSim]);
              setActiveSimId(newSim.id);
            }}
            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Download size={18} /></button>
          <button className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm">Partager</button>
        </div>
      </header>

      {/* Main Dashboard - No Scroll */}
      <main className="flex-1 w-full p-4 grid grid-cols-12 gap-4 overflow-hidden">

        {/* Left: Inputs Container */}
        <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
          <SectionBox title="Investissement" icon={<Home size={16} className="text-blue-500" />}>
            <MiniInput label="Prix d'achat" value={activeSim.data.prixAchat} onChange={(v) => updateSimData('prixAchat', v)} />
            <MiniInput label="Travaux" value={activeSim.data.travaux} onChange={(v) => updateSimData('travaux', v)} />
            <MiniInput label="Frais Notaire" value={activeSim.data.fraisNotaire} onChange={(v) => updateSimData('fraisNotaire', v)} />
            <div className="mt-2 p-2 bg-blue-50 rounded-lg flex justify-between text-xs font-bold">
              <span className="text-blue-600">Total Projet</span>
              <span>{formatEuro(calculations.investissementTotal)}</span>
            </div>
          </SectionBox>

          <SectionBox title="Banque" icon={<Landmark size={16} className="text-amber-500" />}>
            <MiniInput label="Apport" value={activeSim.data.apport} onChange={(v) => updateSimData('apport', v)} />
            <div className="flex gap-2">
              <MiniInput label="Taux %" value={activeSim.data.tauxInteret} onChange={(v) => updateSimData('tauxInteret', v)} />
              <MiniInput label="Ans" value={activeSim.data.dureeCredit} onChange={(v) => updateSimData('dureeCredit', v)} />
            </div>
            <MiniInput label="Mensualité" value={activeSim.data.mensualiteCredit} onChange={(v) => updateSimData('mensualiteCredit', v)} />
          </SectionBox>

          <SectionBox title="Loyers" icon={<Users size={16} className="text-emerald-500" />}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Locataires: {activeSim.data.nbColocs}</span>
              <div className="flex gap-1">
                <button onClick={() => {
                  const count = Math.max(0, activeSim.data.nbColocs - 1);
                  setSimulations(prev => prev.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, nbColocs: count, loyers: s.data.loyers.slice(0, count) } } : s));
                }} className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-slate-500">-</button>
                <button onClick={() => {
                  const count = activeSim.data.nbColocs + 1;
                  setSimulations(prev => prev.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, nbColocs: count, loyers: [...s.data.loyers, 0] } } : s));
                }} className="w-5 h-5 flex items-center justify-center bg-emerald-600 rounded text-white">+</button>
              </div>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {activeSim.data.loyers.map((loyer, i) => (
                <input key={i} type="number" value={loyer} onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setSimulations(prev => prev.map(s => {
                    if (s.id !== activeSimId) return s;
                    const nl = [...s.data.loyers]; nl[i] = val;
                    return { ...s, data: { ...s.data, loyers: nl } };
                  }));
                }} className="w-full bg-slate-50 text-[11px] font-bold border-none rounded p-1 mb-1 focus:ring-1 focus:ring-emerald-500" />
              ))}
            </div>
          </SectionBox>
        </div>

        {/* Right: Insights Grid */}
        <div className="col-span-9 flex flex-col gap-4">
          {/* Top Row: KPIs */}
          <div className="grid grid-cols-4 gap-4 h-24 shrink-0">
            <SmallKPI label="Rentabilité Nette" value={`${calculations.rentabiliteNet.toFixed(2)}%`} color="emerald" />
            <SmallKPI label="Cashflow Mensuel" value={formatEuro(calculations.cashflowMensuel)} color={calculations.cashflowMensuel >= 0 ? "emerald" : "red"} highlight />
            <SmallKPI label="Rentabilité Brute" value={`${calculations.rentabiliteBrute.toFixed(2)}%`} color="blue" />
            <SmallKPI label="Bénéfice Annuel" value={formatEuro(calculations.beneficeAnnuel)} color="slate" />
          </div>

          {/* Bottom Row: Charts & Visuals */}
          <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
            {/* Chart 1: Projections */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col shadow-sm">
              <h4 className="text-xs font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
                <ChartIcon size={14} className="text-emerald-500" /> Projection Cashflow Cumulé (20 ans)
              </h4>
              <div className="flex-1 min-h-0">
                <Line
                  data={{
                    labels: [0, 1, 2, 3, 5, 10, 15, 20],
                    datasets: [{
                      label: 'Cashflow (€)',
                      data: [0, 1, 2, 3, 5, 10, 15, 20].map(y => calculations.beneficeAnnuel * y),
                      borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, pointRadius: 2
                    }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { font: { size: 9 } } }, x: { ticks: { font: { size: 9 } } } } }}
                />
              </div>
            </div>

            {/* Charges & Summary */}
            <div className="flex flex-col gap-4">
              <div className="bg-slate-900 rounded-2xl p-4 text-white flex-1 flex flex-col justify-center relative overflow-hidden shadow-lg">
                <Building2 className="absolute -bottom-4 -right-4 opacity-10" size={100} />
                <div className="relative">
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Patrimoine Final (20 ans)</p>
                  <p className="text-4xl font-black text-emerald-400 mb-4">{formatEuro(calculations.beneficeAnnuel * 20 + calculations.investissementTotal)}</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between opacity-80"><span>Apport initial</span><span>-{formatEuro(activeSim.data.apport)}</span></div>
                    <div className="flex justify-between text-emerald-300 font-bold border-t border-white/10 pt-2"><span>Total Cashflow</span><span>+{formatEuro(calculations.beneficeAnnuel * 20)}</span></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 h-32 shrink-0 shadow-sm">
                <div className="w-24 shrink-0">
                  <Doughnut
                    data={{
                      labels: ['Fixes', 'Exploit'],
                      datasets: [{ data: [calculations.totalChargesAnnuelles - (activeSim.data.electricite + activeSim.data.internet + activeSim.data.eau), (activeSim.data.electricite + activeSim.data.internet + activeSim.data.eau)], backgroundColor: ['#3b82f6', '#f59e0b'], borderWidth: 0 }]
                    }}
                    options={{ cutout: '70%', plugins: { legend: { display: false } } }}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center gap-1 overflow-y-auto">
                  <p className="text-[10px] font-black uppercase text-slate-400">Détail Charges / an</p>
                  <div className="flex justify-between text-[11px]"><span>Copropriété</span><span className="font-bold">{formatEuro(activeSim.data.chargesCopro)}</span></div>
                  <div className="flex justify-between text-[11px]"><span>Taxes & Fiscalité</span><span className="font-bold">{formatEuro(activeSim.data.taxeFonciere + activeSim.data.cfe)}</span></div>
                  <div className="flex justify-between text-[11px]"><span>Services (Web/Eau)</span><span className="font-bold">{formatEuro(activeSim.data.internet + activeSim.data.eau + activeSim.data.electricite)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionBox({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm shrink-0">
      <h3 className="text-xs font-black text-slate-900 border-b border-slate-50 pb-2 mb-3 flex items-center gap-2 uppercase tracking-tight">
        {icon}{title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function MiniInput({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border-none rounded-lg p-1.5 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500 transition-all"
      />
    </div>
  );
}

function SmallKPI({ label, value, color, highlight = false }) {
  const colors = {
    emerald: 'text-emerald-600', blue: 'text-blue-600', slate: 'text-slate-900', red: 'text-red-500'
  };
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-3 h-full flex flex-col justify-center shadow-sm transition-transform hover:scale-[1.02] ${highlight ? 'ring-1 ring-emerald-500/30' : ''}`}>
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1.5">{label}</p>
      <p className={`text-xl font-black ${colors[color]}`}>{value}</p>
    </div>
  );
}
