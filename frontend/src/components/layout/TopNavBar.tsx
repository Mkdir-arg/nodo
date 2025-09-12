'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Menu, PanelRightOpen, Search, Sun, Moon, User } from 'lucide-react';
import { logout } from '@/lib/auth';

interface TopNavBarProps {
  onToggleSideNav: () => void;
  onToggleControl: () => void;
  onToggleTheme: () => void;
  theme: string;
}

export default function TopNavBar({
  onToggleSideNav,
  onToggleControl,
  onToggleTheme,
  theme,
}: TopNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const section = pathname.split('/').filter(Boolean)[0];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur dark:bg-slate-900/70 shadow-sm">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            className="md:hidden rounded-md p-2 hover:bg-slate-200 dark:hover:bg-slate-800"
            onClick={onToggleSideNav}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold">Nodo</span>
          <span className="text-sm text-slate-500">
            Home{section ? ` / ${section.charAt(0).toUpperCase() + section.slice(1)}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-2 top-2 h-4 w-4 text-slate-500" />
            <input
              type="search"
              aria-label="Buscar"
              placeholder="Buscar..."
              className="rounded-md border border-slate-300 bg-white py-1 pl-8 pr-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <button
            onClick={onToggleTheme}
            aria-label="Cambiar tema"
            className="rounded-md p-2 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            aria-label="Ver notificaciones"
            className="rounded-md p-2 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            onClick={onToggleControl}
            aria-label="Abrir panel de control"
            className="rounded-md p-2 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <PanelRightOpen className="h-5 w-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menú de usuario"
              aria-expanded={menuOpen}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
            >
              <User className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-md bg-white py-1 shadow-md dark:bg-slate-800">
                <button
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                    router.replace('/login');
                  }}
                  role="menuitem"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
