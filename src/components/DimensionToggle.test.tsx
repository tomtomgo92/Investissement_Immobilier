import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DimensionToggle from './DimensionToggle';

describe('DimensionToggle', () => {
    it('renders correctly with label', () => {
        render(<DimensionToggle active={false} onClick={() => {}} dot="bg-red-500" label="Test Label" />);
        expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('triggers onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<DimensionToggle active={false} onClick={handleClick} dot="bg-red-500" label="Click Me" />);
        
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('reflects active state via aria-pressed', () => {
        const { rerender } = render(<DimensionToggle active={false} onClick={() => {}} dot="bg-red-500" label="Active Test" />);
        const button = screen.getByRole('button');
        
        expect(button).toHaveAttribute('aria-pressed', 'false');
        
        rerender(<DimensionToggle active={true} onClick={() => {}} dot="bg-red-500" label="Active Test" />);
        expect(button).toHaveAttribute('aria-pressed', 'true');
    });
});
