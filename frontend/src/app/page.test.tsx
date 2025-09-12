import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from './page';

describe('HomePage', () => {
  it('muestra el saludo', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: /hola, matias/i })).toBeInTheDocument();
  });
});
