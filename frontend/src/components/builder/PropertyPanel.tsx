'use client';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';

export default function PropertyPanel() {
  const selected = useBuilderStore(s => s.selected);
  const updateNode = useBuilderStore(s => s.updateNode);
  const sections = useBuilderStore(s => s.sections);
  const node = selected ? sections.flatMap(sec => sec.children).find(n => n.id === selected.id) : null;
  if (!node) return <div className="w-64 p-2">Selecciona un campo</div>;
  return (
    <div className="w-64 p-2">
      <input className="border w-full" value={node.label} onChange={e=>updateNode(node.id,{label:e.target.value})} />
    </div>
  );
}
