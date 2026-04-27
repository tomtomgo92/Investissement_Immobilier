import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';
import React from 'react';
import { useSimulationStore } from './store/useSimulationStore';

describe('App Performance & Integration', () => {
  beforeEach(() => {
    // Reset the store before each test
    useSimulationStore.setState({
      simulations: [],
      activeSimId: null,
      viewMode: 'dashboard'
    });
  });

  it('can handle adding 10 simulations quickly without crashing (Stress Test)', async () => {
    // Create 10 simulations in store
    act(() => {
      const sims = [];
      for (let i = 0; i < 10; i++) {
        sims.push({
          id: `sim-${i}`,
          name: `Simulation ${i}`,
          pipelineStatus: 'À analyser',
          data: {
            prixAchat: 100000 + (i * 10000),
            travaux: 0,
            fraisNotaire: 8000,
            apport: 20000,
            tauxInteret: 3.5,
            dureeCredit: 20,
            mensualiteCredit: 500,
            vacanceLocative: 5,
            tmi: 30,
            typeLocation: 'meuble_long',
            regimeFiscal: 'auto',
            charges: [],
            loyers: [500]
          }
        });
      }
      useSimulationStore.getState().setSimulations(sims);
    });

    const startTime = performance.now();

    // Render app which will process the 10 simulations
    render(<App />);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Verify 10 simulations are rendered in the dashboard
    for (let i = 0; i < 10; i++) {
      expect(await screen.findByText(`Simulation ${i}`)).toBeInTheDocument();
    }

    console.log(`Rendered 10 simulations in ${renderTime.toFixed(2)}ms`);
    expect(renderTime).toBeLessThan(1500); 
  });
});
