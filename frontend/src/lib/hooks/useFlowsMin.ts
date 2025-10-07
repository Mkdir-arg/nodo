import { useQuery } from '@tanstack/react-query';
import { flowsApi } from '@/lib/api/flows';

export const FLOWS_QUERY_KEY = ['flows', 'list', 'min'] as const;

export function useFlowsMin() {
  return useQuery({
    queryKey: FLOWS_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await flowsApi.getFlows();
        return (res?.results ?? []).map((f: any) => ({
          id: f.id,
          name: f.name,
          slug: f.slug,
          description: f.description,
          steps: Array.isArray(f.steps) ? f.steps : [],
        }));
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('useFlowsMin: fallo de fetch, devolviendo []', e);
        }
        return [];
      }
    },
    staleTime: Infinity, // Nunca se considera stale
    gcTime: Infinity, // Nunca se elimina del cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    retry: false, // No reintentar en caso de error
  });
}
