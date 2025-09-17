'use client';

import { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings } from 'lucide-react';

import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import type { FieldNode } from '@/lib/forms/types';

interface FieldCardProps {
  field: FieldNode;
  sectionId: string;
}

export default function FieldCard({ field, sectionId }: FieldCardProps) {
  const { selected, setSelected, resizeField } = useBuilderStore();
  const isSelected = selected?.type === 'field' && selected?.id === field.id;
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startColSpan = useRef(0);
  const colSpan = field.colSpan || 6; // Default a 6 columnas

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startX.current = e.clientX;
    startColSpan.current = colSpan;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX.current;
      const columnWidth = 60; // Aproximado
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
      style={style}
      className={`relative bg-gray-50 border-2 rounded-lg p-3 group cursor-pointer col-span-${colSpan} ${
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
          
          {/* Preview del campo */}
          <div className="text-xs">
            {field.type === 'text' && (
              <input className="w-full px-2 py-1 border rounded text-xs" placeholder="Texto..." disabled />
            )}
            {field.type === 'number' && (
              <input type="number" className="w-full px-2 py-1 border rounded text-xs" placeholder="0" disabled />
            )}
            {field.type === 'select' && (
              <select className="w-full px-2 py-1 border rounded text-xs" disabled>
                <option>Seleccionar...</option>
              </select>
            )}
          </div>
        </div>

        <button className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          <Settings className="h-3 w-3 text-gray-400" />
        </button>
      </div>

      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-blue-500 transition-all"
        onMouseDown={handleResizeStart}
        title="Arrastrar para redimensionar (Alt + ←/→)"
      />
    </div>
  );
}