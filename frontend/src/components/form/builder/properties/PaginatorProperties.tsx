'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import type { UIPaginatorNode, UIPaginatorConfig } from '../runtime/ui/paginator/types';

interface PaginatorPropertiesProps {
  node: UIPaginatorNode;
  onChange: (patch: Partial<UIPaginatorNode>) => void;
}

export default function PaginatorProperties({ node, onChange }: PaginatorPropertiesProps) {
  const config = node.config;

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
  };

  const removePage = (pageId: string) => {
    const page = config.pages.find(p => p.id === pageId);
    if (page?.fieldKeys?.length > 0) {
      if (!confirm('Esta página tiene campos asignados. ¿Desea eliminarla?')) return;
    }
    updateConfig({ pages: config.pages.filter(p => p.id !== pageId) });
  };

  return (
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
        <p className="text-xs text-gray-500 mt-2 italic">
          Asignación de campos disponible en la siguiente fase.
        </p>
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
  );
}
