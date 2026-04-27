import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { INITIAL_DATA, INITIAL_CHARGES, updateSimulationData as updateSimDataUtil, autoEstimateCharges } from '../utils/finance';
import { decodeShareCode } from '../utils/share';

export interface Simulation {
    id: string;
    name: string;
    pipelineStatus: string;
    isBanker?: boolean;
    data: any; // Type should be properly defined in finance.ts later
}

interface SimulationState {
    simulations: Simulation[];
    activeSimId: string | null;
    viewMode: 'dashboard' | 'pipeline' | 'comparator';
    isDarkMode: boolean;

    // Actions
    setSimulations: (simulations: Simulation[] | ((prev: Simulation[]) => Simulation[])) => void;
    setActiveSimId: (id: string | null) => void;
    addSimulation: () => void;
    updateSimulationData: (field: string, value: any) => void;
    updateCharge: (id: string, field: string, value: any) => void;
    addCharge: () => void;
    removeCharge: (id: string) => void;
    applyAutoEstimateCharges: () => void;
    setViewMode: (mode: 'dashboard' | 'pipeline' | 'comparator') => void;
    toggleDarkMode: () => void;
    importSharedSimulation: (hash: string) => boolean;
}

export const useSimulationStore = create<SimulationState>()(
    persist(
        (set, get) => ({
            simulations: [{ id: uuidv4(), name: 'Investissement Lyon 3', pipelineStatus: 'À analyser', data: { ...INITIAL_DATA } }],
            activeSimId: null,
            viewMode: 'dashboard',
            isDarkMode: false,

            setSimulations: (updater) => set((state) => ({
                simulations: typeof updater === 'function' ? updater(state.simulations) : updater
            })),

            setActiveSimId: (id) => set({ activeSimId: id }),

            addSimulation: () => set((state) => {
                const newSim: Simulation = {
                    id: uuidv4(),
                    name: `Projet ${state.simulations.length + 1}`,
                    pipelineStatus: 'À analyser',
                    data: { ...INITIAL_DATA, charges: JSON.parse(JSON.stringify(INITIAL_CHARGES)) }
                };
                return {
                    simulations: [...state.simulations, newSim],
                    activeSimId: newSim.id
                };
            }),

            updateSimulationData: (field, value) => set((state) => ({
                simulations: state.simulations.map(sim => 
                    sim.id === state.activeSimId 
                        ? { ...sim, data: updateSimDataUtil(sim.data, field, value) }
                        : sim
                )
            })),

            updateCharge: (id, field, value) => set((state) => ({
                simulations: state.simulations.map(sim => {
                    if (sim.id !== state.activeSimId) return sim;
                    return {
                        ...sim,
                        data: {
                            ...sim.data,
                            charges: sim.data.charges.map((c: any) => 
                                c.id === id 
                                    ? { ...c, [field]: field === 'value' ? (parseFloat(value) || 0) : value } 
                                    : c
                            )
                        }
                    };
                })
            })),

            addCharge: () => set((state) => ({
                simulations: state.simulations.map(sim => {
                    if (sim.id !== state.activeSimId) return sim;
                    return {
                        ...sim,
                        data: {
                            ...sim.data,
                            charges: [...sim.data.charges, { id: uuidv4(), name: 'Nouvelle Charge', value: 0 }]
                        }
                    };
                })
            })),

            removeCharge: (id) => set((state) => ({
                simulations: state.simulations.map(sim => {
                    if (sim.id !== state.activeSimId) return sim;
                    return {
                        ...sim,
                        data: {
                            ...sim.data,
                            charges: sim.data.charges.filter((c: any) => c.id !== id)
                        }
                    };
                })
            })),

            applyAutoEstimateCharges: () => set((state) => ({
                simulations: state.simulations.map(sim => {
                    if (sim.id !== state.activeSimId) return sim;
                    const loyerMensuelTotal = sim.data.loyers.reduce((acc: number, val: number) => acc + val, 0);
                    const estimatedCharges = autoEstimateCharges(sim.data.prixAchat, loyerMensuelTotal);
                    return {
                        ...sim,
                        data: {
                            ...sim.data,
                            charges: estimatedCharges
                        }
                    };
                })
            })),

            setViewMode: (mode) => set({ viewMode: mode }),

            toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

            importSharedSimulation: (hash) => {
                let sharedSim = null;
                if (hash.startsWith('#share=')) {
                    sharedSim = decodeShareCode(hash.replace('#share=', ''));
                } else if (hash.startsWith('#banker=')) {
                    sharedSim = decodeShareCode(hash.replace('#banker=', ''));
                }

                if (sharedSim) {
                    set({
                        simulations: [sharedSim],
                        activeSimId: sharedSim.id
                    });
                    return true;
                }
                return false;
            }
        }),
        {
            name: 'invest_simulations',
            partialize: (state) => ({ simulations: state.simulations, isDarkMode: state.isDarkMode }),
        }
    )
);
