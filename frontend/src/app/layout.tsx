import type { Metadata } from 'next';
import { ReactNode } from 'react';
import '../styles/globals.css';
import Providers from './providers';
import MainLayout from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Nodo',
  description: 'Next.js frontend',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100 antialiased">
        <Providers>
          {/* MainLayout se monta UNA sola vez acá */}
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
