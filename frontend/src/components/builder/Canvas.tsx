'use client';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';

export default function Canvas() {
  const sections = useBuilderStore(s => s.sections);
  return (
    <div>
      {sections.map(sec => (
        <div key={sec.id} className="mb-4">
          {sec.children.map(n => (
            <div key={n.id} className="p-2 border mb-2">{n.label || n.type}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
