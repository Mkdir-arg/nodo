'use client';

import { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings, Trash2 } from 'lucide-react';

import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import { HeaderNodePreview } from './ui-nodes/HeaderNode/HeaderNode';
import PaginatorPreview from './ui-preview/PaginatorPreview';
import RelationPreview from './ui-preview/RelationPreview';
import type { FieldNode } from '@/lib/forms/types';

interface FieldCardProps {
  field: FieldNode;
  sectionId: string;
}

export default function FieldCard({ field, sectionId }: FieldCardProps) {
  const { selected, setSelected, resizeField, removeNode } = useBuilderStore();
  const isSelected = selected?.type === 'field' && selected?.id === field.id;
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startColSpan = useRef(0);
  const colSpan = field.colSpan || 6;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: {
      type: 'field',
      sectionId,
      index: field.order
    }
  });

  const baseStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // UI nodes
  if (field.kind === 'ui' && field.type === 'ui:header') {
    const uiColSpan = field.colSpan || 12;
    
    const handleResizeStart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startX.current = e.clientX;
      startColSpan.current = uiColSpan;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX.current;
        const columnWidth = 60;
        const deltaColumns = Math.round(deltaX / columnWidth);
        const newColSpan = Math.max(1, Math.min(12, startColSpan.current + deltaColumns));
        
        if (newColSpan !== uiColSpan) {
          resizeField(field.id, newColSpan);
        }
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    return (
      <div
        ref={setNodeRef}
        style={{ ...baseStyle, gridColumn: `span ${uiColSpan} / span ${uiColSpan}` }}
        className={`relative group ${isDragging ? 'opacity-50' : ''} ${isSelected ? 'ring-2 ring-sky-500' : ''}`}
        onClick={() => setSelected({ type: 'field', id: field.id })}
      >
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            {...attributes}
            {...listeners}
            className="p-2 bg-white hover:bg-gray-100 rounded shadow cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-gray-600" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              removeNode(field.id);
            }}
            className="p-2 bg-white hover:bg-red-100 rounded shadow"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-blue-500 transition-all z-10"
          onMouseDown={handleResizeStart}
          title="Arrastrar para redimensionar"
        />
        <HeaderNodePreview node={field as any} isSelected={isSelected} onClick={() => {}} />
      </div>
    );
  }

  if (field.kind === 'ui' && field.type === 'ui:paginator') {
    const { sections } = useBuilderStore.getState();
    const availableFields: Array<{ key: string; label?: string; type: string }> = [];
    sections.forEach(section => {
      const nodes = section.nodes || section.children || [];
      nodes.forEach((node: any) => {
        if (node.kind !== 'ui' && !node.type?.startsWith('ui:') && node.key) {
          availableFields.push({
            key: node.key,
            label: node.label || node.key,
            type: node.type || 'unknown'
          });
        }
      });
    });
    
    const uiColSpan = field.colSpan || 12;
    
    const handleResizeStart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startX.current = e.clientX;
      startColSpan.current = uiColSpan;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX.current;
        const columnWidth = 60;
        const deltaColumns = Math.round(deltaX / columnWidth);
        const newColSpan = Math.max(1, Math.min(12, startColSpan.current + deltaColumns));
        
        if (newColSpan !== uiColSpan) {
          resizeField(field.id, newColSpan);
        }
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    return (
      <div
        ref={setNodeRef}
        style={{ ...baseStyle, gridColumn: `span ${uiColSpan} / span ${uiColSpan}` }}
        className={`relative group ${isDragging ? 'opacity-50' : ''} ${isSelected ? 'ring-2 ring-sky-500' : ''}`}
        onClick={() => setSelected({ type: 'field', id: field.id })}
      >
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            {...attributes}
            {...listeners}
            className="p-2 bg-white hover:bg-gray-100 rounded shadow cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-gray-600" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              removeNode(field.id);
            }}
            className="p-2 bg-white hover:bg-red-100 rounded shadow"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-blue-500 transition-all z-10"
          onMouseDown={handleResizeStart}
          title="Arrastrar para redimensionar"
        />
        <PaginatorPreview node={field as any} availableFields={availableFields} />
      </div>
    );
  }

  if (field.kind === 'ui' && field.type === 'ui:relation') {
    const uiColSpan = field.colSpan || 12;
    
    const handleResizeStart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startX.current = e.clientX;
      startColSpan.current = uiColSpan;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX.current;
        const columnWidth = 60;
        const deltaColumns = Math.round(deltaX / columnWidth);
        const newColSpan = Math.max(1, Math.min(12, startColSpan.current + deltaColumns));
        
        if (newColSpan !== uiColSpan) {
          resizeField(field.id, newColSpan);
        }
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    return (
      <div
        ref={setNodeRef}
        style={{ ...baseStyle, gridColumn: `span ${uiColSpan} / span ${uiColSpan}` }}
        className={`relative group ${isDragging ? 'opacity-50' : ''} ${isSelected ? 'ring-2 ring-sky-500' : ''}`}
        onClick={() => setSelected({ type: 'field', id: field.id })}
      >
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            {...attributes}
            {...listeners}
            className="p-2 bg-white hover:bg-gray-100 rounded shadow cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-gray-600" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              removeNode(field.id);
            }}
            className="p-2 bg-white hover:bg-red-100 rounded shadow"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-blue-500 transition-all z-10"
          onMouseDown={handleResizeStart}
          title="Arrastrar para redimensionar"
        />
        <RelationPreview node={field as any} />
      </div>
    );
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startX.current = e.clientX;
    startColSpan.current = colSpan;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX.current;
      const columnWidth = 60;
      const deltaColumns = Math.round(deltaX / columnWidth);
      const newColSpan = Math.max(1, Math.min(12, startColSpan.current + deltaColumns));
      
      if (newColSpan !== colSpan) {
        resizeField(field.id, newColSpan);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleKeyResize = (e: React.KeyboardEvent) => {
    if (e.altKey) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        resizeField(field.id, Math.max(1, colSpan - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        resizeField(field.id, Math.min(12, colSpan + 1));
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...baseStyle, gridColumn: `span ${colSpan} / span ${colSpan}` }}
      className={`relative bg-gray-50 border-2 rounded-lg p-3 group cursor-pointer ${
        isDragging ? 'opacity-50' : ''
      } ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => setSelected({ type: 'field', id: field.id })}
      onKeyDown={handleKeyResize}
      tabIndex={0}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <button
              {...attributes}
              {...listeners}
              className="p-1 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="h-3 w-3 text-gray-400" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {field.label || field.type}
            </span>
          </div>
          
          <div className="text-xs text-gray-500 mb-2">
            {field.type} • key: {field.key}
          </div>
          
          <div className="text-xs">
            {field.type === 'text' && (
              <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900" placeholder="Texto..." disabled />
            )}
            {field.type === 'textarea' && (
              <textarea className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 resize-none" rows={3} placeholder="Escribe aquí..." disabled />
            )}
            {field.type === 'email' && (
              <input type="email" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900" placeholder="ejemplo@correo.com" disabled />
            )}
            {field.type === 'phone' && (
              <input type="tel" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900" placeholder="+54 9 11 1234-5678" disabled />
            )}
            {field.type === 'number' && (
              <input type="number" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900" placeholder="0" disabled />
            )}
            {field.type === 'date' && (
              <input type="date" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900" disabled />
            )}
            {field.type === 'time' && (
              <input type="time" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900" disabled />
            )}
            {field.type === 'slider' && (
              <div className="space-y-2">
                <input type="range" className="w-full" min="0" max="100" defaultValue="50" disabled />
                <div className="text-center text-xs text-gray-500">50</div>
              </div>
            )}
            {field.type === 'rating' && (
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
            )}
            {field.type === 'color' && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded border border-gray-300 bg-blue-500"></div>
                <input type="text" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900" placeholder="#3B82F6" disabled />
              </div>
            )}
            {field.type === 'currency' && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <input type="text" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900" placeholder="0.00" disabled />
              </div>
            )}
            {field.type === 'url' && (
              <input type="url" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900" placeholder="https://ejemplo.com" disabled />
            )}
            {field.type === 'password' && (
              <div className="space-y-1">
                <input type="password" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900" placeholder="••••••••" disabled />
                <div className="flex gap-1">
                  <div className="h-1 flex-1 bg-green-500 rounded"></div>
                  <div className="h-1 flex-1 bg-gray-200 rounded"></div>
                  <div className="h-1 flex-1 bg-gray-200 rounded"></div>
                </div>
              </div>
            )}
            {field.type === 'code' && (
              <div className="bg-gray-900 text-gray-100 p-2 rounded font-mono text-xs">
                <div className="flex gap-2">
                  <span className="text-gray-500">1</span>
                  <span>function example() {'{'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500">2</span>
                  <span className="pl-4">// code...</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500">3</span>
                  <span>{'}'}</span>
                </div>
              </div>
            )}
            {field.type === 'tags' && (
              <div className="flex flex-wrap gap-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs">Tag 1</span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs">Tag 2</span>
                <input type="text" className="flex-1 min-w-[60px] outline-none text-sm" placeholder="Agregar..." disabled />
              </div>
            )}
            {field.type === 'switch' && (
              <div className="flex items-center gap-2">
                <div className="w-11 h-6 bg-blue-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
                <span className="text-sm text-gray-600">Activado</span>
              </div>
            )}
            {(field.type === 'document' || field.type === 'file') && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center">
                <div className="text-gray-400 mb-1">📄</div>
                <div className="text-xs text-gray-500">Arrastra o haz clic</div>
              </div>
            )}
            {field.type === 'image' && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center">
                <div className="text-gray-400 mb-1">🖼️</div>
                <div className="text-xs text-gray-500">Subir imagen</div>
              </div>
            )}
            {field.type === 'cuit_razon_social' && (
              <div className="space-y-2">
                <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900" placeholder="CUIT: 20-12345678-9" disabled />
                <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900" placeholder="Razón Social" disabled />
              </div>
            )}
            {field.type === 'group' && (
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
                <div className="text-xs text-gray-500 mb-2">Grupo iterativo</div>
                <div className="space-y-1">
                  <div className="h-6 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"></div>
                  <div className="h-6 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"></div>
                </div>
                <button className="mt-2 text-xs text-blue-600 dark:text-blue-400">+ Agregar</button>
              </div>
            )}
            {(field.type === 'select' || field.type === 'dropdown' || field.type === 'select_with_filter') && (
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900" disabled>
                <option>Seleccionar...</option>
                {(field.options || []).slice(0, 3).map((opt: any, i: number) => (
                  <option key={i}>{opt.label || opt.value}</option>
                ))}
              </select>
            )}
            {field.type === 'multiselect' && (
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900">
                <div className="flex flex-wrap gap-1">
                  {(field.options || []).slice(0, 2).map((opt: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs">
                      {opt.label || opt.value}
                    </span>
                  ))}
                  {(field.options || []).length > 2 && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">
                      +{(field.options || []).length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}
            {field.type === 'radio' && (
              <div className="space-y-2">
                {(field.options || []).slice(0, 3).map((opt: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name={field.id} className="w-3 h-3" disabled />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{opt.label || opt.value}</span>
                  </div>
                ))}
                {(field.options || []).length > 3 && (
                  <span className="text-xs text-gray-500">+{(field.options || []).length - 3} más</span>
                )}
              </div>
            )}
            {field.type === 'checkbox' && (
              <div className="flex items-center gap-2 py-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" disabled />
                <span className="text-sm text-gray-600">Acepto los términos</span>
              </div>
            )}
            {field.type === 'info' && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">Texto informativo</p>
                </div>
              </div>
            )}
            {field.type === 'sum' && (
              <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                <span className="text-sm font-mono text-gray-700 dark:text-gray-300">Σ = 0</span>
                <span className="text-xs text-gray-500">(calculado)</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1">
          <button className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <Settings className="h-3 w-3 text-gray-400" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              removeNode(field.id);
            }}
            className="p-1 hover:bg-red-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Eliminar campo"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </button>
        </div>
      </div>

      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-blue-500 transition-all"
        onMouseDown={handleResizeStart}
        title="Arrastrar para redimensionar (Alt + ←/→)"
      />
    </div>
  );
}
