'use client';
import { useDroppable } from '@dnd-kit/core';

export default function SectionEndDrop({ id, sectionId }:{ id:string; sectionId:string }) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { sectionId } });
  return <div ref={setNodeRef} id={id} data-section-drop className={`h-3 ${isOver ? 'bg-sky-100' : ''}`} />;
}
