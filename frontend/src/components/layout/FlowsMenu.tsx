'use client';

import { useState } from 'react';
import { ChevronDown, Workflow, Plus } from 'lucide-react';
import clsx from 'clsx';
import ActiveLink from './ActiveLink';

interface FlowsMenuProps {
  items: Array<{
    id: string;
    label: string;
    href: string;
    icon?: any;
  }>;
}

export default function FlowsMenu({ items }: FlowsMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
      >
        <Workflow className="h-5 w-5" aria-hidden />
        <span className="ml-3 flex-1 text-left">Flujos</span>
        <ChevronDown className={clsx(
          'h-4 w-4 transition-transform',
          isExpanded && 'rotate-180'
        )} />
      </button>
      
      {isExpanded && (
        <div className="ml-6 space-y-1 mt-1">
          {items.map((item) => (
            <ActiveLink
              key={item.id}
              href={item.href}
              className="text-sm flex items-center gap-2"
            >
              {item.icon ? (
                <item.icon className="h-4 w-4" aria-hidden />
              ) : (
                <Workflow className="h-4 w-4" aria-hidden />
              )}
              {item.label}
            </ActiveLink>
          ))}
        </div>
      )}
    </div>
  );
}