'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';

import { useBuilderStore } from '@/lib/store/useBuilderStore';
import FieldCard from './FieldCard';
import type { SectionNode } from '@/lib/forms/types';

interface SectionProps {
  section: SectionNode;
}

export default function Section({ section }: SectionProps) {
  const { nodes } = useBuilderStore();
  
  const fields = nodes
    .filter(n => n.kind === 'field' && n.parentId === section.id)
    .sort((a, b) => a.order - b.order);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    data: {
      type: 'section',
      index: section.order
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border-2 border-dashed border-gray-200 p-4 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <button
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>
        <h3 className="font-medium text-gray-900">{section.title}</h3>
      </div>

      <SortableContext 
        items={fields.map(f => f.id)} 
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-12 gap-3">
          {fields.map((field) => (
            <FieldCard 
              key={field.id} 
              field={field} 
              sectionId={section.id}
            />
          ))}
          
          {fields.length === 0 && (
            <div className="col-span-12 text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded">
              Arrastra campos aquí
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}