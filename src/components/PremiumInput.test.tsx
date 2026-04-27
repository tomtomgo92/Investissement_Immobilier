import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PremiumInput from './PremiumInput';

describe('PremiumInput', () => {
    it('renders label and input correctly', () => {
        render(<PremiumInput label="Test Input" value="100" onChange={() => {}} />);
        expect(screen.getByText('Test Input')).toBeInTheDocument();
        expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });

    it('renders suffix if provided', () => {
        render(<PremiumInput label="Amount" value="100" onChange={() => {}} suffix="USD" />);
        expect(screen.getByText('USD')).toBeInTheDocument();
    });

    it('triggers onChange when value changes', () => {
        const handleChange = vi.fn();
        render(<PremiumInput label="Test Input" value="100" onChange={handleChange} />);
        
        const input = screen.getByDisplayValue('100');
        fireEvent.change(input, { target: { value: '200' } });
        
        expect(handleChange).toHaveBeenCalledWith('200');
    });
});
