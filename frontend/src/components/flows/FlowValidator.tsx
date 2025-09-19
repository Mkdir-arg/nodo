'use client';

import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Flow } from '@/lib/flows/types';

interface FlowValidatorProps {
  flow: Flow;
}

export default function FlowValidator({ flow }: FlowValidatorProps) {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate flow
  if (!flow?.name?.trim()) errors.push('El flujo debe tener un nombre');
  if (!flow?.steps || flow.steps.length === 0) errors.push('El flujo debe tener al menos un paso');

  // Validate StartNode
  const startNodes = (flow?.steps || []).filter(step => step.type === 'start');
  if (startNodes.length === 0) {
    errors.push('El flujo debe tener exactamente un nodo de inicio');
  } else if (startNodes.length > 1) {
    errors.push('El flujo no puede tener más de un nodo de inicio');
  } else {
    const startNode = startNodes[0];
    // Check if start node has outgoing connections
    const hasOutgoing = startNode.nextStepId !== undefined;
    if (!hasOutgoing && (flow?.steps || []).length > 1) {
      warnings.push('El nodo de inicio debería tener al menos una conexión de salida');
    }
  }

  // Validate steps
  (flow?.steps || []).forEach((step, index) => {
    if (!step.name?.trim()) errors.push(`Paso ${index + 1}: Falta nombre`);
    
    const config = step.config || {};
    
    switch (step.type) {
      case 'email':
        if (!config.to) errors.push(`Paso "${step.name}": Falta destinatario`);
        if (!config.subject) warnings.push(`Paso "${step.name}": Falta asunto`);
        break;
      case 'http':
        if (!config.url) errors.push(`Paso "${step.name}": Falta URL`);
        try {
          if (config.url) new URL(config.url);
        } catch {
          errors.push(`Paso "${step.name}": URL inválida`);
        }
        break;
      case 'delay':
        if (!config.duration || config.duration <= 0) {
          errors.push(`Paso "${step.name}": Duración debe ser mayor a 0`);
        }
        break;
    }
  });

  // Check for disconnected steps
  const connectedSteps = new Set<string>();
  const startNode = (flow?.steps || []).find(step => step.type === 'start');
  
  (flow?.steps || []).forEach(step => {
    if (step.nextStepId) connectedSteps.add(step.nextStepId);
  });
  
  // All steps except start should be connected
  const orphanSteps = (flow?.steps || []).filter(step => 
    step.type !== 'start' && !connectedSteps.has(step.id)
  );
  
  if (orphanSteps.length > 0) {
    warnings.push(`${orphanSteps.length} paso(s) desconectado(s): ${orphanSteps.map(s => s.name).join(', ')}`);
  }



  // Check for steps without outgoing connections (potential dead ends)
  const stepsWithoutNext = (flow?.steps || []).filter(step => 
    !step.nextStepId && step.type !== 'start'
  );
  
  if (stepsWithoutNext.length > 1) {
    warnings.push(`Múltiples puntos finales detectados: ${stepsWithoutNext.map(s => s.name).join(', ')}`);
  }

  if (errors.length === 0 && warnings.length === 0) {
    return (
      <Card className="p-3 bg-green-50 border-green-200">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Flujo válido</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      {errors.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-2 text-red-700 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Errores</span>
          </div>
          <ul className="text-sm text-red-600 ml-6 space-y-1">
            {errors.map((error, i) => <li key={i}>• {error}</li>)}
          </ul>
        </div>
      )}
      
      {warnings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-yellow-700 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Advertencias</span>
          </div>
          <ul className="text-sm text-yellow-600 ml-6 space-y-1">
            {warnings.map((warning, i) => <li key={i}>• {warning}</li>)}
          </ul>
        </div>
      )}
    </Card>
  );
}