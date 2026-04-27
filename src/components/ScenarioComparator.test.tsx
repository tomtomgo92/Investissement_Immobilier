import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ScenarioComparator from './ScenarioComparator';
import React from 'react';

describe('ScenarioComparator Component', () => {
  it('renders empty state correctly', () => {
    const mockProps = {
      simulations: [
        {
          id: '1',
          name: 'Test Sim',
          data: {
            prixAchat: 100000,
            loyers: [500],
            charges: []
          }
        }
      ],
      activeSimId: '1',
      setActiveSimId: vi.fn()
    };
    const { container } = render(<ScenarioComparator {...mockProps} />);
    expect(container).toBeInTheDocument();
  });
});
