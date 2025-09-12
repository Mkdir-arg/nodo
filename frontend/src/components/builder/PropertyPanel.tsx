'use client';
import { useTemplateStore } from '@/store/useTemplateStore';

export default function PropertyPanel() {
  const { selected, updateNode } = useTemplateStore();
  if (!selected) return <div className="w-64 p-2">Selecciona un campo</div>;
  return (
    <div className="w-64 p-2">
      <input className="border w-full" value={selected.label} onChange={e=>updateNode(selected.id,{label:e.target.value})} />
    </div>
  );
}
