import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { 
  LayoutDashboard, 
  Trello, 
  BarChart2, 
  Plus, 
  FileText, 
  Share2, 
  Download,
  Landmark
} from 'lucide-react';

export default function Sidebar({ onExportPdf, onShare, onShareBanker }: { onExportPdf: () => void, onShare: () => void, onShareBanker: () => void }) {
  const simulations = useSimulationStore(state => state.simulations);
  const activeSimId = useSimulationStore(state => state.activeSimId);
  const viewMode = useSimulationStore(state => state.viewMode);
  
  const setViewMode = useSimulationStore(state => state.setViewMode);
  const setActiveSimId = useSimulationStore(state => state.setActiveSimId);
  const addSimulation = useSimulationStore(state => state.addSimulation);

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Pipeline Deals', icon: Trello },
    { id: 'comparator', label: 'Comparateur', icon: BarChart2 },
  ] as const;

  return (
    <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50 h-screen flex flex-col">
      {/* Workspace Header */}
      <div className="p-4 flex items-center gap-2 text-gray-900 font-semibold border-b border-gray-200/60">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
          P
        </div>
        <span className="tracking-tight text-[15px]">Property Simulator</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        
        {/* Main Views */}
        <div>
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
            Vues
          </div>
          <div className="space-y-0.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === item.id 
                    ? 'bg-gray-200/50 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon size={16} className={viewMode === item.id ? 'text-indigo-600' : 'text-gray-400'} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2 group">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Projets
            </div>
            <button 
              onClick={addSimulation}
              className="text-gray-400 hover:text-gray-900 transition-colors opacity-0 group-hover:opacity-100"
              title="Nouveau projet"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-0.5">
            {simulations.map(sim => (
              <button
                key={sim.id}
                onClick={() => {
                  setActiveSimId(sim.id);
                  setViewMode('dashboard');
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors group ${
                  viewMode === 'dashboard' && activeSimId === sim.id
                    ? 'bg-indigo-50 text-indigo-900' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <FileText size={16} className={viewMode === 'dashboard' && activeSimId === sim.id ? 'text-indigo-600' : 'text-gray-400'} />
                <span className="truncate">{sim.name}</span>
                {sim.pipelineStatus !== 'À analyser' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-indigo-400"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-gray-200/60 space-y-0.5">
        <button 
          onClick={onShare}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Share2 size={16} className="text-gray-400" />
          Partager l'analyse
        </button>
        <button 
          onClick={onShareBanker}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Landmark size={16} className="text-gray-400" />
          Lien Banquier
        </button>
        <button 
          onClick={onExportPdf}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Download size={16} className="text-gray-400" />
          Exporter PDF
        </button>
      </div>
    </div>
  );
}
