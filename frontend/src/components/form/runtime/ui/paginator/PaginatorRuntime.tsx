'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Check, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DynamicNode from '../../DynamicNode';
import type { UIPaginatorConfig } from './types';

interface PaginatorRuntimeProps {
  config: UIPaginatorConfig;
  allNodes: any[];
  mode: 'create' | 'view' | 'edit';
  onValidatePage?: (pageIndex: number) => Promise<boolean>;
}

export default function PaginatorRuntime({
  config,
  allNodes,
  mode,
  onValidatePage
}: PaginatorRuntimeProps) {
  const methods = useFormContext();
  const [currentPage, setCurrentPage] = useState(config.initial_page || 0);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set(config.pages.map(p => p.id)));
  const pages = config.pages || [];
  

  const isWizardMode = mode === 'create' && config.behavior.create === 'wizard';
  const isSectionsMode = (mode === 'edit' && config.behavior.edit === 'sections');
  const isViewMode = mode === 'view';
  const formData = methods.watch();

  // Obtener campos del schema por key
  const getFieldByKey = (key: string) => {
    return allNodes.find((n: any) => n.key === key);
  };

  // Calcular progreso de una página
  const getPageProgress = (page: any) => {
    const fieldKeys = page.fieldKeys || [];
    if (fieldKeys.length === 0) return { completed: 0, total: 0, percentage: 100 };
    
    let completed = 0;
    fieldKeys.forEach((key: string) => {
      const field = getFieldByKey(key);
      const value = formData[key];
      
      // Considerar completado si tiene valor o no es requerido
      if (value !== undefined && value !== null && value !== '') {
        completed++;
      } else if (field && !field.required) {
        completed++;
      }
    });
    
    return {
      completed,
      total: fieldKeys.length,
      percentage: Math.round((completed / fieldKeys.length) * 100)
    };
  };

  // Toggle accordion
  const togglePage = (pageId: string) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId);
    } else {
      newExpanded.add(pageId);
    }
    setExpandedPages(newExpanded);
  };

  // Validar página actual
  const validateCurrentPage = async () => {
    if (!onValidatePage) return true;
    return await onValidatePage(currentPage);
  };

  // Navegar a página siguiente
  const handleNext = async () => {
    const isValid = await validateCurrentPage();
    if (!isValid) return;
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Navegar a página anterior
  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Saltar a página específica
  const handleJumpToPage = (pageIndex: number) => {
    if (config.allow_jump || isSectionsMode) {
      setCurrentPage(pageIndex);
    }
  };

  // Renderizar stepper horizontal con progreso
  const renderStepper = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        {pages.map((page, idx) => {
          const isActive = idx === currentPage;
          const isCompleted = idx < currentPage;
          const isClickable = config.allow_jump && !isSectionsMode;
          const progress = getPageProgress(page);
          const isPageComplete = progress.completed === progress.total;

          return (
            <div key={page.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => isClickable && handleJumpToPage(idx)}
                  disabled={!isClickable}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-500 text-white'
                      : isPageComplete
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  } ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                >
                  {isPageComplete ? <Check size={18} /> : idx + 1}
                </button>
                <span className="text-xs mt-2 text-center text-gray-600 dark:text-gray-400">
                  {page.title || `Página ${idx + 1}`}
                </span>
                {config.show_progress && (
                  <span className="text-xs text-gray-500 mt-1">
                    {progress.completed}/{progress.total}
                  </span>
                )}
              </div>
              {idx < pages.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${isPageComplete ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Renderizar tabs
  const renderTabs = () => {
    return (
      <div className="flex border-b mb-6">
        {pages.map((page, idx) => {
          const isActive = idx === currentPage;
          const isClickable = config.allow_jump || isSectionsMode;

          return (
            <button
              key={page.id}
              onClick={() => isClickable && handleJumpToPage(idx)}
              disabled={!isClickable}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {page.title || `Página ${idx + 1}`}
            </button>
          );
        })}
      </div>
    );
  };

  // Renderizar barra de progreso
  const renderProgress = () => {
    const progress = ((currentPage + 1) / pages.length) * 100;
    return (
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>{pages[currentPage]?.title || `Página ${currentPage + 1}`}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-sky-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  // Renderizar dots
  const renderDots = () => {
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {pages.map((page, idx) => {
          const isActive = idx === currentPage;
          const isClickable = config.allow_jump || isSectionsMode;

          return (
            <button
              key={page.id}
              onClick={() => isClickable && handleJumpToPage(idx)}
              disabled={!isClickable}
              className={`w-2 h-2 rounded-full transition-all ${
                isActive ? 'bg-sky-500 w-8' : 'bg-gray-300'
              } ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
              title={page.title || `Página ${idx + 1}`}
            />
          );
        })}
      </div>
    );
  };

  // Renderizar navegación según variante
  const renderNavigation = () => {
    if (isSectionsMode) return null;

    switch (config.variant) {
      case 'tabs':
        return renderTabs();
      case 'progress':
        return renderProgress();
      case 'dots':
        return renderDots();
      case 'stepper':
      default:
        return renderStepper();
    }
  };

  // Renderizar campos de una página
  const renderPageFields = (page: any) => {
    const fieldKeys = page.fieldKeys || [];
    
    return (
      <div className="space-y-4">
        {fieldKeys.map((key: string) => {
          const field = getFieldByKey(key);
          if (!field) return null;

          // En modo view, renderizar como readonly
          if (isViewMode) {
            const value = formData[key];
            
            // Si es un grupo, verificar si es array o objeto simple
            if (field.type === 'group') {
              const isArray = field.maxItems !== 1;
              
              if (isArray) {
                // Grupo repetible (array)
                const items = Array.isArray(value) ? value : (value ? [value] : []);
                return (
                  <div key={field.id} className="space-y-3">
                    <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30">
                        <span className="text-xs">📋</span>
                      </span>
                      <span>{field.label || field.key}</span>
                    </label>
                    {items.length === 0 ? (
                      <div className="text-slate-400 text-sm italic px-4 py-3">Sin datos</div>
                    ) : (
                      <div className="space-y-3">
                        {items.map((item: any, idx: number) => (
                          <div key={idx} className="
                            rounded-2xl p-4
                            bg-white/90 dark:bg-slate-900/70
                            backdrop-blur-xl
                            border border-slate-200/60 dark:border-slate-700/60
                            shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50
                          ">
                            {(field.children || []).map((child: any) => (
                              <div key={child.id} className="mb-3 last:mb-0">
                                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{child.label || child.key}</div>
                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{item[child.key] || <span className="text-slate-400 italic">—</span>}</div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                // Grupo simple (objeto)
                const hasData = value && typeof value === 'object' && Object.values(value).some(v => v);
                return (
                  <div key={field.id} className="space-y-3">
                    <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30">
                        <span className="text-xs">📋</span>
                      </span>
                      <span>{field.label || field.key}</span>
                    </label>
                    {!hasData ? (
                      <div className="text-slate-400 text-sm italic px-4 py-3">Sin datos</div>
                    ) : (
                      <div className="
                        rounded-2xl p-4
                        bg-white/90 dark:bg-slate-900/70
                        backdrop-blur-xl
                        border border-slate-200/60 dark:border-slate-700/60
                        shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50
                      ">
                        {(field.children || []).map((child: any) => (
                          <div key={child.id} className="mb-3 last:mb-0">
                            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{child.label || child.key}</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{value[child.key] || <span className="text-slate-400 italic">—</span>}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
            }
            
            // Campo simple
            return (
              <div key={field.id} className="space-y-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30">
                    <span className="text-xs">📄</span>
                  </span>
                  <span>{field.label || field.key}</span>
                </label>
                <div className="
                  px-4 py-3 rounded-2xl
                  bg-white/90 dark:bg-slate-900/70
                  backdrop-blur-xl
                  border border-slate-200/60 dark:border-slate-700/60
                  shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50
                  text-slate-900 dark:text-slate-100
                  font-medium
                ">
                  {value || <span className="text-slate-400 italic">Sin información</span>}
                </div>
              </div>
            );
          }

          return <DynamicNode key={field.id} node={field} />;
        })}
      </div>
    );
  };

  // Renderizar botones de navegación
  const renderButtons = () => {
    if (isSectionsMode) return null;

    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage === pages.length - 1;
    const labels = config.labels || {};

  

    // En modo view, solo navegación sin submit
    if (isViewMode) {
      return (
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={isFirstPage}
          >
            <ChevronLeft size={16} className="mr-1" />
            {labels.prev || 'Anterior'}
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={isLastPage}
          >
            {labels.next || 'Siguiente'}
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex justify-between mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={isFirstPage}
        >
          <ChevronLeft size={16} className="mr-1" />
          {labels.prev || 'Anterior'}
        </Button>

        <div className="flex gap-2">
          <Button 
            type="button" 
            onClick={handleNext}
            disabled={isLastPage}
          >
            {labels.next || 'Siguiente'}
            <ChevronRight size={16} className="ml-1" />
          </Button>
          
          <Button type="submit">
            {labels.finish || 'Finalizar'}
          </Button>
        </div>
      </div>
    );
  };

  // Modo sections: mostrar todas las páginas con accordion
  if (isSectionsMode) {
    return (
      <div className="space-y-4">
        {pages.map((page) => {
          const isExpanded = expandedPages.has(page.id);
          const progress = getPageProgress(page);
          const isComplete = progress.completed === progress.total;

          return (
            <div key={page.id} className="border rounded-lg bg-white overflow-hidden">
              {/* Header accordion */}
              <button
                onClick={() => togglePage(page.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isComplete ? <Check size={14} /> : pages.indexOf(page) + 1}
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-semibold">{page.title || 'Sección'}</h3>
                    <p className="text-xs text-gray-500">
                      {progress.completed}/{progress.total} campos completados ({progress.percentage}%)
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {/* Contenido */}
              {isExpanded && (
                <div className="p-4 border-t">
                  {page.description && (
                    <p className="text-sm text-gray-600 mb-4">{page.description}</p>
                  )}
                  {renderPageFields(page)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Modo wizard o view: mostrar página actual
  const currentPageData = pages[currentPage];
  if (!currentPageData) return null;

  const containerClass = config.glass
    ? 'bg-white/90 dark:bg-slate-900/70 backdrop-blur-md border border-gray-200 dark:border-slate-700'
    : 'bg-white border border-gray-200 shadow-sm';

  return (
    <div className={`${containerClass} rounded-2xl p-6 ${config.sticky_nav ? 'sticky top-4' : ''}`}>
      {config.show_progress && renderNavigation()}
      
      <div className="mb-6">
        {currentPageData.description && (
          <p className="text-sm text-gray-600 mb-4">{currentPageData.description}</p>
        )}
        {renderPageFields(currentPageData)}
      </div>

      {renderButtons()}
    </div>
  );
}
