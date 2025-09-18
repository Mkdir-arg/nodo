'use client';

import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { flowsApi } from '@/lib/api/flows';
import type { Flow } from '@/lib/flows/types';

interface ExecuteFlowButtonProps {
  flow: Flow;
  onExecutionComplete?: (result: any) => void;
}

export default function ExecuteFlowButton({ flow, onExecutionComplete }: ExecuteFlowButtonProps) {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    if (flow.steps.length === 0) {
      alert('El flujo debe tener al menos un paso para ejecutarse');
      return;
    }

    setIsExecuting(true);
    try {
      const result = await flowsApi.executeFlow(flow.id);
      onExecutionComplete?.(result);
      
      if (result.status === 'completed') {
        alert('Flujo ejecutado exitosamente');
      } else if (result.status === 'failed') {
        alert(`Error en la ejecución: ${result.error_message}`);
      }
    } catch (error) {
      alert('Error al ejecutar el flujo');
      console.error('Execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Button 
      onClick={handleExecute} 
      disabled={isExecuting || flow.steps.length === 0}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isExecuting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      {isExecuting ? 'Ejecutando...' : 'Ejecutar Flujo'}
    </Button>
  );
}