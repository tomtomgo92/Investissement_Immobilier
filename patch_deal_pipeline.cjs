const fs = require('fs');
const filepath = 'src/components/DealPipeline.jsx';
let content = fs.readFileSync(filepath, 'utf-8');

const dealCardComponent = `
// ⚡ Bolt Optimization: Extract list items into individual React.memo components.
// Impact: Prevents O(N) recalculations of the entire pipeline when a single card's
// status or alert toggles. Memoizes based on the raw simulation object.
const DealCard = React.memo(({ sim, colIndex, onToggleAlert, onChangeStatus, onOpenSimulation }) => {
  // Localize expensive metrics calculation strictly based on sim.data
  const results = useMemo(() => calculatePipelineMetrics(sim.data), [sim.data]);

  return (
    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-2">
        <button onClick={() => onOpenSimulation(sim.id)} className="font-bold text-sm text-primary dark:text-white hover:text-accent text-left pr-2">
          {sim.name}
        </button>
        <button
          onClick={() => onToggleAlert(sim.id)}
          title={sim.hasAlert ? "Désactiver l'alerte" : "Créer une alerte de prix"}
          className={\`p-1 rounded-full transition-colors \${sim.hasAlert ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'text-slate-300 hover:text-amber-400 dark:text-slate-600 dark:hover:text-amber-500'}\`}
        >
          {sim.hasAlert ? <BellRing size={14} /> : <Bell size={14} />}
        </button>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Investissement</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{formatE(results.investTotal)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-slate-500"><Wallet size={10} /> Cashflow</span>
          <span className={\`font-bold \${results.cashflowNetNet >= 0 ? 'text-emerald-500' : 'text-rose-500'}\`}>
            {formatE(results.cashflowNetNet)}/m
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-slate-500"><TrendingUp size={10} /> Renda. Net</span>
          <span className="font-bold text-indigo-500">{results.rNet.toFixed(2)}%</span>
        </div>
      </div>

      {/* Card Actions (Move buttons) */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          aria-label="Déplacer à l'étape précédente"
          onClick={() => onChangeStatus(sim.id, colIndex, -1)}
          disabled={colIndex === 0}
          className="p-1.5 rounded-md text-slate-400 hover:text-accent hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-20 transition-colors"
        >
          <ArrowLeft size={14} />
        </button>

        <button
          onClick={() => onOpenSimulation(sim.id)}
          className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary dark:hover:text-white"
        >
          Ouvrir
        </button>

        <button
          aria-label="Déplacer à l'étape suivante"
          onClick={() => onChangeStatus(sim.id, colIndex, 1)}
          disabled={colIndex === COLUMNS.length - 1}
          className="p-1.5 rounded-md text-slate-400 hover:text-accent hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-20 transition-colors"
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
});

export default function DealPipeline`;

content = content.replace('export default function DealPipeline', dealCardComponent);

fs.writeFileSync(filepath, content, 'utf-8');
