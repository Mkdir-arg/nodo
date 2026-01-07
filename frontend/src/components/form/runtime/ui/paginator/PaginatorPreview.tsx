'use client';

import { Check } from 'lucide-react';
import type { UIPaginatorNode } from './types';

interface PaginatorPreviewProps {
  node: UIPaginatorNode;
}

export default function PaginatorPreview({ node }: PaginatorPreviewProps) {
  const config = node.config;
  const pages = config.pages || [];
  const initialPage = config.initial_page || 0;
  const totalFields = pages.reduce((sum, p) => sum + (p.fieldKeys?.length || 0), 0);

  return (
    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-white/30 dark:border-slate-700/40 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Paginador</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">UI</span>
        </div>
        <p className="text-xs text-gray-500">
          {pages.length} páginas · {totalFields} campos asignados
        </p>
      </div>

      {/* Stepper Preview */}
      <div className="flex items-center justify-between">
        {pages.map((page, idx) => (
          <div key={page.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  idx === initialPage
                    ? 'bg-sky-500 text-white'
                    : idx < initialPage
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {idx < initialPage ? <Check size={16} /> : idx + 1}
              </div>
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400 max-w-[80px] truncate">
                {page.title || `Página ${idx + 1}`}
              </span>
            </div>
            {idx < pages.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
