import type { Metadata } from 'next';
import { ReactNode } from 'react';
import '../styles/globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Nodo',
  description: 'Next.js frontend',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
