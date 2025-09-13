'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import FieldCard from '../FieldCard';

export default function SortableField({ node, sectionId }:{ node:any; sectionId:string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    data: { type: 'field', sectionId, node },
  });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };

  const { setSelected, duplicateNode, removeNode } = useBuilderStore();

  const openProps = () => {
    window.dispatchEvent(new CustomEvent('builder:open-props', { detail: { id: node.id } }));
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border bg-white p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 border rounded text-xs cursor-grab"
            {...attributes}
            {...listeners}
            onMouseDownCapture={(e) => e.stopPropagation()}
            onPointerDownCapture={(e) => e.stopPropagation()}
            title="Arrastrar campo"
          >
            ⠿
          </button>
          <div onClick={() => setSelected({ type: 'field', id: node.id })}>
            <FieldCard node={node} readonly />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="text-xs px-2 py-1 border rounded" onClick={() => duplicateNode(node.id)}>Duplicar</button>
          <button className="text-xs px-2 py-1 border rounded" onClick={openProps}>Editar</button>
          <button className="text-xs px-2 py-1 border rounded text-red-600" onClick={() => removeNode(node.id)}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

