'use client';
import { DndContext, DragEndEvent, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import SortableSection from './dnd/SortableSection';
import FieldCard from './FieldCard';

const DROP_PREFIX = 'drop-'; // droppable vacío al final de cada sección

export default function Canvas() {
  const { sections, moveSection, moveField } = useBuilderStore();
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const [activeField, setActiveField] = useState<any>(null);

  const sectionIds = useMemo(() => sections.map((s: any) => s.id), [sections]);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeType = active.data.current?.type as 'section' | 'field' | undefined;
    const overId = String(over.id);
    if (activeType === 'section') {
      moveSection(String(active.id), overId);
    } else if (activeType === 'field') {
      // si over es "drop-<secId>", mover al final de esa sección
      if (overId.startsWith(DROP_PREFIX)) {
        const toSec = overId.replace(DROP_PREFIX, '');
        moveField(String(active.id), null, toSec);
      } else {
        // mover antes del campo "over"; si es otra sección, se detecta adentro de moveField
        moveField(String(active.id), overId);
      }
    }
    setActiveField(null);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners}
      onDragEnd={onDragEnd}
      onDragStart={(e)=>{ if(e.active.data.current?.type==='field'){ setActiveField(e.active.data.current?.node);} }}>
      <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-6">
          {sections.map((sec: any) => (
            <SortableSection key={sec.id} id={sec.id} section={sec} dropId={`${DROP_PREFIX}${sec.id}`} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeField ? (
          <div className="min-w-[280px] rounded-xl border bg-white p-3 shadow-lg">
            <FieldCard node={activeField} readonly />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
