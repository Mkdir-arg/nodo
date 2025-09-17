'use client';

import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import Section from './Section';

export default function Canvas() {
  const { sections } = useBuilderStore();

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