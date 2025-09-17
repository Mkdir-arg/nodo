'use client';

import { useEffect } from 'react';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import Builder from './Builder';

export default function BuilderWrapper() {
  const { sections, addSection } = useBuilderStore();

  useEffect(() => {
    // Asegurar que hay al menos una sección
    if (!sections || sections.length === 0) {
      addSection();
    }
  }, [sections, addSection]);

  return <Builder />;
}