import { useQuery } from '@tanstack/react-query';
import { PlantillasService } from '@/lib/services/plantillas';

export const PLANTILLAS_QUERY_KEY = ['plantillas','list','min'] as const;

export function usePlantillasMin() {
  return useQuery({
    queryKey: PLANTILLAS_QUERY_KEY,
    queryFn: async () => {
      const res = await PlantillasService.fetchPlantillas({ page: 1, page_size: 100 });
      // Mapea a lo mínimo necesario para el menú
      return (res.results || []).map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        version: p.version,
        estado: p.estado,
      }));
    },
    staleTime: 60_000,
  });
}
