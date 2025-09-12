'use client';
import { useTemplateStore } from '@/store/useTemplateStore';

export default function Canvas() {
  const { nodes } = useTemplateStore();
  return (
    <div className="flex-1 border-dashed border-2 p-4 min-h-[400px]">
      {nodes.map(n => (
        <div key={n.id} className="p-2 border mb-2">{n.label || n.type}</div>
      ))}
    </div>
  );
}
