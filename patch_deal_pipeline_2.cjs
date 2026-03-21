const fs = require('fs');
const filepath = 'src/components/DealPipeline.jsx';
let content = fs.readFileSync(filepath, 'utf-8');

// Replace the calculation block inside DealPipeline
const oldCalcBlock = `  // Pre-calculate results for each simulation to display key metrics
  const pipelineData = useMemo(() => {
    return simulations.map(sim => {
      const results = calculatePipelineMetrics(sim.data);
      return {
        id: sim.id,
        name: sim.name,
        status: sim.pipelineStatus || 'À analyser',
        hasAlert: sim.hasAlert || false,
        ...results
      };
    });
  }, [simulations]);`;

content = content.replace(oldCalcBlock, '');

// Replace the rendering loop
const oldLoopStart = `columnSims.map(sim => (
                    <div key={sim.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">`;

const oldLoopEnd = `</button>
                      </div>
                    </div>
                  ))`;

const oldLoop = content.substring(content.indexOf(oldLoopStart), content.indexOf(oldLoopEnd) + oldLoopEnd.length);

const newLoop = `columnSims.map(sim => (
                    <DealCard
                      key={sim.id}
                      sim={sim}
                      colIndex={colIndex}
                      onToggleAlert={toggleAlert}
                      onChangeStatus={changeStatus}
                      onOpenSimulation={openSimulation}
                    />
                  ))`;

content = content.replace(oldLoop, newLoop);

// Also need to fix columnSims filtering since pipelineData is gone
content = content.replace(
  `const columnSims = pipelineData.filter(s => s.status === col.id);`,
  `const columnSims = simulations.filter(s => (s.pipelineStatus || 'À analyser') === col.id);`
);

fs.writeFileSync(filepath, content, 'utf-8');
