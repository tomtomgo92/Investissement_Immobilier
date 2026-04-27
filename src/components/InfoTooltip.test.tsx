import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InfoTooltip from './InfoTooltip';
import React from 'react';

describe('InfoTooltip Component', () => {
  it('renders the tooltip text', () => {
    render(<InfoTooltip text="Helpful information" />);
    
    expect(screen.getByText('Helpful information')).toBeInTheDocument();
    expect(screen.getByRole('tooltip', { hidden: true })).toBeInTheDocument();
  });
});
