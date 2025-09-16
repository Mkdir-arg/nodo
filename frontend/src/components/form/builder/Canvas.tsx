'use client';

import { useBuilderStore } from '@/lib/store/useBuilderStore';
import Section from './Section';

export default function Canvas() {
  const { nodes } = useBuilderStore();
  
  const sections = nodes
    .filter(n => n.kind === 'section')
    .sort((a, b) => a.order - b.order);

  return (
    <div className="p-6 space-y-4">
      {sections.map((section) => (
        <Section key={section.id} section={section} />
      ))}
      
      {sections.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No hay secciones. Agrega una sección para comenzar.</p>
        </div>
      )}
    </div>
  );
}