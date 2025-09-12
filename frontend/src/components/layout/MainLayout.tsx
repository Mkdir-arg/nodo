'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import TopNavBar from './TopNavBar';
import SideNav from './SideNav';
import ControlSidebar from './ControlSidebar';
import { getStored, setStored } from '@/lib/ui-state';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * NOTA: Este componente NO debe importarse en las páginas.
 * Se monta una sola vez desde app/layout.tsx.
 */
export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  // Rutas donde NO debe renderizarse el chrome (navbar + sidenav + control)
  const isAuthRoute =
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/forgot-password') ||
    pathname === '/auth';

  if (isAuthRoute) {
    // Página "limpia" para auth
    return <div className="min-h-screen">{children}</div>;
  }

  return <Chrome>{children}</Chrome>;
}

/** Chrome de la app: TopNavBar + SideNav + ControlSidebar */
function Chrome({ children }: { children: ReactNode }) {
  const [isSideOpen, setIsSideOpen] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [isControlOpen, setIsControlOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setIsMini(getStored('sideCollapsed', false));
    // Evito genérico en TSX para que no rompa el parser
    setTheme(getStored('theme', 'light') as 'light' | 'dark');
  }, []);

  useEffect(() => {
    setStored('sideCollapsed', isMini);
  }, [isMini]);

  useEffect(() => {
    setStored('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="flex min-h-screen">
      {/* Backdrop del SideNav (solo mobile) */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden',
          isSideOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setIsSideOpen(false)}
      />
      {/* Backdrop del ControlSidebar */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200',
          isControlOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setIsControlOpen(false)}
      />

      <SideNav open={isSideOpen} mini={isMini} onToggleMini={() => setIsMini((m) => !m)} />

      <div
        className={clsx(
          'flex min-h-screen flex-1 flex-col transition-all duration-200',
          isMini ? 'md:ml-16' : 'md:ml-64'
        )}
      >
        <TopNavBar
          onToggleSideNav={() => setIsSideOpen((o) => !o)}
          onToggleControl={() => setIsControlOpen(true)}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          theme={theme}
        />

        <main className="flex-1">
          {/* 🔸 Las páginas deben renderizar SOLO su contenido.
              No importes TopNavBar / SideNav / ControlSidebar en las páginas. */}
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6">{children}</div>
        </main>
      </div>

      <ControlSidebar
        open={isControlOpen}
        onClose={() => setIsControlOpen(false)}
        mini={isMini}
        theme={theme}
        onToggleMini={() => setIsMini((m) => !m)}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />
    </div>
  );
}
