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
  const { nodes, addField } = useBuilderStore();
  
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
      index: section.order,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <button
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
        <h3 className="font-medium text-lg">{section.title}</h3>
        <button
          onClick={() => addField(section.id, { type: 'text', colSpan: 6 })}
          className="ml-auto px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          + Campo
        </button>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <SortableContext items={fields.map(f => f.id)} strategy={rectSortingStrategy}>
          {fields.map((field) => (
            <FieldCard key={field.id} field={field} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}