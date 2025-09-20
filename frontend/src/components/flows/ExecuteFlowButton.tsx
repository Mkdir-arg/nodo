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
    setIsExecuting(true);
    try {
      // Crear instancia real en DB
      const response = await fetch('http://localhost:8000/api/create-instance/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flow: flow.id,
          legajo_id: crypto.randomUUID()
        })
      });
      
      if (response.ok) {
        const instance = await response.json();
        console.log('Instance created in DB:', instance);
        window.location.href = `/flujos/runtime/${instance.id}`;
        return;
      }
    } catch (error) {
      console.error('Failed to create instance:', error);
    }
    
    // Fallback a mock
    const mockInstanceId = `mock-${Date.now()}`;
    window.location.href = `/flujos/runtime/${mockInstanceId}`;
    setIsExecuting(false);
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