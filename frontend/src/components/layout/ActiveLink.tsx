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
  const dirty = useBuilderStore((s) => s.dirty);
  const setDirty = useBuilderStore((s) => s.setDirty);

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
          ? 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
        className
      )}
      title={title}
    >
      {children}
    </Link>
  );
}

