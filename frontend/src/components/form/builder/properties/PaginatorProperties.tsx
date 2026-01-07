'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import { getAvailableFields, type AvailableField } from './paginator/getAvailableFields';
import ConfirmMoveFieldModal from '../ui/ConfirmMoveFieldModal';
import type { UIPaginatorNode, UIPaginatorConfig } from '../runtime/ui/paginator/types';

interface PaginatorPropertiesProps {
  node: UIPaginatorNode;
  onChange: (patch: Partial<UIPaginatorNode>) => void;
}

export default function PaginatorProperties({ node, onChange }: PaginatorPropertiesProps) {
  const config = node.config;
  const { sections, paginatorAddField, paginatorRemoveField, paginatorMoveField, paginatorReorderFields, paginatorFindFieldPage } = useBuilderStore();
  
  const [selectedPageId, setSelectedPageId] = useState(config.pages[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(false);
  const [moveModal, setMoveModal] = useState<{ fieldKey: string; fieldLabel: string; fromPageId: string; toPageId: string } | null>(null);

  const availableFields = getAvailableFields(sections);
  const allAssignedKeys = new Set(config.pages.flatMap(p => p.fieldKeys || []));
  
  const selectedPage = config.pages.find(p => p.id === selectedPageId);
  const selectedPageFields = selectedPage?.fieldKeys || [];

  const updateConfig = (patch: Partial<UIPaginatorConfig>) => {
    onChange({ config: { ...config, ...patch } });
  };

  const updatePage = (pageId: string, patch: any) => {
    const pages = config.pages.map(p => p.id === pageId ? { ...p, ...patch } : p);
    updateConfig({ pages });
  };

  const addPage = () => {
    const newPage = {
      id: `p${Date.now()}`,
      title: `Página ${config.pages.length + 1}`,
      fieldKeys: []
    };
    updateConfig({ pages: [...config.pages, newPage] });
    setSelectedPageId(newPage.id);
  };

  const removePage = (pageId: string) => {
    const page = config.pages.find(p => p.id === pageId);
    if (page?.fieldKeys?.length > 0) {
      if (!confirm('Esta página tiene campos asignados. ¿Desea eliminarla?')) return;
    }
    const pages = config.pages.filter(p => p.id !== pageId);
    updateConfig({ pages });
    if (selectedPageId === pageId && pages.length > 0) {
      setSelectedPageId(pages[0].id);
    }
  };

  const handleAddField = (fieldKey: string) => {
    const existingPageId = paginatorFindFieldPage(node.id, fieldKey);
    
    if (existingPageId && existingPageId !== selectedPageId) {
      const fromPage = config.pages.find(p => p.id === existingPageId);
      const toPage = config.pages.find(p => p.id === selectedPageId);
      const field = availableFields.find(f => f.key === fieldKey);
      
      setMoveModal({
        fieldKey,
        fieldLabel: field?.label || fieldKey,
        fromPageId: existingPageId,
        toPageId: selectedPageId
      });
      return;
    }
    
    paginatorAddField(node.id, selectedPageId, fieldKey);
  };

  const handleConfirmMove = () => {
    if (!moveModal) return;
    paginatorMoveField(node.id, moveModal.fromPageId, moveModal.toPageId, moveModal.fieldKey);
    setMoveModal(null);
  };

  const handleRemoveField = (fieldKey: string) => {
    paginatorRemoveField(node.id, selectedPageId, fieldKey);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    paginatorReorderFields(node.id, selectedPageId, index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedPageFields.length - 1) return;
    paginatorReorderFields(node.id, selectedPageId, index, index + 1);
  };

  const filteredFields = availableFields.filter(field => {
    const matchesSearch = !searchTerm || 
      field.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.key.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !showOnlyUnassigned || !allAssignedKeys.has(field.key);
    
    return matchesSearch && matchesFilter;
  });

  const getFieldInfo = (key: string): AvailableField | null => {
    return availableFields.find(f => f.key === key) || null;
  };

  const totalAssigned = allAssignedKeys.size;
  const missingKeys = selectedPageFields.filter(key => !availableFields.find(f => f.key === key));

  return (
    <>
      <div className="space-y-6 p-4">
        {/* Páginas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-semibold">Páginas</Label>
            <Button size="sm" variant="outline" onClick={addPage}>
              <Plus size={14} className="mr-1" />
              Agregar
            </Button>
          </div>
          <div className="space-y-2">
            {config.pages.map((page, idx) => (
              <div key={page.id} className="flex items-center gap-2 p-2 border rounded">
                <span className="text-xs font-medium text-gray-500 w-6">{idx + 1}</span>
                <Input
                  value={page.title || ''}
                  onChange={(e) => updatePage(page.id, { title: e.target.value })}
                  placeholder="Título"
                  className="flex-1 h-8 text-sm"
                />
                <span className="text-xs text-gray-500">{page.fieldKeys?.length || 0} campos</span>
                {config.pages.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removePage(page.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Asignación de campos */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Asignación de campos</Label>
          
          {/* Selector de página activa */}
          <div className="mb-3">
            <Label className="text-xs mb-1 block">Página activa</Label>
            <select
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded"
            >
              {config.pages.map((page, idx) => (
                <option key={page.id} value={page.id}>
                  {page.title || `Página ${idx + 1}`} ({page.fieldKeys?.length || 0} campos)
                </option>
              ))}
            </select>
          </div>

          {/* Indicadores */}
          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
            <div>Campos asignados totales: <span className="font-medium">{totalAssigned}</span></div>
            {missingKeys.length > 0 && (
              <div className="text-amber-600 dark:text-amber-400 mt-1">
                ⚠️ {missingKeys.length} campo(s) no existen en el template
              </div>
            )}
          </div>

          {/* Campos disponibles */}
          <div className="mb-4">
            <Label className="text-xs mb-2 block">Campos disponibles</Label>
            
            <div className="mb-2 space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="pl-8 h-8 text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showUnassigned"
                  checked={showOnlyUnassigned}
                  onChange={(e) => setShowOnlyUnassigned(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="showUnassigned" className="text-xs cursor-pointer">
                  Solo no asignados
                </Label>
              </div>
            </div>

            <div className="border rounded max-h-48 overflow-y-auto">
              {filteredFields.length === 0 ? (
                <div className="p-3 text-xs text-gray-500 text-center">
                  {searchTerm ? 'No se encontraron campos' : 'No hay campos disponibles'}
                </div>
              ) : (
                filteredFields.map(field => {
                  const isAssigned = allAssignedKeys.has(field.key);
                  const isInCurrentPage = selectedPageFields.includes(field.key);
                  
                  return (
                    <div
                      key={field.key}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-slate-800/40 border-b last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{field.label}</div>
                        <div className="text-xs text-gray-500 font-mono truncate">{field.key}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">
                          {field.type}
                        </span>
                        {isInCurrentPage ? (
                          <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAddField(field.key)}
                            className="h-6 px-2 text-xs"
                            disabled={isAssigned}
                          >
                            {isAssigned ? 'Asignado' : '+ Agregar'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Campos de esta página */}
          <div>
            <Label className="text-xs mb-2 block">Campos en esta página</Label>
            
            <div className="border rounded max-h-64 overflow-y-auto">
              {selectedPageFields.length === 0 ? (
                <div className="p-3 text-xs text-gray-500 text-center">
                  No hay campos asignados a esta página
                </div>
              ) : (
                selectedPageFields.map((key, index) => {
                  const field = getFieldInfo(key);
                  const isMissing = !field;
                  
                  return (
                    <div
                      key={`${key}-${index}`}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-slate-800/40 border-b last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
                        {isMissing ? (
                          <>
                            <div className="text-xs font-medium text-red-600 dark:text-red-400 truncate">
                              {key} (No existe)
                            </div>
                            <div className="text-xs text-red-500">Campo eliminado del template</div>
                          </>
                        ) : (
                          <>
                            <div className="text-xs font-medium truncate">{field.label}</div>
                            <div className="text-xs text-gray-500 font-mono truncate">{field.key}</div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {!isMissing && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">
                            {field.type}
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronUp size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === selectedPageFields.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronDown size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveField(key)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Apariencia */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Apariencia</Label>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Variante</Label>
              <select
                value={config.variant || 'stepper'}
                onChange={(e) => updateConfig({ variant: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 text-sm border rounded"
              >
                <option value="stepper">Stepper</option>
                <option value="tabs">Tabs</option>
                <option value="progress">Progress</option>
                <option value="dots">Dots</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show_progress"
                checked={config.show_progress ?? true}
                onChange={(e) => updateConfig({ show_progress: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="show_progress" className="text-xs cursor-pointer">Mostrar progreso</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="glass"
                checked={config.glass ?? true}
                onChange={(e) => updateConfig({ glass: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="glass" className="text-xs cursor-pointer">Efecto glass</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sticky_nav"
                checked={config.sticky_nav ?? false}
                onChange={(e) => updateConfig({ sticky_nav: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="sticky_nav" className="text-xs cursor-pointer">Navegación fija</Label>
            </div>
          </div>
        </div>

        {/* Comportamiento */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Comportamiento</Label>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Crear:</span>
              <span className="font-medium">Wizard</span>
            </div>
            <div className="flex justify-between">
              <span>Ver:</span>
              <span className="font-medium">Sections</span>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Etiquetas</Label>
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Anterior</Label>
              <Input
                value={config.labels?.prev || 'Anterior'}
                onChange={(e) => updateConfig({ labels: { ...config.labels, prev: e.target.value } })}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Siguiente</Label>
              <Input
                value={config.labels?.next || 'Siguiente'}
                onChange={(e) => updateConfig({ labels: { ...config.labels, next: e.target.value } })}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Finalizar</Label>
              <Input
                value={config.labels?.finish || 'Finalizar'}
                onChange={(e) => updateConfig({ labels: { ...config.labels, finish: e.target.value } })}
                className="mt-1 h-8 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmMoveFieldModal
        isOpen={!!moveModal}
        fieldLabel={moveModal?.fieldLabel || ''}
        fromPage={config.pages.find(p => p.id === moveModal?.fromPageId)?.title || ''}
        toPage={config.pages.find(p => p.id === moveModal?.toPageId)?.title || ''}
        onConfirm={handleConfirmMove}
        onCancel={() => setMoveModal(null)}
      />
    </>
  );
}
