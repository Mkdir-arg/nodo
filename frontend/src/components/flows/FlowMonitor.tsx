'use client';

import { CheckCircle, XCircle, Clock, Loader2, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { designTokens } from '@/lib/design/tokens';
import { useFlowMonitor } from '@/lib/hooks/useFlowMonitor';

interface FlowMonitorProps {
  flowSlug: string;
}

export default function FlowMonitor({ flowSlug }: FlowMonitorProps) {
  const { 
    instances, 
    isLoading, 
    hasRunningInstances,
    completedCount,
    failedCount,
    runningCount,
    getLatestInstance 
  } = useFlowMonitor(flowSlug);

  const latestInstance = getLatestInstance();

  if (isLoading) {
    return (
      <Card className={`${designTokens.card.default} p-4`}>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-sm text-gray-600">Cargando estado...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <Card className={`${designTokens.card.elevated} p-4`}>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">Estado de Ejecuciones</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Loader2 className={`h-4 w-4 ${hasRunningInstances ? 'animate-spin text-blue-500' : 'text-gray-400'}`} />
              <span className="text-2xl font-bold text-blue-600">{runningCount}</span>
            </div>
            <p className="text-xs text-gray-600">Ejecutando</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{completedCount}</span>
            </div>
            <p className="text-xs text-gray-600">Completados</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-red-600">{failedCount}</span>
            </div>
            <p className="text-xs text-gray-600">Fallidos</p>
          </div>
        </div>
      </Card>

      {/* Latest Instance */}
      {latestInstance && (
        <Card className={`${designTokens.card.default} p-4`}>
          <h4 className="font-medium text-gray-900 mb-2">Última Ejecución</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Legajo:</span>
              <span className="text-sm font-mono">{latestInstance.legajo_id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Estado:</span>
              <div className="flex items-center gap-1">
                {latestInstance.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-500" />}
                {latestInstance.status === 'failed' && <XCircle className="h-3 w-3 text-red-500" />}
                {['pending', 'running'].includes(latestInstance.status) && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                <span className="text-sm capitalize">{latestInstance.status}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Iniciado:</span>
              <span className="text-sm">{new Date(latestInstance.started_at).toLocaleString()}</span>
            </div>
            {latestInstance.completed_at && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completado:</span>
                <span className="text-sm">{new Date(latestInstance.completed_at).toLocaleString()}</span>
              </div>
            )}
            {latestInstance.error_message && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-xs text-red-700">{latestInstance.error_message}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Recent Instances */}
      {instances.length > 0 && (
        <Card className={`${designTokens.card.default} p-4`}>
          <h4 className="font-medium text-gray-900 mb-3">Ejecuciones Recientes</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {instances.slice(0, 10).map((instance: any) => (
              <div key={instance.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                <div className="flex items-center gap-2">
                  {instance.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-500" />}
                  {instance.status === 'failed' && <XCircle className="h-3 w-3 text-red-500" />}
                  {['pending', 'running'].includes(instance.status) && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                  <span className="font-mono">{instance.legajo_id}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(instance.started_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}