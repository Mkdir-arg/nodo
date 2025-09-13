'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Folder, FolderOpen, FilePlus2, ChevronLeft, ChevronRight } from 'lucide-react';
import { NAV_ITEMS } from './constants';
import ActiveLink from './ActiveLink';
import { usePlantillasMin } from '@/lib/hooks/usePlantillasMin';

interface SideNavProps {
  open: boolean;
  mini: boolean;
  onToggleMini: () => void;
}

// Helper: si un icono viniera undefined, renderiza fallback y evita el crash
function SafeIcon(Comp: any, props: any) {
  if (Comp) return <Comp {...props} />;
  if (process.env.NODE_ENV !== 'production') {
    // ayuda para debuggear qué ícono faltó
    // eslint-disable-next-line no-console
    console.warn('SafeIcon: icon component is undefined. Props:', props);
  }
  return <span aria-hidden>■</span>;
}

export default function SideNav({ open, mini, onToggleMini }: SideNavProps) {
  const dashboardItem = NAV_ITEMS.find((i) => i.href === '/');
  const plantillasItem = NAV_ITEMS.find((i) => i.href === '/plantillas');

  return (
    <aside
      className={clsx(
        'bg-white dark:bg-slate-950 shadow-md fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 md:static',
        mini ? 'md:w-16' : 'md:w-64',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
      role="navigation"
      aria-label="Sidebar"
    >
      <nav className="flex h-full flex-col p-4 space-y-1">
        <div className="flex-1 space-y-1">
          {dashboardItem && (
            <ActiveLink
              href={dashboardItem.href}
              className={clsx(mini && 'justify-center')}
              title={dashboardItem.label}
            >
              {SafeIcon(dashboardItem.icon, { className: 'h-5 w-5', 'aria-hidden': true })}
              {mini ? (
                <span className="sr-only">{dashboardItem.label}</span>
              ) : (
                <span>{dashboardItem.label}</span>
              )}
            </ActiveLink>
          )}

          <LegajosMenu />

          {plantillasItem && (
            <ActiveLink
              href={plantillasItem.href}
              className={clsx(mini && 'justify-center')}
              title={plantillasItem.label}
            >
              {SafeIcon(plantillasItem.icon, { className: 'h-5 w-5', 'aria-hidden': true })}
              {mini ? (
                <span className="sr-only">{plantillasItem.label}</span>
              ) : (
                <span>{plantillasItem.label}</span>
              )}
            </ActiveLink>
          )}
        </div>

        <button
          onClick={onToggleMini}
          className="mt-2 flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Compactar menú"
        >
          {mini ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </nav>
    </aside>
  );
}

function LegajosMenu() {
  const pathname = usePathname();
  const { data, isLoading } = usePlantillasMin();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/legajos')) setOpen(true);
  }, [pathname]);

  const items = data || [];

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={clsx(
          'w-full flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-200/60 dark:hover:bg-slate-800/60',
          pathname?.startsWith('/legajos') && 'bg-slate-200/60 dark:bg-slate-800/60'
        )}
      >
        {/* usar SafeIcon para evitar crash si el icono no existe */}
        {open
          ? SafeIcon(FolderOpen, { size: 18 })
          : SafeIcon(Folder, { size: 18 })}
        <span className="flex-1 text-left">Legajos</span>
      </button>

      {/* Despliegue con CSS (sin framer-motion) */}
      <div
        className={clsx(
          'pl-6 overflow-hidden transition-[grid-template-rows,opacity] duration-200 grid',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <ul className="min-h-0 overflow-hidden">
          {isLoading && <li className="px-3 py-2 text-sm opacity-70">Cargando…</li>}
          {!isLoading && items.length === 0 && <li className="px-3 py-2 text-sm opacity-60">No hay plantillas</li>}

          {!isLoading &&
            items.map((p: any) => (
              <li key={p.id}>
                <Link
                  href={`/legajos/nuevo?formId=${p.id}`}
                  className="block px-3 py-2 rounded hover:bg-slate-200/50"
                >
                  {p.nombre}
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

