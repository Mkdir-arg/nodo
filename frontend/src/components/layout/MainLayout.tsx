import { ReactNode, useState } from 'react';
import clsx from 'clsx';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sideOpen, setSideOpen] = useState(false);

  return (
    <div className="flex">
      {/** Overlay visible only on mobile when sidebar is open */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/50 transition-opacity duration-300 md:hidden',
          sideOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSideOpen(false)}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
