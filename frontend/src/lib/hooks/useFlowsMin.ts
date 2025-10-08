import { useQuery } from '@tanstack/react-query';
import { flowsApi } from '@/lib/api/flows';
import { buildQueryOptions } from '@/lib/queryDefaults';

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
    ...buildQueryOptions({
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 0,
    }),
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}
