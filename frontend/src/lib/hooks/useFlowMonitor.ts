import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { flowsApi } from '@/lib/api/flows';

export function useFlowMonitor(flowSlug: string, enabled: boolean = true) {
  const [runningInstances, setRunningInstances] = useState<string[]>([]);

  const { data: instances, isLoading } = useQuery({
    queryKey: ['flow-instances', flowSlug],
    queryFn: () => flowsApi.getFlowInstances(flowSlug),
    enabled: enabled && !!flowSlug,
    refetchInterval: (data) => {
      // Refetch every 2 seconds if there are running instances
      const hasRunning = Array.isArray(data) && data.some((instance: any) => 
        ['pending', 'running'].includes(instance.status)
      );
      return hasRunning ? 2000 : false;
    },
  });

  useEffect(() => {
    if (instances) {
      const running = instances
        .filter((instance: any) => ['pending', 'running'].includes(instance.status))
        .map((instance: any) => instance.id);
      setRunningInstances(running);
    }
  }, [instances]);

  const getInstancesByStatus = (status: string) => {
    return instances?.filter((instance: any) => instance.status === status) || [];
  };

  const getLatestInstance = () => {
    return instances?.[0] || null;
  };

  return {
    instances: instances || [],
    runningInstances,
    isLoading,
    hasRunningInstances: runningInstances.length > 0,
    getInstancesByStatus,
    getLatestInstance,
    completedCount: getInstancesByStatus('completed').length,
    failedCount: getInstancesByStatus('failed').length,
    runningCount: runningInstances.length,
  };
}