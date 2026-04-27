import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toggle from './Toggle';
import React from 'react';

describe('Toggle Component', () => {
  it('renders correctly and respects active state', () => {
    const { rerender } = render(<Toggle active={false} onToggle={() => {}} ariaLabel="Test Toggle" />);
    const button = screen.getByRole('switch', { name: 'Test Toggle' });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-checked', 'false');
    
    rerender(<Toggle active={true} onToggle={() => {}} ariaLabel="Test Toggle" />);
    expect(button).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onToggle when clicked', () => {
    const onToggleMock = vi.fn();
    render(<Toggle active={false} onToggle={onToggleMock} ariaLabel="Test Toggle" />);
    
    const button = screen.getByRole('switch');
    fireEvent.click(button);
    
    expect(onToggleMock).toHaveBeenCalledTimes(1);
  });
});
