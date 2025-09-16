'use client';

import { useBuilderStore } from '@/lib/store/useBuilderStore';
import { Section } from './Section';

export function Canvas() {
  const { nodes, addSection } = useBuilderStore();
  
  const sections = nodes
    .filter(n => n.kind === 'section')
    .sort((a, b) => a.order - b.order);

  return (
    <div className="p-6 space-y-6">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => addSection()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Agregar Sección
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}