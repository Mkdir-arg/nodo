import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flowsApi } from '@/lib/api/flows';

export function useFlow(slug: string) {
  return useQuery({
    queryKey: ['flow', slug],
    queryFn: () => flowsApi.getFlow(slug),
    enabled: !!slug,
  });
}

export function useFlowCandidates(slug: string, params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['flow-candidates', slug, params],
    queryFn: () => flowsApi.getFlowCandidates(slug, params),
    enabled: !!slug,
  });
}

export function useStartFlow(slug: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { legajo_id: string; plantilla_id: string; context?: any }) =>
      flowsApi.startFlow(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow-instances', slug] });
    },
  });
}

export function useStartFlowBulk(slug: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { legajo_ids: string[]; plantilla_id: string; context?: any }) =>
      flowsApi.startFlowBulk(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow-instances', slug] });
    },
  });
}

export function useFlowInstances(slug: string, statusFilter?: string) {
  return useQuery({
    queryKey: ['flow-instances', slug, statusFilter],
    queryFn: () => flowsApi.getFlowInstances(slug, statusFilter),
    enabled: !!slug,
  });
}