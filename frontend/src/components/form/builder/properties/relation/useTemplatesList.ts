'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlantillasService } from '@/lib/services/plantillas';

export function useTemplatesList() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['plantillas', 'list-all'],
    queryFn: () => PlantillasService.fetchPlantillas({ page: 1, page_size: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const templates = useMemo(() => {
    const results = (data as any)?.results ?? [];
    if (!searchQuery) return results;
    
    const q = searchQuery.toLowerCase();
    return results.filter((t: any) => 
      t.nombre?.toLowerCase().includes(q) || 
      t.descripcion?.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  return {
    templates,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
  };
}
