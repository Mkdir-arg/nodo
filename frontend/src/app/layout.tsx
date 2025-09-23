import type { Metadata } from 'next';
import { ReactNode } from 'react';
import '../styles/globals.css';
import Providers from './providers';
import MainLayout from '@/components/layout/MainLayout';
import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@/lib/AuthContext';

export const metadata: Metadata = {
  title: 'Nodo',
  description: 'Next.js frontend',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <AuthProvider>
            <ToastProvider>
              {/* MainLayout se monta UNA sola vez acá */}
              <MainLayout>{children}</MainLayout>
            </ToastProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
