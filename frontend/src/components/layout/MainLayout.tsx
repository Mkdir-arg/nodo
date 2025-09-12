'use client';

import { ReactNode, useEffect, useState } from 'react';
import clsx from 'clsx';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    const body = document.body;
    if (sideOpen) {
      body.classList.add('overflow-hidden');
    } else {
      body.classList.remove('overflow-hidden');
    }
    return () => {
      body.classList.remove('overflow-hidden');
    };
  }, [sideOpen]);

  return (
    <div className="flex min-h-screen">
      {/** Overlay visible only on mobile when sidebar is open */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/50 transition-opacity duration-300 md:hidden',
          sideOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSideOpen(false)}
      />
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Topbar onToggleSidebar={() => setSideOpen((o) => !o)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
