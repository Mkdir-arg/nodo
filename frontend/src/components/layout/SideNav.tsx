'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, type SVGProps } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
} from 'lucide-react';
import { NAV_ITEMS } from './constants';
import ActiveLink from './ActiveLink';
import { usePlantillasMin } from '@/lib/hooks/usePlantillasMin';

interface SideNavProps {
  open: boolean;
  mini: boolean;
  onToggleMini: () => void;
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
              <dashboardItem.icon className="h-5 w-5" aria-hidden />
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
              <plantillasItem.icon className="h-5 w-5" aria-hidden />
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

// ===== Fallbacks seguros para íconos de carpeta =====
function InlineFolder(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M3 7a2 2 0 0 1 2-2h3l2 2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function InlineFolderOpen(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M3 7a2 2 0 0 1 2-2h3l2 2h9a2 2 0 0 1 2 2" />
      <path d="M3 12h18l-2 6H5z" />
    </svg>
  );
}

const FolderClosedIcon = (Folder as any) ?? ((p: any) => <InlineFolder {...p} />);
const FolderOpenIcon = (FolderOpen as any) ?? ((p: any) => <InlineFolderOpen {...p} />);

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
        {open ? <FolderOpenIcon size={18} /> : <FolderClosedIcon size={18} />}
        <span className="flex-1 text-left">Legajos</span>
      </button>

      <div
        className={clsx(
          'pl-6 overflow-hidden transition-[grid-template-rows,opacity] duration-200 grid',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <ul className="min-h-0 overflow-hidden">
          <li className="mt-2 mb-1">
            <Link href="/legajos" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-200/50">
              <FileText size={16} /> <span>Ver legajos</span>
            </Link>
          </li>

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

