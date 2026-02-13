import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Home,
  Euro,
  Percent,
  Users,
  Receipt,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Landmark,
  ArrowRightLeft,
  UserPlus,
  Plus,
  Trash2,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  Share2
} from 'lucide-react';

/**
 * Modern & Refined Real Estate Investment Calculator
 */
export default function App() {
  // --- STATE ---
  const [data, setData] = useState({
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
  });

  const [activeTab, setActiveTab] = useState('investment');

  // --- CALCULATIONS ---
  const calculations = useMemo(() => {
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
  }, [data]);

  // --- HANDLERS ---
  const handleChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleNbColocsChange = (val) => {
    const count = Math.max(0, parseInt(val) || 0);
    setData(prev => {
      let newLoyers = [...prev.loyers];
      if (count > newLoyers.length) {
        newLoyers = [...newLoyers, ...Array(count - newLoyers.length).fill(0)];
      } else {
        newLoyers = newLoyers.slice(0, count);
      }
      return { ...prev, nbColocs: count, loyers: newLoyers };
    });
  };

  const handleLoyerChange = (index, value) => {
    const val = parseFloat(value) || 0;
    setData(prev => {
      const newLoyers = [...prev.loyers];
      newLoyers[index] = val;
      return { ...prev, loyers: newLoyers };
    });
  };

  const formatEuro = (val) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-100">
      {/* Navigation Overlay / Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[20%] -left-[10%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px] opacity-50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp size={14} />
              Immobilier Pro
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Investissement <span className="text-emerald-600">Immobilier</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-xl">
              Simulateur de rentabilité haute précision pour vos projets locatifs et colocations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Download size={18} />
              Exporter PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-900 rounded-xl text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
              <Share2 size={18} />
              Partager
            </button>
          </div>
        </header>

        {/* KPI Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <KPICard
            label="Rentabilité brute"
            value={`${calculations.rentabiliteBrute.toFixed(2)}%`}
            description="Basé sur l'investissement total"
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
            description="Bénéfice net après crédit"
            color={calculations.cashflowMensuel >= 0 ? 'emerald' : 'red'}
            highlight
          />
          <KPICard
            label="Investissement Total"
            value={formatEuro(calculations.investissementTotal)}
            description="Prix + Travaux + Notaire"
            color="slate"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Input Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <SectionCard title="Investissement" icon={<Home className="text-blue-500" />}>
              <InputGroup label="Prix d'achat" value={data.prixAchat} onChange={(v) => handleChange('prixAchat', v)} icon={<Euro size={16} />} />
              <InputGroup label="Travaux" value={data.travaux} onChange={(v) => handleChange('travaux', v)} icon={<Euro size={16} />} />
              <InputGroup label="Frais de notaire" value={data.fraisNotaire} onChange={(v) => handleChange('fraisNotaire', v)} icon={<Euro size={16} />} />
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-4 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">Coût total du projet</span>
                <span className="text-lg font-bold text-slate-900">{formatEuro(calculations.investissementTotal)}</span>
              </div>
            </SectionCard>

            <SectionCard title="Financement" icon={<Landmark className="text-amber-500" />}>
              <InputGroup label="Apport personnel" value={data.apport} onChange={(v) => handleChange('apport', v)} icon={<Euro size={16} />} />
              <div className="mt-4 mb-2">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                  <span>Emprunt</span>
                  <span>{formatEuro(calculations.montantAEmprunter)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (data.apport / calculations.investissementTotal) * 100)}%` }}
                  />
                  <div
                    className="bg-amber-400 h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (calculations.montantAEmprunter / calculations.investissementTotal) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-emerald-600 font-semibold italic">Apport</span>
                  <span className="text-[10px] text-amber-600 font-semibold italic">Emprunt</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Taux (%)" value={data.tauxInteret} onChange={(v) => handleChange('tauxInteret', v)} icon={<Percent size={14} />} small />
                <InputGroup label="Durée (ans)" value={data.dureeCredit} onChange={(v) => handleChange('dureeCredit', v)} small />
              </div>
              <InputGroup label="Mensualité réelle" value={data.mensualiteCredit} onChange={(v) => handleChange('mensualiteCredit', v)} icon={<Euro size={16} />} />
            </SectionCard>
          </div>

          {/* Middle: Details & Income */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="flex border-b border-slate-100 px-8">
                <TabButton active={activeTab === 'investment'} onClick={() => setActiveTab('investment')} label="Revenu & Coloc" />
                <TabButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} label="Charges & Taxes" />
              </div>

              <div className="p-8">
                {activeTab === 'investment' ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Gestion de la Colocation</h3>
                        <p className="text-sm text-slate-500 mt-1">Configurez les loyers individuels pour une précision maximale.</p>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <button
                          onClick={() => handleNbColocsChange(data.nbColocs - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <span className="w-12 text-center font-bold text-slate-700">{data.nbColocs}</span>
                        <button
                          onClick={() => handleNbColocsChange(data.nbColocs + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-slate-100">
                      {data.loyers.map((loyer, index) => (
                        <div key={index} className="group relative p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all">
                          <InputGroup
                            label={`Loyer Locataire ${index + 1}`}
                            value={loyer}
                            onChange={(v) => handleLoyerChange(index, v)}
                            icon={<Euro size={14} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />}
                            bordered={false}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-4 flex flex-col md:flex-row gap-8 items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                          <Receipt size={28} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Total Mensuel</p>
                          <p className="text-3xl font-black text-slate-900">{formatEuro(calculations.recetteMensuelle)}</p>
                        </div>
                      </div>
                      <div className="w-full md:w-auto px-10 py-6 bg-slate-900 rounded-3xl text-white">
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-400 mb-1">Revenu Annuel</p>
                        <p className="text-4xl font-black tracking-tight">{formatEuro(calculations.recetteAnnuelle)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                        <ShieldCheck size={16} /> Charges & Services
                      </h4>
                      <InputGroup label="Charges Copropriété" value={data.chargesCopro} onChange={(v) => handleChange('chargesCopro', v)} small />
                      <InputGroup label="Électricité" value={data.electricite} onChange={(v) => handleChange('electricite', v)} small />
                      <InputGroup label="Internet" value={data.internet} onChange={(v) => handleChange('internet', v)} small />
                      <InputGroup label="Eau" value={data.eau} onChange={(v) => handleChange('eau', v)} small />
                    </div>
                    <div className="space-y-6">
                      <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                        <CreditCard size={16} /> Fiscalité & Frais
                      </h4>
                      <InputGroup label="Taxe Foncière" value={data.taxeFonciere} onChange={(v) => handleChange('taxeFonciere', v)} small />
                      <InputGroup label="CFE" value={data.cfe} onChange={(v) => handleChange('cfe', v)} small />
                      <InputGroup label="Comptabilité" value={data.compta} onChange={(v) => handleChange('compta', v)} small />
                      <InputGroup label="Assurance PNO" value={data.assurancePNO} onChange={(v) => handleChange('assurancePNO', v)} small />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Visualization */}
            <div className="bg-emerald-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
              {/* Bg Decoration */}
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp size={240} />
              </div>

              <div className="relative flex flex-col md:flex-row justify-between gap-12">
                <div className="space-y-8 flex-1">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      Bilan de Trésorerie
                    </h3>
                    <p className="text-emerald-100/70 text-sm mt-1">Projection annuelle après toutes charges et crédit.</p>
                  </div>

                  <div className="space-y-4">
                    <SummaryRow label="Recettes" value={`+ ${formatEuro(calculations.recetteAnnuelle)}`} />
                    <SummaryRow label="Charges fixes" value={`- ${formatEuro(calculations.totalChargesAnnuelles)}`} />
                    <SummaryRow label="Crédit bancaire" value={`- ${formatEuro(calculations.coutCreditAnnuel)}`} />
                    <div className="h-px bg-white/10 my-4" />
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">CASHFLOW NET ANNUEL</p>
                        <p className="text-5xl font-black">{formatEuro(calculations.beneficeAnnuel)}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-2xl border border-white/10">
                          <ArrowRightLeft size={18} className="text-emerald-300" />
                          <span className="text-xl font-bold">{formatEuro(calculations.cashflowMensuel)} / mois</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center w-full md:w-64 space-y-4">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                      <circle
                        cx="50" cy="50" r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 * (1 - calculations.rentabiliteNet / 15)} // Scale 0-15%
                        className="text-emerald-300 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black">{calculations.rentabiliteNet.toFixed(1)}%</span>
                      <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest text-center leading-none">Net / 15%</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-emerald-100 text-center px-4">Performance basée sur l'investissement total de {formatEuro(calculations.investissementTotal)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm font-medium">
          <div className="flex items-center gap-2">
            <Calculator size={18} />
            <span>Investissement Immobilier &copy; 2024</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Politique de confidentialité</a>
            <a href="#" className="flex items-center gap-1 text-emerald-600 font-bold hover:text-emerald-700">
              <Info size={16} />
              Comment c'est calculé ?
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function KPICard({ label, value, description, color, highlight = false }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  };

  return (
    <div className={`p-6 rounded-3xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${highlight ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-100 group' : 'bg-white border-slate-100'}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1 group-hover:text-emerald-500 transition-colors">{label}</p>
      <p className={`text-3xl font-black mb-1 ${highlight ? 'text-emerald-600' : 'text-slate-900'}`}>{value}</p>
      <p className="text-xs font-medium text-slate-400">{description}</p>
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="px-6 py-4 bg-white border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            {React.cloneElement(icon, { size: 18 })}
          </div>
          <h3 className="font-black text-slate-900 tracking-tight">{title}</h3>
        </div>
        <ChevronDown size={18} className="text-slate-400" />
      </div>
      <div className="p-6 space-y-5">
        {children}
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, icon, type = "number", small = false, bordered = true }) {
  return (
    <div className="w-full text-left space-y-1.5">
      <label className={`block text-slate-500 font-bold uppercase tracking-widest ${small ? 'text-[9px]' : 'text-[10px]'}`}>
        {label}
      </label>
      <div className="relative group/input">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-slate-50 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white text-slate-900 ${bordered ? 'border border-slate-200 focus:border-emerald-500' : 'border-none'} ${small ? 'py-2 px-4 text-sm font-semibold' : 'py-3.5 px-5 font-black text-lg'}`}
        />
        {icon && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within/input:text-emerald-500 transition-colors">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`relative py-6 px-1 transition-all duration-300 mr-8 last:mr-0 group`}
    >
      <span className={`text-sm font-black uppercase tracking-widest ${active ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
        {label}
      </span>
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />
      )}
    </button>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-emerald-100/60 font-semibold">{label}</span>
      <span className="font-bold tracking-tight">{value}</span>
    </div>
  );
}
