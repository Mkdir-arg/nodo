'use client';

import Link from 'next/link';
import clsx from 'clsx';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/legajos', label: 'Legajos' },
  { href: '/plantillas', label: 'Plantillas' }
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 w-64 bg-white shadow-md transform transition-transform duration-300 md:static md:translate-x-0 z-40',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
    >
      <nav className="p-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-lg px-3 py-2 hover:bg-gray-100"
            onClick={onClose}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
