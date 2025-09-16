'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPlantillaLayoutQueryOptions } from '@/lib/api/plantillas';
import { useBuilderStore } from '@/lib/store/useBuilderStore';
import { Builder } from './Builder';
import { BuilderHeader } from './BuilderHeader';

interface FormBuilderPageProps {
  plantillaId: string;
}

export function FormBuilderPage({ plantillaId }: FormBuilderPageProps) {
  const { loadFromFormLayout } = useBuilderStore();
  
  const { data: layoutData, isLoading, error } = useQuery(
    getPlantillaLayoutQueryOptions(plantillaId)
  );

  useEffect(() => {
    if (layoutData?.layout) {
      loadFromFormLayout(layoutData.layout);
    }
  }, [layoutData, loadFromFormLayout]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando layout...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error al cargar el layout</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <BuilderHeader plantillaId={plantillaId} />
      <div className="flex-1 overflow-hidden">
        <Builder />
      </div>
    </div>
  );
}