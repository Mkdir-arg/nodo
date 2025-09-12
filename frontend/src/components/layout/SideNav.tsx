'use client';

import clsx from 'clsx';
import { NAV_ITEMS } from './constants';
import ActiveLink from './ActiveLink';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SideNavProps {
  open: boolean;
  mini: boolean;
  onToggleMini: () => void;
}

export default function SideNav({ open, mini, onToggleMini }: SideNavProps) {
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
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <ActiveLink
                key={item.href}
                href={item.href}
                className={clsx(mini && 'justify-center')}
                title={item.label}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {mini ? (
                  <span className="sr-only">{item.label}</span>
                ) : (
                  <span>{item.label}</span>
                )}
              </ActiveLink>
            );
          })}
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
