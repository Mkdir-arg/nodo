'use client';

import { Check } from 'lucide-react';
import type { UIPaginatorNode } from '../../runtime/ui/paginator/types';

interface PaginatorPreviewProps {
  node: UIPaginatorNode;
  availableFields?: Array<{ key: string; label?: string; type: string }>;
}

export default function PaginatorPreview({ node, availableFields = [] }: PaginatorPreviewProps) {
  const config = node.config;
  const pages = config.pages || [];
  const initialPage = config.initial_page || 0;
  const totalFields = pages.reduce((sum, p) => sum + (p.fieldKeys?.length || 0), 0);

  const getFieldInfo = (key: string) => availableFields.find(f => f.key === key);

  return (
    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-white/30 dark:border-slate-700/40 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Paginador</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">UI</span>
        </div>
        <p className="text-xs text-gray-500">
          {pages.length} páginas · {totalFields} campos
        </p>
      </div>

      {/* Stepper horizontal compacto */}
      <div className="flex items-start gap-2">
        {pages.map((page, idx) => {
          const pageFields = page.fieldKeys || [];
          const isActive = idx === initialPage;

          return (
            <div key={page.id} className="flex-1 min-w-0">
              {/* Step circle + title */}
              <div className="flex flex-col items-center mb-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    isActive ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1 text-center truncate w-full">
                  {page.title || `Página ${idx + 1}`}
                </div>
              </div>

              {/* Lista de campos */}
              {pageFields.length > 0 && (
                <div className="space-y-1">
                  {pageFields.map((key) => {
                    const field = getFieldInfo(key);
                    const isMissing = !field;

                    return (
                      <div
                        key={key}
                        className="text-xs px-2 py-1 bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded truncate"
                        title={field?.label || key}
                      >
                        {isMissing ? (
                          <span className="text-red-600">⚠️ {key}</span>
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300">{field.label || key}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {pageFields.length === 0 && (
                <div className="text-xs text-gray-400 text-center mt-2">Sin campos</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
