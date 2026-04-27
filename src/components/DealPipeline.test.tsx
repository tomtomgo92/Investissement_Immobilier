import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DealPipeline from './DealPipeline';
import React from 'react';

describe('DealPipeline Component', () => {
  it('renders without crashing', () => {
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
      setSimulations: vi.fn(),
      setActiveSimId: vi.fn(),
      setViewMode: vi.fn()
    };
    const { container } = render(<DealPipeline {...mockProps} />);
    expect(container).toBeInTheDocument();
  });
});
