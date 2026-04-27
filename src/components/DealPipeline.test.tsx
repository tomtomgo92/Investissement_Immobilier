import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DealPipeline from './DealPipeline';
import React from 'react';

// Mock Zustand store
import { useSimulationStore } from '../store/useSimulationStore';
import { vi } from 'vitest';

vi.mock('../store/useSimulationStore', () => ({
  useSimulationStore: vi.fn(),
}));

describe('DealPipeline Component', () => {
  it('renders without crashing', () => {
    (useSimulationStore as any).mockImplementation((selector: any) => {
      const state = {
        simulations: [],
        setSimulations: vi.fn(),
        setActiveSimId: vi.fn(),
        setViewMode: vi.fn(),
      };
      return selector(state);
    });

    const { container } = render(<DealPipeline />);
    expect(container).toBeInTheDocument();
  });
});
