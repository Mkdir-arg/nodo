'use client';

import { DndContext, DragEndEvent, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { Canvas } from './Canvas';
import { useBuilderStore } from '@/lib/store/useBuilderStore';

export function Builder() {
  const { nodes, moveSection, moveFieldWithin, moveFieldAcross, markDirty } = useBuilderStore();
  
  const sections = nodes.filter(n => n.kind === 'section');
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as { type: 'section' | 'field'; sectionId?: string };
    const overData = over.data.current as { type: 'section' | 'field'; sectionId?: string; index?: number };

    if (activeData?.type === 'section' && overData?.type === 'section') {
      moveSection(active.id as string, overData.index!);
      markDirty();
      return;
    }

    if (activeData?.type === 'field') {
      const fieldId = active.id as string;
      const fromSectionId = activeData.sectionId!;
      const toSectionId = overData.sectionId!;
      const toIndex = overData.index!;

      if (fromSectionId === toSectionId) {
        moveFieldWithin(toSectionId, fieldId, toIndex);
      } else {
        moveFieldAcross(fromSectionId, toSectionId, fieldId, toIndex);
      }
      markDirty();
    }
  }

  return (
    <div className="h-full bg-gray-50">
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext 
          items={sections.map(s => s.id)} 
          strategy={verticalListSortingStrategy}
        >
          <Canvas />
        </SortableContext>
      </DndContext>
    </div>
  );
}