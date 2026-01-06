import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeaderNodeRuntime } from './HeaderNodeRuntime';
import type { HeaderNode } from './types';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

// Mock window.print
Object.defineProperty(window, 'print', {
  value: vi.fn(),
  writable: true
});

const mockHeaderNode: HeaderNode = {
  id: 'header-1',
  type: 'ui:header',
  kind: 'ui',
  variant: 'hero-glass',
  config: {
    background: {
      mode: 'image',
      imageUrl: 'https://example.com/bg.jpg',
      overlay: {
        enabled: true,
        opacity: 0.15
      }
    },
    topbar: {
      enabled: true,
      position: 'top-right',
      actions: ['theme', 'notifications', 'profile', 'logout'],
      logoutLabel: 'Cerrar Sesión'
    },
    card: {
      enabled: true,
      glass: {
        blur: 13,
        opacity: 0.8
      },
      leftIcon: {
        enabled: true,
        icon: 'user',
        gradient: {
          from: '#F00B80',
          to: '#7928CA',
          angle: 45
        }
      },
      title: '{{ data.nombre }} {{ data.apellido }}',
      subtitle: 'Legajo de Ciudadano',
      actions: [
        { id: 'print', icon: 'printer', type: 'command', name: 'print' }
      ]
    }
  },
  layout: {
    i: 'header-1',
    x: 0,
    y: 0,
    w: 12,
    h: 6
  }
};

describe('HeaderNodeRuntime', () => {
  it('renders header with resolved templates', () => {
    const data = { nombre: 'Juan', apellido: 'Pérez' };
    
    render(
      <HeaderNodeRuntime 
        node={mockHeaderNode} 
        data={data}
      />
    );

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Legajo de Ciudadano')).toBeInTheDocument();
  });

  it('handles print command', () => {
    render(<HeaderNodeRuntime node={mockHeaderNode} />);
    
    const printButton = screen.getByTitle('print');
    fireEvent.click(printButton);
    
    expect(window.print).toHaveBeenCalled();
  });

  it('resolves templates with fallback', () => {
    const data = { nombre: 'Juan' }; // apellido missing
    
    render(
      <HeaderNodeRuntime 
        node={mockHeaderNode} 
        data={data}
      />
    );

    expect(screen.getByText('Juan —')).toBeInTheDocument();
  });
});