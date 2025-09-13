'use client';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
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
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 6 } })
  );

  const sectionIds = useMemo(() => sections.map((s: any) => s.id), [sections]);
  const [activeFieldNode, setActiveFieldNode] = useState<any>(null);

  const getTargetSectionId = (over: any): string | null => {
    if (!over) return null;
    const id = String(over.id);
    const data = over.data?.current;

    if (data?.type === 'section') return String(over.id);
    if (data?.type === 'field') return data.sectionId || null;
    if (data?.type === 'section-drop') return data.sectionId || null;
    if (id.startsWith(DROP_PREFIX)) return id.replace(DROP_PREFIX, '');
    return null;
  };

  const onDragStart = (e: DragStartEvent) => {
    const t = e.active.data.current?.type as string | undefined;
    if (t === 'field') setActiveFieldNode(e.active.data.current?.node || null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveFieldNode(null);
    if (!over) return;

    const activeType = active.data.current?.type as 'section' | 'field' | undefined;

    if (activeType === 'section') {
      const toSection = getTargetSectionId(over);
      if (toSection) moveSection(String(active.id), toSection);
      return;
    }

    if (activeType === 'field') {
      const overData = over.data.current;
      if (overData?.type === 'section-drop') {
        moveField(String(active.id), null, overData.sectionId);
      } else if (overData?.type === 'section') {
        moveField(String(active.id), null, String(over.id));
      } else {
        // over es otro campo → insertar antes de ese campo
        moveField(String(active.id), String(over.id));
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            addSection();
            // opcional: abrir modal de componentes automáticamente
            setTimeout(() => window.dispatchEvent(new Event('builder:open-components')), 0);
          }}
          className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50"
        >
          + Agregar sección
        </button>
      </div>

      <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-6 select-none">
          {sections.map((sec: any) => (
            <SortableSection key={sec.id} id={sec.id} section={sec} dropId={`${DROP_PREFIX}${sec.id}`} />
          ))}
        </div>
      </SortableContext>

      {activeFieldNode && (
        <DragOverlay>
          <FieldCard node={activeFieldNode} readonly />
        </DragOverlay>
      )}
    </DndContext>
  );
}

