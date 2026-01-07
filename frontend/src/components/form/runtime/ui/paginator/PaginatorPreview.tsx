'use client';

import { Check } from 'lucide-react';
import type { UIPaginatorNode } from './types';

interface PaginatorPreviewProps {
  node: UIPaginatorNode;
  availableFields?: Array<{ key: string; label?: string; type: string }>;
}

export default function PaginatorPreview({ node, availableFields = [] }: PaginatorPreviewProps) {
  const config = node.config;
  const pages = config.pages || [];
  const initialPage = config.initial_page || 0;
  const totalFields = pages.reduce((sum, p) => sum + (p.fieldKeys?.length || 0), 0);
  const missingCount = pages.reduce((sum, p) => {
    return sum + (p.fieldKeys?.filter(k => !availableFields.find(f => f.key === k)).length || 0);
  }, 0);

  const getFieldInfo = (key: string) => availableFields.find(f => f.key === key);

  return (
    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-white/30 dark:border-slate-700/40 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Paginador</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">UI</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">
            {pages.length} páginas · {totalFields} campos asignados
          </p>
          {missingCount > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              ⚠️ {missingCount} campo(s) faltantes
            </p>
          )}
        </div>
      </div>

      {/* Stepper Preview */}
      <div className="space-y-4">
        {pages.map((page, idx) => {
          const pageFields = page.fieldKeys || [];
          const isActive = idx === initialPage;
          const isCompleted = idx < initialPage;

          return (
            <div key={page.id} className="space-y-2">
              {/* Step header */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors flex-shrink-0 ${
                    isActive
                      ? 'bg-sky-500 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isCompleted ? <Check size={16} /> : idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {page.title || `Página ${idx + 1}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {pageFields.length} campo(s)
                  </div>
                </div>
              </div>

              {/* Fields in this page */}
              {pageFields.length > 0 && (
                <div className="ml-11 space-y-1">
                  {pageFields.slice(0, 3).map((key) => {
                    const field = getFieldInfo(key);
                    const isMissing = !field;

                    return (
                      <div
                        key={key}
                        className="flex items-center gap-2 p-2 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded text-xs"
                      >
                        {isMissing ? (
                          <>
                            <span className="text-red-600 dark:text-red-400 font-mono truncate flex-1">
                              {key}
                            </span>
                            <span className="text-red-500 text-xs">⚠️</span>
                          </>
                        ) : (
                          <>
                            <span className="font-medium truncate flex-1">{field.label || key}</span>
                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs">
                              {field.type}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                  {pageFields.length > 3 && (
                    <div className="text-xs text-gray-500 pl-2">
                      +{pageFields.length - 3} más...
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
