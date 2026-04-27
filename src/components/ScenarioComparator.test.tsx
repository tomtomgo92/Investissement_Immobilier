import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ScenarioComparator from './ScenarioComparator';
import React from 'react';

// Mock Zustand store
import { useSimulationStore } from '../store/useSimulationStore';
import { vi } from 'vitest';

vi.mock('../store/useSimulationStore', () => ({
  useSimulationStore: vi.fn(),
}));

describe('ScenarioComparator Component', () => {
  it('renders empty state correctly', () => {
    (useSimulationStore as any).mockImplementation((selector: any) => {
      const state = {
        simulations: [],
        activeSimId: null,
        setActiveSimId: vi.fn(),
      };
      return selector(state);
    });

    const { getByText } = render(<ScenarioComparator />);
    expect(getByText('Aucune simulation à comparer.')).toBeInTheDocument();
  });
});
