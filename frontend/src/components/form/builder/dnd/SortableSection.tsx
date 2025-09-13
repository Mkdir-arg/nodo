'use client';
import { useMemo } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import SortableField from './SortableField';
import SectionEndDrop from './SectionEndDrop';

export default function SortableSection({ id, section, dropId }:{
  id:string; section:any; dropId:string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: 'section' },
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  const fieldIds = useMemo(() => (section.children || []).map((n:any) => n.id), [section.children]);
  const { selected, setSelected } = useBuilderStore();
  const isSel = selected?.type === 'section' && selected.id === id;

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border p-3 bg-white/50 ${isSel ? 'ring-2 ring-sky-300' : ''}`}
      onClick={() => setSelected({ type: 'section', id })}
    >
      <header className="flex items-center justify-between rounded-xl px-3 py-2 mb-3">
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 border rounded text-xs cursor-grab" {...attributes} {...listeners}>⠿</button>
          <h3 className="font-semibold">{section.title || 'Sección'}</h3>
        </div>
        {/* ... acciones de la sección ... */}
      </header>

      <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[12px]">
          {(section.children || []).map((node:any) => (
            <SortableField key={node.id} node={node} sectionId={id} />
          ))}
          {/* droppable al final */}
          <SectionEndDrop id={dropId} sectionId={id} />
        </div>
      </SortableContext>
    </section>
  );
}
