'use client';
import { useDroppable } from '@dnd-kit/core';

export default function SectionEndDrop({ id, sectionId }: { id: string; sectionId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'section-drop', sectionId },
  });

  return (
    <div
      ref={setNodeRef}
      id={id}
      className={`h-3 rounded ${isOver ? 'bg-sky-200/60' : ''}`}
      aria-hidden
    />
  );
}
