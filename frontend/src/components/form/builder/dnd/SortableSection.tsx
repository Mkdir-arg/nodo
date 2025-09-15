'use client';
import { useMemo } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import SectionGridDesigner from '@/components/plantillas/SectionGridDesigner';
import SortableField from './SortableField';
import SectionEndDrop from './SectionEndDrop';

export default function SortableSection({
  id,
  section,
  dropId,
}: {
  id: string;
  section: any;
  dropId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: 'section' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const { selected, setSelected, updateSection, duplicateSection, removeSection } = useBuilderStore();
  const isSel = selected?.type === 'section' && selected.id === id;
  const nodes = section.nodes || section.children || [];
  const fieldIds = useMemo(() => nodes.map((n: any) => n.id), [nodes]);
  const layoutMode = section.layout_mode === 'grid' ? 'grid' : 'flow';

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border p-3 bg-white/50 dark:bg-slate-800/50 dark:border-slate-700 ${
        isSel ? 'ring-2 ring-sky-300' : ''
      }`}
      onClick={() => setSelected({ type: 'section', id })}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 mb-3 bg-slate-100 dark:bg-slate-700">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-2 py-1 border rounded text-xs cursor-grab dark:border-slate-700 dark:text-slate-200"
            {...attributes}
            {...listeners}
            onMouseDownCapture={(e) => e.stopPropagation()}
            onPointerDownCapture={(e) => e.stopPropagation()}
            title="Arrastrar sección"
          >
            ⠿
          </button>
          {isSel ? (
            <input
              className="border rounded px-2 py-1 dark:bg-slate-900 dark:border-slate-700"
              value={section.title || ''}
              onChange={(e) => updateSection(id, { title: e.target.value })}
            />
          ) : (
            <h3 className="font-semibold">{section.title || 'Sección'}</h3>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs flex items-center gap-1">
            <span>Disposición</span>
            <select
              className="border rounded px-2 py-1 text-xs dark:bg-slate-800 dark:border-slate-600"
              value={layoutMode}
              onChange={(e) => updateSection(id, { layout_mode: e.target.value as 'flow' | 'grid' })}
            >
              <option value="flow">Lista</option>
              <option value="grid">Grid</option>
            </select>
          </label>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              duplicateSection(id);
            }}
            className="text-xs px-2 py-1 border rounded dark:border-slate-700"
          >
            Duplicar
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('¿Eliminar sección?')) removeSection(id);
            }}
            className="text-xs px-2 py-1 border rounded text-red-600 dark:border-slate-700"
          >
            Eliminar
          </button>
        </div>
      </header>

      {layoutMode === 'grid' ? (
        <SectionGridDesigner
          section={{ ...section, nodes }}
          onUpdateNodes={(nextNodes) => updateSection(id, { nodes: nextNodes })}
        />
      ) : (
        <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 min-h-[12px]">
            {nodes.map((node: any) => (
              <SortableField key={node.id} node={node} sectionId={id} />
            ))}
            <SectionEndDrop id={dropId} sectionId={id} />
          </div>
        </SortableContext>
      )}
    </section>
  );
}
