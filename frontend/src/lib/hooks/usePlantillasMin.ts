import { useQuery } from '@tanstack/react-query';
import { PlantillasService } from '@/lib/services/plantillas';

export const PLANTILLAS_QUERY_KEY = ['plantillas', 'list', 'min'] as const;

export function usePlantillasMin() {
  return useQuery({
    queryKey: PLANTILLAS_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await PlantillasService.fetchPlantillas({ page: 1, page_size: 100 });
        return (res?.results ?? []).map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          version: p.version,
          estado: p.estado,
        }));
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn('usePlantillasMin: fallo de fetch, devolviendo []', e);
        }
        return [];
      }
    },
    staleTime: 60_000,
  });
}

