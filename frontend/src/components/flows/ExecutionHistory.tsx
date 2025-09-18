'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { flowsApi } from '@/lib/api/flows';

interface ExecutionHistoryProps {
  flowId: string;
}

interface Execution {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  error_message?: string;
}

export default function ExecutionHistory({ flowId }: ExecutionHistoryProps) {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExecutions();
  }, [flowId]);

  const loadExecutions = async () => {
    try {
      const response = await flowsApi.getFlowExecutions(flowId);
      setExecutions(response);
    } catch (error) {
      console.error('Error loading executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: 'Pendiente',
      running: 'Ejecutando',
      completed: 'Completado',
      failed: 'Fallido',
      cancelled: 'Cancelado'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  if (loading) {
    return <div className="text-center py-4">Cargando historial...</div>;
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Historial de Ejecuciones</h3>
      
      {executions.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay ejecuciones registradas</p>
      ) : (
        <div className="space-y-2">
          {executions.map((execution) => (
            <div key={execution.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(execution.status)}
                <span className="text-sm">{getStatusText(execution.status)}</span>
              </div>
              
              <div className="text-xs text-gray-500">
                {new Date(execution.started_at).toLocaleString()}
                {execution.completed_at && (
                  <span className="ml-2">
                    ({Math.round((new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 1000)}s)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}