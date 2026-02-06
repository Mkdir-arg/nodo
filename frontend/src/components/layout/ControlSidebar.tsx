'use client';

import clsx from 'clsx';
import { X } from 'lucide-react';

interface ControlSidebarProps {
  open: boolean;
  onClose: () => void;
  mini: boolean;
  theme: string;
  onToggleMini: () => void;
  onToggleTheme: () => void;
}

export default function ControlSidebar({
  open,
  onClose,
  mini,
  theme,
  onToggleMini,
  onToggleTheme,
}: ControlSidebarProps) {
  return (
    <aside
      className={clsx(
        'fixed right-0 top-0 z-50 h-screen w-80 transform bg-white shadow-xl transition-transform duration-200 border-l border-nodo-border',
        open ? 'translate-x-0' : 'translate-x-full'
      )}
      role="dialog"
      aria-label="Panel de control"
    >
      <div className="flex items-center justify-between border-b border-nodo-border p-4">
        <h2 className="text-lg font-semibold text-nodo-title">Panel</h2>
        <button
          onClick={onClose}
          aria-label="Cerrar panel"
          className="rounded-md p-2 hover:bg-slate-100 text-nodo-icon"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="border-b border-nodo-border p-4">
        <h3 className="mb-2 text-sm font-semibold text-nodo-title">Atajos</h3>
        <div className="space-y-2">
          <button
            className="w-full rounded-md bg-slate-100 px-3 py-2 text-left text-sm text-nodo-text hover:bg-slate-200"
            onClick={() => alert('Crear legajo')}
          >
            Crear legajo
          </button>
          <button
            className="w-full rounded-md bg-slate-100 px-3 py-2 text-left text-sm text-nodo-text hover:bg-slate-200"
            onClick={() => alert('Nueva plantilla')}
          >
            Nueva plantilla
          </button>
          <button
            className="w-full rounded-md bg-slate-100 px-3 py-2 text-left text-sm text-nodo-text hover:bg-slate-200"
            onClick={() => alert('Ver reportes')}
          >
            Ver reportes
          </button>
        </div>
      </div>
      <div className="border-b border-nodo-border p-4">
        <h3 className="mb-2 text-sm font-semibold text-nodo-title">Ajustes</h3>
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm">
            <span>Modo oscuro</span>
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={onToggleTheme}
              className="h-4 w-4"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Compactar menú</span>
            <input
              type="checkbox"
              checked={mini}
              onChange={onToggleMini}
              className="h-4 w-4"
            />
          </label>
        </div>
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-sm font-semibold text-nodo-title">Ayuda / Contacto</h3>
        <p className="text-sm text-nodo-text">
          ¿Necesitás ayuda? Escribinos a soporte@nodo.com
        </p>
      </div>
    </aside>
  );
}
