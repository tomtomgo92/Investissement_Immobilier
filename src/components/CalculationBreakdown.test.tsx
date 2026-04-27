import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CalculationBreakdown from './CalculationBreakdown';

describe('CalculationBreakdown Component', () => {
  const mockData = {
    // We only need empty data since calculations merges over it in the component if keys overlap,
    // but typically data has input values and calculations has computed values.
  };

  const mockCalculations = {
    recetteMensuelleBrute: 1000,
    vacanceLocative: 5,
    recetteMensuelleRéelle: 950,
    totalChargesAnnuelles: 2400,
    mCredit: 500,
    impots: 1200,
    cashflowNetNet: 150,
    bestRegime: 'micro_foncier',
    appliedRegime: 'micro_foncier'
  };

  const mockFormatE = (v: number) => `${v}€`;

  it('renders financial synthesis correctly', () => {
    render(
      <CalculationBreakdown 
        data={mockData} 
        calculations={mockCalculations} 
        formatE={mockFormatE} 
      />
    );

    // Check main title
    expect(screen.getByText('Synthèse Financière')).toBeInTheDocument();

    // Check values are rendered
    expect(screen.getByText('1000€')).toBeInTheDocument(); // Loyer brut
    expect(screen.getByText('-500€')).toBeInTheDocument(); // mCredit
    expect(screen.getByText('150€')).toBeInTheDocument(); // Cashflow net
  });

  it('shows optimization warning when applied regime is not the best', () => {
    const subOptimalCalculations = {
      ...mockCalculations,
      appliedRegime: 'foncier_reel'
    };

    render(
      <CalculationBreakdown 
        data={mockData} 
        calculations={subOptimalCalculations} 
        formatE={mockFormatE} 
      />
    );

    // The alert message should be present
    expect(screen.getByText(/Le simulateur recommande d'utiliser le régime/i)).toBeInTheDocument();
  });

  it('hides optimization warning when applied regime is optimal', () => {
    render(
      <CalculationBreakdown 
        data={mockData} 
        calculations={mockCalculations} 
        formatE={mockFormatE} 
      />
    );

    // The alert message should NOT be present
    expect(screen.queryByText(/Le simulateur recommande d'utiliser le régime/i)).not.toBeInTheDocument();
  });
});
