import React, { useState, useMemo, useRef, useEffect } from 'react';
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

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend
);

const INITIAL_DATA = {
  prixAchat: 92000, travaux: 20000, fraisNotaire: 7360, apport: 15000,
  tauxInteret: 3.85, dureeCredit: 20, mensualiteCredit: 567,
  autoCredit: true, // New: auto-calculate credit?
  nbColocs: 3, loyers: [493, 493, 493],
  chargesCopro: 2733, assurancePNO: 159.81, internet: 420, electricite: 600, eau: 696,
  taxeFonciere: 1170, travauxCopro: 0, cfe: 354, compta: 289, rentila: 48, ogi: 102, cotisationBancaire: 0
};

export default function App() {
  const [simulations, setSimulations] = useState([
    { id: uuidv4(), name: 'Appart Lyon 3', link: '', data: { ...INITIAL_DATA } }
  ]);
  const [activeSimId, setActiveSimId] = useState(simulations[0].id);

  const activeSim = simulations.find(s => s.id === activeSimId) || simulations[0];

  const calculations = useMemo(() => {
    const d = activeSim.data;
    const investissementTotal = d.prixAchat + d.travaux + d.fraisNotaire;
    const montantAEmprunter = Math.max(0, investissementTotal - d.apport);

    // Calculate dynamic monthly payment if auto is on
    let mCredit = d.mensualiteCredit;
    if (d.autoCredit) {
      const r = d.tauxInteret / 100 / 12;
      const n = d.dureeCredit * 12;
      if (n > 0) {
        if (r === 0) mCredit = montantAEmprunter / n;
        else mCredit = (montantAEmprunter * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      } else {
        mCredit = 0;
      }
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
      let val = parseFloat(value);
      if (isNaN(val)) val = 0;

      const newData = { ...s.data, [field]: val };

      // Auto-calculate Notary Fees if Price changes (approx 8%)
      if (field === 'prixAchat') {
        newData.fraisNotaire = Math.round(val * 0.08);
      }

      return { ...s, data: newData };
    }));
  };

  const toggleAutoCredit = () => {
    setSimulations(prev => prev.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, autoCredit: !s.data.autoCredit } } : s));
  };

  const formatEuro = (val) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col items-center overflow-hidden font-sans text-slate-800">
      <header className="w-full bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-1.5 rounded-lg text-white font-bold tracking-tighter shadow-sm shadow-emerald-200 cursor-default">
            <Building2 size={18} />
          </div>
          <input
            value={activeSim.name}
            onChange={(e) => setSimulations(prev => prev.map(s => s.id === activeSimId ? { ...s, name: e.target.value } : s))}
            className="font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0 text-lg w-48 hover:bg-slate-50 rounded px-1 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto max-w-[40%] scrollbar-hide">
          {simulations.map(sim => (
            <button
              key={sim.id}
              onClick={() => setActiveSimId(sim.id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 uppercase tracking-tighter ${activeSimId === sim.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-900 hover:bg-white'}`}
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
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors shrink-0 bg-emerald-50/30"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Download size={20} /></button>
          <button className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-tighter shadow-lg shadow-emerald-100 active:scale-95 transition-all">Partager</button>
        </div>
      </header>

      <main className="flex-1 w-full p-4 grid grid-cols-12 gap-4 overflow-hidden max-w-[1600px]">

        <aside className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-hide">
          <SectionBox title="Investissement" icon={<Home size={16} className="text-blue-500" />}>
            <MiniInput label="Prix d'achat" value={activeSim.data.prixAchat} onChange={(v) => updateSimData('prixAchat', v)} />
            <MiniInput label="Travaux Estimés" value={activeSim.data.travaux} onChange={(v) => updateSimData('travaux', v)} />
            <MiniInput label="Frais Notaire (Auto 8%)" value={activeSim.data.fraisNotaire} onChange={(v) => updateSimData('fraisNotaire', v)} />
            <div className="mt-2 p-3 bg-blue-600 rounded-xl flex justify-between items-center text-white shadow-lg shadow-blue-100">
              <span className="text-[10px] font-black uppercase opacity-80 uppercase tracking-widest">Total Projet</span>
              <span className="text-lg font-black">{formatEuro(calculations.investissementTotal)}</span>
            </div>
          </SectionBox>

          <SectionBox title="Financement" icon={<Landmark size={16} className="text-amber-500" />}>
            <MiniInput label="Apport Personnel" value={activeSim.data.apport} onChange={(v) => updateSimData('apport', v)} />
            <div className="grid grid-cols-2 gap-3">
              <MiniInput label="Taux Intérêt %" value={activeSim.data.tauxInteret} onChange={(v) => updateSimData('tauxInteret', v)} />
              <MiniInput label="Durée (Ans)" value={activeSim.data.dureeCredit} onChange={(v) => updateSimData('dureeCredit', v)} />
            </div>
            <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl mt-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Calcul Auto</span>
                <button
                  onClick={toggleAutoCredit}
                  className={`w-8 h-4 rounded-full transition-colors relative ${activeSim.data.autoCredit ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${activeSim.data.autoCredit ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="flex flex-col">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mensualité</label>
                <input
                  type="number"
                  disabled={activeSim.data.autoCredit}
                  value={activeSim.data.autoCredit ? calculations.calculatedMensualite.toFixed(0) : activeSim.data.mensualiteCredit}
                  onChange={(e) => updateSimData('mensualiteCredit', e.target.value)}
                  className={`w-full bg-white border-none rounded-lg p-2 text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all ${activeSim.data.autoCredit ? 'opacity-50' : 'shadow-sm'}`}
                />
                {activeSim.data.autoCredit && <p className="text-[10px] text-emerald-600 font-bold mt-1 text-center italic">Calculé selon taux/durée</p>}
              </div>
            </div>
          </SectionBox>

          <SectionBox title="Revenus Coloc" icon={<Users size={16} className="text-emerald-500" />}>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Chambres: {activeSim.data.nbColocs}</span>
              <div className="flex gap-1.5">
                <button onClick={() => {
                  const count = Math.max(0, activeSim.data.nbColocs - 1);
                  setSimulations(prev => prev.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, nbColocs: count, loyers: s.data.loyers.slice(0, count) } } : s));
                }} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors font-bold">-</button>
                <button onClick={() => {
                  const count = activeSim.data.nbColocs + 1;
                  setSimulations(prev => prev.map(s => s.id === activeSimId ? { ...s, data: { ...s.data, nbColocs: count, loyers: [...s.data.loyers, 0] } } : s));
                }} className="w-6 h-6 flex items-center justify-center bg-emerald-600 rounded-lg text-white hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-100 font-bold">+</button>
              </div>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
              {activeSim.data.loyers.map((loyer, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <span className="text-[10px] font-bold text-slate-300 w-4">{i + 1}</span>
                  <div className="relative flex-1">
                    <input type="number" value={loyer} onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setSimulations(prev => prev.map(s => {
                        if (s.id !== activeSimId) return s;
                        const nl = [...s.data.loyers]; nl[i] = val;
                        return { ...s, data: { ...s.data, loyers: nl } };
                      }));
                    }} className="w-full bg-slate-50 text-xs font-black border border-slate-100 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all pr-6" />
                    <Euro size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </SectionBox>
        </aside>

        <div className="col-span-9 flex flex-col gap-4 min-h-0">
          <div className="grid grid-cols-4 gap-4 h-28 shrink-0">
            <KPIBox label="Cashflow Mensuel" value={formatEuro(calculations.cashflowMensuel)} color={calculations.cashflowMensuel >= 0 ? "emerald" : "red"} highlight icon={<ArrowRightLeft size={16} />} />
            <KPIBox label="Rentabilité Nette" value={`${calculations.rentabiliteNet.toFixed(2)}%`} color="blue" icon={<TrendingUp size={16} />} />
            <KPIBox label="Rentabilité Brute" value={`${calculations.rentabiliteBrute.toFixed(2)}%`} color="slate" icon={<Percent size={16} />} />
            <KPIBox label="Recette Annuelle" value={formatEuro(calculations.recetteAnnuelle)} color="emerald" icon={<Receipt size={16} />} />
          </div>

          <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
            <div className="col-span-8 bg-white rounded-[2rem] border border-slate-200 p-6 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                  <ChartIcon size={14} className="text-emerald-500" /> Projection Patrimoine & Cashflow (20 ans)
                </h4>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Cashflow</div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><div className="w-2 h-2 rounded-full border border-blue-500 border-dashed"></div> Patrimoine</div>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <Line
                  data={{
                    labels: [0, 1, 2, 3, 5, 10, 15, 20],
                    datasets: [
                      {
                        label: 'Cashflow Cumulé',
                        data: [0, 1, 2, 3, 5, 10, 15, 20].map(y => calculations.beneficeAnnuel * y),
                        borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.05)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#fff', pointBorderWidth: 2
                      },
                      {
                        label: 'Valeur Patrimoine',
                        data: Array(8).fill(calculations.investissementTotal),
                        borderColor: '#3b82f6', borderDash: [5, 5], fill: false, tension: 0, pointRadius: 0
                      }
                    ]
                  }}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', titleFont: { size: 12 }, bodyFont: { size: 12, weight: 'bold' } } },
                    scales: {
                      y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { weight: 'bold', size: 10 }, callback: (v) => `${v / 1000}k€` } },
                      x: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 10 } } }
                    }
                  }}
                />
              </div>
            </div>

            <div className="col-span-4 flex flex-col gap-4">
              <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex-1 flex flex-col justify-center relative overflow-hidden shadow-2xl shadow-slate-300">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
                  <Building2 size={120} />
                </div>
                <div className="relative">
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.3em] mb-2 leading-none">Valeur Finale Estimée</p>
                  <p className="text-5xl font-black text-emerald-400 mb-6 tracking-tighter leading-none">
                    {formatEuro(calculations.beneficeAnnuel * 20 + calculations.investissementTotal)}
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                      <span>Investissement</span>
                      <span>-{formatEuro(activeSim.data.apport)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black text-emerald-300 bg-white/5 p-3 rounded-xl border border-white/10 uppercase tracking-tighter">
                      <span>Cashflow Total (20 ans)</span>
                      <span>+{formatEuro(calculations.beneficeAnnuel * 20)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 p-6 flex gap-6 h-40 shrink-0 shadow-sm relative group overflow-hidden">
                <div className="w-24 shrink-0 relative">
                  <Doughnut
                    data={{
                      labels: ['Fixes', 'Charge'],
                      datasets: [{ data: [calculations.totalChargesAnnuelles - (activeSim.data.electricite + activeSim.data.internet + activeSim.data.eau), (activeSim.data.electricite + activeSim.data.internet + activeSim.data.eau)], backgroundColor: ['#3b82f6', '#f59e0b'], borderWidth: 0, hoverOffset: 4 }]
                    }}
                    options={{ cutout: '75%', plugins: { legend: { display: false } } }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <ShieldCheck size={16} className="text-slate-200" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Charges Annuelles</p>
                  <DetailRow label="Copro" value={formatEuro(activeSim.data.chargesCopro)} color="bg-blue-500" />
                  <DetailRow label="Taxes" value={formatEuro(activeSim.data.taxeFonciere + activeSim.data.cfe)} color="bg-slate-500" />
                  <DetailRow label="Énergie/Web" value={formatEuro(activeSim.data.internet + activeSim.data.eau + activeSim.data.electricite)} color="bg-amber-500" />
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
    <div className="bg-white rounded-[1.5rem] border border-slate-200 p-4 shadow-sm shrink-0 transition-all hover:shadow-md">
      <h3 className="text-[11px] font-black text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center justify-between uppercase tracking-[0.15em]">
        <div className="flex items-center gap-2">{icon}{title}</div>
        <ChevronDown size={14} className="text-slate-300" />
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function MiniInput({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5 group">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none px-1 group-focus-within:text-emerald-500 transition-colors">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-50 border-2 border-transparent rounded-xl p-2.5 text-xs font-black text-slate-900 focus:ring-0 focus:border-emerald-500/20 focus:bg-white transition-all shadow-inner"
        />
      </div>
    </div>
  );
}

function KPIBox({ label, value, color, highlight = false, icon }) {
  const colors = {
    emerald: 'text-emerald-600', blue: 'text-blue-600', slate: 'text-slate-900', red: 'text-red-500'
  };
  return (
    <div className={`bg-white rounded-[2rem] border border-slate-200 p-5 flex flex-col justify-center shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 ${highlight ? 'ring-2 ring-emerald-500 shadow-xl shadow-emerald-50' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none">{label}</p>
        <div className={`opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-black tracking-tighter ${colors[color]}`}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value, color }) {
  return (
    <div className="flex justify-between items-center text-[10px] gap-2">
      <div className="flex items-center gap-2 truncate">
        <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
        <span className="font-bold text-slate-500 truncate uppercase tracking-tighter">{label}</span>
      </div>
      <span className="font-black text-slate-900 shrink-0">{value}</span>
    </div>
  );
}
