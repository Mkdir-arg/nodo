'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import FieldCard from '../FieldCard';

export default function SortableField({ node, sectionId }:{ node:any; sectionId:string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    data: { type: 'field', sectionId, node },
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };

  return (
    <div ref={setNodeRef} style={style}>
      <FieldCard node={node} dragHandle={{ attributes, listeners }} />
    </div>
  );
}
