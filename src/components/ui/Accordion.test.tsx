import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Accordion } from './Accordion';

const items = [
  { id: 'mat', title: 'Material and specifications', content: 'Anti-tarnish plated brass' },
  { id: 'care', title: 'Care and maintenance', content: 'Keep dry and store in box' },
];

describe('Accordion Component', () => {
  it('renders all item titles with correct aria attributes', () => {
    render(<Accordion items={items} />);

    const button = screen.getByRole('button', { name: /material and specifications/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands panel when button is clicked', () => {
    render(<Accordion items={items} />);

    const button = screen.getByRole('button', { name: /material and specifications/i });
    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Anti-tarnish plated brass')).toBeInTheDocument();

    // Clicking again collapses it
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens default item when defaultOpenId is provided', () => {
    render(<Accordion items={items} defaultOpenId="care" />);

    const careButton = screen.getByRole('button', { name: /care and maintenance/i });
    expect(careButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Keep dry and store in box')).toBeInTheDocument();
  });
});

