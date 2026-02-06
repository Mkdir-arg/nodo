'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { ReactNode, MouseEvent } from 'react';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';

interface ActiveLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  title?: string;
}

export default function ActiveLink({ href, children, className, title }: ActiveLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const { dirty, setDirty } = useBuilderStore((s) => ({ dirty: s.dirty, setDirty: s.setDirty }));

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (dirty && !window.confirm('Hay cambios sin guardar. ¿Continuar?')) {
      e.preventDefault();
      return;
    }
    if (dirty) setDirty(false);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      className={clsx(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-pink/10 text-nodo-title'
          : 'text-nodo-text hover:bg-slate-100',
        className
      )}
      title={title}
    >
      {children}
    </Link>
  );
}

