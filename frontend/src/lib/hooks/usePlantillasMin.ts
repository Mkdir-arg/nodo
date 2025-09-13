import { useQuery } from '@tanstack/react-query';
import { PlantillasService } from '@/lib/services/plantillas';

export const PLANTILLAS_QUERY_KEY = ['plantillas', 'list', 'min'] as const;

export function usePlantillasMin() {
  return useQuery({
    queryKey: PLANTILLAS_QUERY_KEY,
    // Tolerante a errores: si falla, devuelve [] para no romper el menú
    queryFn: async () => {
      try {
        const res = await PlantillasService.fetchPlantillas({ page: 1, page_size: 100 });
        const items = Array.isArray(res?.results) ? res.results : [];
        return items.map((p: any) => ({
          id: p.id,
          nombre: p.nombre ?? 'Sin nombre',
          version: p.version,
          estado: p.estado,
        }));
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });
}
