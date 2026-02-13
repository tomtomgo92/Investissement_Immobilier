import React, { useState, useMemo, useRef } from 'react';
import {
  Calculator, Home, Euro, Percent, Users, Receipt, CreditCard, ShieldCheck,
  TrendingUp, Landmark, ArrowRightLeft, UserPlus, Plus, Trash2, Info,
  ChevronDown, ChevronUp, Download, Share2, Link as LinkIcon, Building2,
  Calendar, LineChart as ChartIcon, FileText, Trash, Copy
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const INITIAL_DATA = {
  // Investment
  prixAchat: 92000,
  travaux: 20000,
  fraisNotaire: 7360,
  apport: 15000,

  // Bank / Financing
  tauxInteret: 3.85,
  dureeCredit: 20,
  mensualiteCredit: 567,

  // Rental Income
  nbColocs: 3,
  loyers: [493, 493, 493],

  // Expenses - Copro & Services
  chargesCopro: 2733,
  assurancePNO: 159.81,
  internet: 420,
  electricite: 600,
  eau: 696,

  // Taxes & Fixed Fees
  taxeFonciere: 1170,
  travauxCopro: 0,
  cfe: 354,
  compta: 289,
  rentila: 48,
  ogi: 102,
  cotisationBancaire: 0
};

export default function App() {
  const [simulations, setSimulations] = useState([
    { id: uuidv4(), name: 'Appartement Lyon 3', link: 'https://www.seloger.com', data: { ...INITIAL_DATA } }
  ]);
  const [activeSimId, setActiveSimId] = useState(simulations[0].id);
  const [activeTab, setActiveTab] = useState('investment');
  const reportRef = useRef(null);

  const activeSim = simulations.find(s => s.id === activeSimId) || simulations[0];

  // --- CALCULATIONS ---
  const getCalculations = (data) => {
    const investissementTotal = data.prixAchat + data.travaux + data.fraisNotaire;
    const montantAEmprunter = Math.max(0, investissementTotal - data.apport);

    const recetteMensuelle = data.loyers.reduce((acc, curr) => acc + curr, 0);
    const recetteAnnuelle = recetteMensuelle * 12;

    const chargesServicesAnnuel = data.internet + data.electricite + data.eau;
    const chargesFixesAnnuelles = (
      data.taxeFonciere +
      data.travauxCopro +
      data.cfe +
      data.assurancePNO +
      data.compta +
      data.rentila +
      data.ogi +
      data.cotisationBancaire
    );

    const totalChargesAnnuelles = data.chargesCopro + chargesServicesAnnuel + chargesFixesAnnuelles;
    const coutCreditAnnuel = data.mensualiteCredit * 12;

    const rentabiliteBrute = investissementTotal > 0 ? (recetteAnnuelle / investissementTotal) * 100 : 0;
    const rentabiliteNet = investissementTotal > 0 ? ((recetteAnnuelle - totalChargesAnnuelles) / investissementTotal) * 100 : 0;

    const coutTotalAnnuel = coutCreditAnnuel + totalChargesAnnuelles;
    const beneficeAnnuel = recetteAnnuelle - coutTotalAnnuel;
    const cashflowMensuel = beneficeAnnuel / 12;

    return {
      investissementTotal,
      montantAEmprunter,
      recetteMensuelle,
      recetteAnnuelle,
      totalChargesAnnuelles,
      coutCreditAnnuel,
      rentabiliteBrute,
      rentabiliteNet,
      beneficeAnnuel,
      cashflowMensuel
    };
  };

  const calculations = useMemo(() => getCalculations(activeSim.data), [activeSim]);

  // --- HANDLERS ---
  const updateSimData = (field, value) => {
    setSimulations(prev => prev.map(s =>
      s.id === activeSimId
        ? { ...s, data: { ...s.data, [field]: parseFloat(value) || 0 } }
        : s
    ));
  };

  const updateSimMeta = (field, value) => {
    setSimulations(prev => prev.map(s =>
      s.id === activeSimId ? { ...s, [field]: value } : s
    ));
  };

  const addNewSimulation = () => {
    const newSim = {
      id: uuidv4(),
      name: `Appartement ${simulations.length + 1}`,
      link: '',
      data: { ...INITIAL_DATA }
    };
    setSimulations([...simulations, newSim]);
    setActiveSimId(newSim.id);
  };

  const deleteSimulation = (id) => {
    if (simulations.length <= 1) return;
    const newSims = simulations.filter(s => s.id !== id);
    setSimulations(newSims);
    if (activeSimId === id) setActiveSimId(newSims[0].id);
  };

  const handleNbColocsChange = (val) => {
    const count = Math.max(0, parseInt(val) || 0);
    setSimulations(prev => prev.map(s => {
      if (s.id !== activeSimId) return s;
      let newLoyers = [...s.data.loyers];
      if (count > newLoyers.length) {
        newLoyers = [...newLoyers, ...Array(count - newLoyers.length).fill(0)];
      } else {
        newLoyers = newLoyers.slice(0, count);
      }
      return { ...s, data: { ...s.data, nbColocs: count, loyers: newLoyers } };
    }));
  };

  const handleLoyerChange = (index, value) => {
    const val = parseFloat(value) || 0;
    setSimulations(prev => prev.map(s => {
      if (s.id !== activeSimId) return s;
      const newLoyers = [...s.data.loyers];
      newLoyers[index] = val;
      return { ...s, data: { ...s.data, loyers: newLoyers } };
    }));
  };

  const formatEuro = (val) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);

  const exportPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Simulation_${activeSim.name}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-100 pb-12">
      {/* BG Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[20%] -left-[10%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px] opacity-50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Simulation Manager */}
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          {simulations.map(sim => (
            <button
              key={sim.id}
              onClick={() => setActiveSimId(sim.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSimId === sim.id
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <Building2 size={16} />
              {sim.name}
              {simulations.length > 1 && activeSimId === sim.id && (
                <Trash2
                  size={14}
                  className="ml-2 text-slate-400 hover:text-red-400"
                  onClick={(e) => { e.stopPropagation(); deleteSimulation(sim.id); }}
                />
              )}
            </button>
          ))}
          <button
            onClick={addNewSimulation}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all border border-emerald-100 border-dashed"
          >
            <Plus size={16} />
            Nouvelle Simulation
          </button>
        </div>

        <div ref={reportRef} className="p-2">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
                  <Calculator size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <input
                      value={activeSim.name}
                      onChange={(e) => updateSimMeta('name', e.target.value)}
                      className="text-3xl md:text-4xl font-black text-slate-900 bg-transparent border-none focus:ring-0 p-0 w-full md:w-auto"
                    />
                    <TrendingUp className="text-emerald-500" size={24} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <LinkIcon size={14} className="text-slate-400" />
                    <input
                      placeholder="Lien vers l'annonce (ex: SeLoger...)"
                      value={activeSim.link}
                      onChange={(e) => updateSimMeta('link', e.target.value)}
                      className="text-xs text-blue-500 underline bg-transparent border-none focus:ring-0 p-0 w-full opacity-60 hover:opacity-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm group"
              >
                <Download size={20} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                Exporter PDF
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-900 rounded-2xl text-sm font-bold text-white hover:shadow-xl hover:shadow-slate-200 transition-all">
                <Share2 size={20} />
                Partager
              </button>
            </div>
          </header>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <KPICard
              label="Rentabilité brute"
              value={`${calculations.rentabiliteBrute.toFixed(2)}%`}
              description="Basé sur l'investissement"
              color="emerald"
            />
            <KPICard
              label="Rentabilité nette"
              value={`${calculations.rentabiliteNet.toFixed(2)}%`}
              description="Après charges et taxes"
              color="blue"
            />
            <KPICard
              label="Cashflow Mensuel"
              value={formatEuro(calculations.cashflowMensuel)}
              description="Bénéfice après crédit"
              color={calculations.cashflowMensuel >= 0 ? 'emerald' : 'red'}
              highlight
            />
            <KPICard
              label="Investissement"
              value={formatEuro(calculations.investissementTotal)}
              description="Total projet"
              color="slate"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar: Inputs */}
            <aside className="lg:col-span-4 space-y-6">
              <SectionCard title="Cœur du Projet" icon={<Home className="text-blue-500" />}>
                <InputGroup label="Prix d'achat" value={activeSim.data.prixAchat} onChange={(v) => updateSimData('prixAchat', v)} icon={<Euro size={16} />} />
                <InputGroup label="Travaux" value={activeSim.data.travaux} onChange={(v) => updateSimData('travaux', v)} icon={<Euro size={16} />} />
                <InputGroup label="Frais de notaire" value={activeSim.data.fraisNotaire} onChange={(v) => updateSimData('fraisNotaire', v)} icon={<Euro size={16} />} />
                <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total</span>
                  <span className="text-xl font-black text-blue-900">{formatEuro(calculations.investissementTotal)}</span>
                </div>
              </SectionCard>

              <SectionCard title="Financement" icon={<Landmark className="text-amber-500" />}>
                <InputGroup label="Apport personnel" value={activeSim.data.apport} onChange={(v) => updateSimData('apport', v)} icon={<Euro size={16} />} />
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Taux (%)" value={activeSim.data.tauxInteret} onChange={(v) => updateSimData('tauxInteret', v)} icon={<Percent size={14} />} small />
                  <InputGroup label="Durée (ans)" value={activeSim.data.dureeCredit} onChange={(v) => updateSimData('dureeCredit', v)} small />
                </div>
                <InputGroup label="Mensualité Crédit" value={activeSim.data.mensualiteCredit} onChange={(v) => updateSimData('mensualiteCredit', v)} icon={<Euro size={16} />} />
              </SectionCard>
            </aside>

            {/* Main Content: Tabs & Views */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="flex border-b border-slate-100 px-8 bg-slate-50/50">
                  <TabButton active={activeTab === 'investment'} onClick={() => setActiveTab('investment')} label="Revenus" icon={<Users size={16} />} />
                  <TabButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} label="Charges" icon={<ShieldCheck size={16} />} />
                  <TabButton active={activeTab === 'projections'} onClick={() => setActiveTab('projections')} label="Simulations 20 ans" icon={<ChartIcon size={16} />} />
                </div>

                <div className="p-8">
                  {activeTab === 'investment' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-black text-slate-900">Gestion des Loyers</h3>
                          <p className="text-sm text-slate-500">Détaillez les revenus par chambre ou unité.</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                          <button
                            onClick={() => handleNbColocsChange(activeSim.data.nbColocs - 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:text-red-500 transition-all border border-slate-100"
                          >
                            <Trash2 size={18} />
                          </button>
                          <span className="w-10 text-center font-black text-slate-900 text-lg">{activeSim.data.nbColocs}</span>
                          <button
                            onClick={() => handleNbColocsChange(activeSim.data.nbColocs + 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10 border-b border-slate-100">
                        {activeSim.data.loyers.map((loyer, index) => (
                          <div key={index} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all">
                            <InputGroup
                              label={`Loyer Locataire ${index + 1}`}
                              value={loyer}
                              onChange={(v) => handleLoyerChange(index, v)}
                              icon={<Euro size={16} />}
                              bordered={false}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-5">
                          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-[1.5rem] shadow-inner">
                            <Receipt size={32} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Cashflow mensuel</p>
                            <p className={`text-4xl font-black ${calculations.cashflowMensuel >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {formatEuro(calculations.cashflowMensuel)}
                            </p>
                          </div>
                        </div>
                        <div className="px-10 py-6 bg-slate-900 rounded-[2rem] text-center w-full md:w-auto overflow-hidden relative group">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                            <TrendingUp size={80} />
                          </div>
                          <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em] mb-1 relative">Revenu Annuel</p>
                          <p className="text-4xl font-black text-white relative">{formatEuro(calculations.recetteAnnuelle)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'expenses' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">
                          <ShieldCheck size={16} className="text-blue-500" /> Charges Exploitation
                        </h4>
                        <div className="space-y-4">
                          <InputGroup label="Copropriété" value={activeSim.data.chargesCopro} onChange={(v) => updateSimData('chargesCopro', v)} small />
                          <InputGroup label="Électricité" value={activeSim.data.electricite} onChange={(v) => updateSimData('electricite', v)} small />
                          <InputGroup label="Internet" value={activeSim.data.internet} onChange={(v) => updateSimData('internet', v)} small />
                          <InputGroup label="Eau" value={activeSim.data.eau} onChange={(v) => updateSimData('eau', v)} small />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">
                          <CreditCard size={16} className="text-emerald-500" /> Fiscalité & Divers
                        </h4>
                        <div className="space-y-4">
                          <InputGroup label="Taxe Foncière" value={activeSim.data.taxeFonciere} onChange={(v) => updateSimData('taxeFonciere', v)} small />
                          <InputGroup label="CFE" value={activeSim.data.cfe} onChange={(v) => updateSimData('cfe', v)} small />
                          <InputGroup label="Expert Comptabilité" value={activeSim.data.compta} onChange={(v) => updateSimData('compta', v)} small />
                          <InputGroup label="Assurance PNO" value={activeSim.data.assurancePNO} onChange={(v) => updateSimData('assurancePNO', v)} small />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'projections' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ProjectionMiniCard years={1} cashflow={calculations.beneficeAnnuel} />
                        <ProjectionMiniCard years={5} cashflow={calculations.beneficeAnnuel * 5} highlight />
                        <ProjectionMiniCard years={10} cashflow={calculations.beneficeAnnuel * 10} />
                      </div>

                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                          <ChartIcon size={20} className="text-emerald-600" />
                          Croissance du Patrimoine & Cashflow Cumulé
                        </h4>
                        <div className="h-[350px]">
                          <ProjectionChart data={calculations.beneficeAnnuel} totalInvest={calculations.investissementTotal} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200">
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Répartition des charges</p>
                          <div className="h-48 flex justify-center">
                            <Doughnut
                              data={{
                                labels: ['Crédit', 'Charges', 'Exploitation'],
                                datasets: [{
                                  data: [calculations.coutCreditAnnuel, calculations.totalChargesAnnuelles - (activeSim.data.electricite + activeSim.data.internet + activeSim.data.eau), activeSim.data.electricite + activeSim.data.internet + activeSim.data.eau],
                                  backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                                  borderWidth: 0
                                }]
                              }}
                              options={{ cutout: '75%', plugins: { legend: { position: 'bottom' } } }}
                            />
                          </div>
                        </div>
                        <div className="bg-emerald-900 text-white p-8 rounded-[2rem] relative overflow-hidden">
                          <Building2 size={120} className="absolute -bottom-4 -right-4 opacity-10" />
                          <h5 className="text-xl font-bold mb-2">Bilan à 20 ans</h5>
                          <p className="text-emerald-100/60 text-sm mb-6">Fin du crédit, capital libéré.</p>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-emerald-100/60 font-medium tracking-wide">Cashflow cumulé</span>
                              <span className="font-bold text-lg">{formatEuro(calculations.beneficeAnnuel * 20)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-100/60 font-medium tracking-wide">Patrimoine (Achat)</span>
                              <span className="font-bold text-lg">{formatEuro(calculations.investissementTotal)}</span>
                            </div>
                            <div className="h-px bg-white/10" />
                            <div className="flex justify-between items-end pt-2">
                              <span className="font-black text-emerald-400 uppercase tracking-widest text-xs">Valeur Totale</span>
                              <span className="text-3xl font-black">{formatEuro(calculations.beneficeAnnuel * 20 + calculations.investissementTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compare Bar */}
        {simulations.length > 1 && (
          <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl">
            <h3 className="text-2xl font-black mb-6">Comparatif de Rentabilité</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulations.map(sim => {
                const calc = getCalculations(sim.data);
                return (
                  <div key={sim.id} className={`p-6 rounded-3xl border transition-all ${activeSimId === sim.id ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent'}`}>
                    <p className="font-bold text-lg mb-4">{sim.name}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="opacity-60">Rentabilité Net</span>
                        <span className="font-bold text-emerald-400">{calc.rentabiliteNet.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="opacity-60">Cashflow / mois</span>
                        <span className="font-bold">{formatEuro(calc.cashflowMensuel)}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${Math.min(100, (calc.rentabiliteNet / 10) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- COMPONENTS ---

function KPICard({ label, value, description, color, highlight = false }) {
  const textColors = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    slate: 'text-slate-900',
    red: 'text-red-500',
  };

  return (
    <div className={`p-8 rounded-[2rem] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${highlight ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-100 group' : 'bg-white border-slate-200'}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 group-hover:text-emerald-500 transition-colors">{label}</p>
      <p className={`text-4xl font-black mb-2 tracking-tight ${textColors[color]}`}>{value}</p>
      <p className="text-xs font-bold text-slate-400">{description}</p>
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-7 py-5 bg-white border-b border-slate-50 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors">
            {React.cloneElement(icon, { size: 20 })}
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
        </div>
        {isOpen ? <ChevronUp size={20} className="text-slate-300" /> : <ChevronDown size={20} className="text-slate-300" />}
      </button>
      {isOpen && <div className="p-7 space-y-6 animate-in fade-in duration-300">{children}</div>}
    </div>
  );
}

function InputGroup({ label, value, onChange, icon, type = "number", small = false, bordered = true }) {
  return (
    <div className="w-full text-left space-y-2">
      <label className={`block text-slate-400 font-black uppercase tracking-[0.15em] ${small ? 'text-[9px]' : 'text-[10px]'}`}>
        {label}
      </label>
      <div className="relative group/input">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-slate-50/50 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white text-slate-900 font-bold ${bordered ? 'border border-slate-200 focus:border-emerald-500' : 'border-none'} ${small ? 'py-2.5 px-4 text-sm' : 'py-4 px-6 text-xl tracking-tight'}`}
        />
        {icon && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within/input:text-emerald-500 transition-colors">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className={`relative py-7 px-1 transition-all duration-300 mr-10 last:mr-0 group flex items-center gap-3`}
    >
      <span className={`${active ? 'text-emerald-600' : 'text-slate-400'}`}>
        {React.cloneElement(icon, { size: 20, strokeWidth: active ? 3 : 2 })}
      </span>
      <span className={`text-sm font-black uppercase tracking-widest ${active ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600 transition-colors'}`}>
        {label}
      </span>
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-emerald-500 rounded-full" />
      )}
    </button>
  );
}

function ProjectionMiniCard({ years, cashflow, highlight = false }) {
  return (
    <div className={`p-6 rounded-3xl border ${highlight ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl shadow-emerald-100' : 'bg-white border-slate-200'}`}>
      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${highlight ? 'text-emerald-200' : 'text-slate-400'}`}>Cumulative {years} {years > 1 ? 'ans' : 'an'}</p>
      <p className="text-2xl font-black">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cashflow)}</p>
    </div>
  );
}

function ProjectionChart({ data, totalInvest }) {
  const years = [0, 1, 2, 3, 4, 5, 10, 15, 20];
  const cashflows = years.map(y => data * y);
  const equity = years.map(y => (totalInvest / 20) * y); // Simplified equity linear growth

  return (
    <Line
      data={{
        labels: years.map(y => `${y} an${y > 1 ? 's' : ''}`),
        datasets: [
          {
            label: 'Cashflow Cumulé',
            data: cashflows,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
          },
          {
            label: 'Valeur Patrimoine (Base)',
            data: Array(years.length).fill(totalInvest),
            borderColor: '#3b82f6',
            borderDash: [5, 5],
            tension: 0,
            pointRadius: 0,
          }
        ]
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { callback: (value) => value >= 1000 ? `${value / 1000}k€` : `${value}€` }
          }
        }
      }}
    />
  );
}
