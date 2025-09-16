'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings, Copy, Trash2 } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useBuilderStore } from '@/lib/store/useBuilderStore';
import type { FieldNode } from '@/lib/forms/types';

interface FieldCardProps {
  field: FieldNode;
}

export default function FieldCard({ field }: FieldCardProps) {
  const { resizeField, markDirty } = useBuilderStore();
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startColSpanRef = useRef(field.colSpan);

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
      sectionId: field.parentId,
      index: field.order,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Handle resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startXRef.current;
      const containerWidth = resizeRef.current?.parentElement?.offsetWidth || 1200;
      const columnWidth = containerWidth / 12;
      const deltaColumns = Math.round(deltaX / columnWidth);
      const newColSpan = Math.min(Math.max(startColSpanRef.current + deltaColumns, 1), 12);
      
      if (newColSpan !== field.colSpan) {
        resizeField(field.id, newColSpan);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      markDirty();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, field.colSpan, field.id, resizeField, markDirty]);

  // Keyboard resize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!resizeRef.current?.contains(document.activeElement)) return;
      
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const delta = e.key === 'ArrowLeft' ? -1 : 1;
        const newColSpan = Math.min(Math.max(field.colSpan + delta, 1), 12);
        resizeField(field.id, newColSpan);
        markDirty();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [field.colSpan, field.id, resizeField, markDirty]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startColSpanRef.current = field.colSpan;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`col-span-${field.colSpan} relative bg-white border rounded-lg p-3 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
        <span className="text-xs text-gray-500 uppercase">{field.type}</span>
        <div className="ml-auto flex gap-1">
          <button className="p-1 hover:bg-gray-100 rounded">
            <Settings className="w-3 h-3 text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Copy className="w-3 h-3 text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="font-medium text-sm">
          {field.props?.label || `Campo ${field.type}`}
        </div>
        <div className="text-xs text-gray-500">
          Tamaño: {field.colSpan}/12 columnas
        </div>
      </div>

      {/* Resize handle */}
      <div
        ref={resizeRef}
        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-200 opacity-0 hover:opacity-100"
        onMouseDown={handleResizeStart}
        title="Arrastrar para redimensionar (Alt+←/→ para teclado)"
      />
    </div>
  );
}