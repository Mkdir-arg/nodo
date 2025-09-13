'use client';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import SortableSection from './dnd/SortableSection';
import FieldCard from './FieldCard';

const DROP_PREFIX = 'drop-';

export default function Canvas() {
  const { sections, moveSection, moveField, addSection } = useBuilderStore();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } })
  );

  const [activeField, setActiveField] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'section' | 'field' | null>(null);
  const sectionIds = useMemo(() => sections.map((s: any) => s.id), [sections]);

  const targetSectionFromOver = (over: any): string | null => {
    if (!over) return null;
    const id = String(over.id);
    const data = over.data?.current;
    if (data?.type === 'section') return String(over.id);
    if (data?.type === 'field') return data.sectionId || null;
    if (data?.type === 'section-drop') return data.sectionId || null;
    if (id.startsWith(DROP_PREFIX)) return id.replace(DROP_PREFIX, '');
    return null;
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) { setActiveField(null); return; }

    const activeType = active.data.current?.type as 'section' | 'field' | undefined;

    if (activeType === 'section') {
      const toSection = targetSectionFromOver(over);
      if (toSection) moveSection(String(active.id), toSection);
    } else if (activeType === 'field') {
      const overData = over.data.current;
      if (overData?.type === 'section-drop') {
        moveField(String(active.id), null, overData.sectionId);
      } else if (overData?.type === 'section') {
        moveField(String(active.id), null, String(over.id)); // al final de esa sección
      } else {
        moveField(String(active.id), String(over.id)); // antes del campo over
      }
    }
    setActiveField(null);
  };

  const collision = (args: any) => {
    if (activeType === 'section') {
      const filtered = args.droppableContainers.filter(
        (c: any) => c.id !== activeId && c.data?.current?.type === 'section'
      );
      return closestCorners({ ...args, droppableContainers: filtered });
    }
    return closestCorners(args);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      onDragEnd={(e) => {
        onDragEnd(e);
        setActiveId(null);
        setActiveType(null);
      }}
      onDragStart={(e) => {
        setActiveId(String(e.active.id));
        const type = e.active.data.current?.type as 'section' | 'field' | null;
        setActiveType(type);
        if (type === 'field') {
          setActiveField(e.active.data.current?.node);
        }
      }}
    >
      {/* Barra para crear secciones */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            addSection();
            // opcional: abrir modal de componentes automáticamente
            setTimeout(() => window.dispatchEvent(new Event('builder:open-components')), 0);
          }}
          className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
        >
          + Agregar sección
        </button>
      </div>

      <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-6">
          {sections.map((sec: any) => (
            <SortableSection key={sec.id} id={sec.id} section={sec} dropId={`${DROP_PREFIX}${sec.id}`} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeField ? (
          <div className="min-w-[280px] rounded-xl border bg-white p-3 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <FieldCard node={activeField} readonly />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
