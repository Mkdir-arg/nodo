'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import TopNavBar from './TopNavBar';
import SideNav from './SideNav';
import ControlSidebar from './ControlSidebar';
import { useAuth } from '@/lib/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * NOTA: Este componente NO debe importarse en las paginas.
 * Se monta una sola vez desde app/layout.tsx.
 */
export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { isLoading } = useAuth();
  const isLoginRoute = pathname.startsWith('/login');
  const isFullWidthRoute =
  pathname.startsWith('/plantillas/crear') ||
  pathname.startsWith('/plantillas/editar') ||
  pathname.startsWith('/plantillas/editor') ||
  pathname.startsWith('/legajos/');

  const [isSideOpen, setIsSideOpen] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [isControlOpen, setIsControlOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (isLoginRoute) return;
    // Sin localStorage - usar valores por defecto
    setIsMini(false);
    setTheme('light');
  }, [isLoginRoute]);

  useEffect(() => {
    if (isLoginRoute) return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme, isLoginRoute]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden',
          isSideOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setIsSideOpen(false)}
      />
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200',
          isControlOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setIsControlOpen(false)}
      />

      <SideNav open={isSideOpen} mini={isMini} onToggleMini={() => setIsMini((value) => !value)} />

      <div className="flex min-h-screen flex-1 flex-col transition-all duration-200">
        <TopNavBar
          onToggleSideNav={() => setIsSideOpen((value) => !value)}
          onToggleControl={() => setIsControlOpen(true)}
          onToggleTheme={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
          theme={theme}
        />

        <main className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
          <div
            className={clsx(
              'p-4 md:p-6',
              isFullWidthRoute ? 'w-full max-w-none' : 'mx-auto max-w-screen-2xl'
            )}
          >
            {children}
          </div>
        </main>
      </div>

      <ControlSidebar
        open={isControlOpen}
        onClose={() => setIsControlOpen(false)}
        mini={isMini}
        theme={theme}
        onToggleMini={() => setIsMini((value) => !value)}
        onToggleTheme={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
      />
    </div>
  );
}