'use client';

import clsx from 'clsx';
import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { NAV_ITEMS } from './constants';
import ActiveLink from './ActiveLink';
import { usePlantillasMin } from '@/lib/hooks/usePlantillasMin';
import LegajosMenu from './LegajosMenu';

interface SideNavProps {
  open: boolean;
  mini: boolean;
  onToggleMini: () => void;
}

// Pequeño helper para evitar crash si algún icono llega undefined por cualquier motivo
function Safe({ Comp, className, size, 'aria-hidden': ariaHidden }: { Comp: any; className?: string; size?: number; 'aria-hidden'?: boolean }) {
  if (Comp) return <Comp className={className} size={size} aria-hidden={ariaHidden} />;
  // fallback invisible (no cuadrado negro)
  return <span aria-hidden className={className} style={{ width: size, height: size, display: 'inline-block' }} />;
}

export default function SideNav({ open, mini, onToggleMini }: SideNavProps) {
  const dashboardItem = NAV_ITEMS.find((i) => i.href === '/');
  const plantillasItem = NAV_ITEMS.find((i) => i.href === '/plantillas');
  const { data } = usePlantillasMin();

  const legajoItems = useMemo(() => {
    const base = [{
      id: 'ver',
      label: 'Ver legajos',
      href: '/legajos',
      icon: 'FilePlus' as const,
    }];
    const plantillas = (data ?? []).map((p: any) => ({
      id: String(p.id),
      label: p.nombre,
      href: `/legajos/nuevo?formId=${p.id}`,
    }));
    return [...base, ...plantillas];
  }, [data]);

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
              {/* dashboardItem.icon viene de constants.ts. Si por alguna razón está undefined, evita crash */}
              <Safe Comp={dashboardItem.icon} className="h-5 w-5" aria-hidden />
              {mini ? <span className="sr-only">{dashboardItem.label}</span> : <span>{dashboardItem.label}</span>}
            </ActiveLink>
          )}

          <LegajosMenu items={legajoItems} />

          {plantillasItem && (
            <ActiveLink
              href={plantillasItem.href}
              className={clsx(mini && 'justify-center')}
              title={plantillasItem.label}
            >
              <Safe Comp={plantillasItem.icon} className="h-5 w-5" aria-hidden />
              {mini ? <span className="sr-only">{plantillasItem.label}</span> : <span>{plantillasItem.label}</span>}
            </ActiveLink>
          )}
        </div>

        <button
          onClick={onToggleMini}
          className="mt-2 flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Compactar menú"
        >

          {mini ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}

        </button>
      </nav>
    </aside>
  );
}

