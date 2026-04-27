import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HeroKPI from './HeroKPI';
import { Wallet } from 'lucide-react';
import React from 'react';

describe('HeroKPI Component', () => {
  it('renders correctly with required props', () => {
    render(<HeroKPI label="Total Revenue" value="1000€" color="emerald" />);
    
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('1000€')).toBeInTheDocument();
  });

  it('renders the subtext and icon when provided', () => {
    render(
      <HeroKPI 
        label="Net" 
        value="500€" 
        color="indigo" 
        sub="Projection"
        icon={<Wallet data-testid="wallet-icon" />}
      />
    );
    
    expect(screen.getByText('Projection')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-icon')).toBeInTheDocument();
  });

  it('applies highlight styling when highlight is true', () => {
    const { container } = render(
      <HeroKPI label="Highlight" value="0€" color="rose" highlight />
    );
    
    expect(container.firstChild).toHaveClass('ring-1');
  });
});
