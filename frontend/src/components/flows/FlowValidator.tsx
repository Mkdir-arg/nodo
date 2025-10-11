'use client';

import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { ConditionConfig, Flow } from '@/lib/flows/types';

interface FlowValidatorProps {
  flow: Flow;
}

export default function FlowValidator({ flow }: FlowValidatorProps) {
  const errors: string[] = [];
  const warnings: string[] = [];

  const getConditionTargets = (step: any): string[] => {
    if (step.type !== 'condition') return [];
    const config = (step.config || {}) as ConditionConfig;
    const branchTargets = (config.branches || [])
      .map((branch) => branch.nextStepId)
      .filter(Boolean) as string[];
    const fallback = config.fallbackNextStepId ? [config.fallbackNextStepId] : [];
    return [...branchTargets, ...fallback];
  };

  const conditionHasOutputs = (step: any) => getConditionTargets(step).length > 0;

  // Validate flow
  if (!flow?.name?.trim()) errors.push('El flujo debe tener un nombre');
  if (!flow?.steps || flow.steps.length === 0) errors.push('El flujo debe tener al menos un paso');

  // Validate StartNode
  const startNodes = (flow?.steps || []).filter(step => step.type === 'start');
  if (startNodes.length === 0) {
    errors.push('El flujo debe tener exactamente un nodo de inicio');
  } else if (startNodes.length > 1) {
    errors.push('El flujo no puede tener mÃ¡s de un nodo de inicio');
  } else {
    const startNode = startNodes[0];
    // Check if start node has outgoing connections
    const hasOutgoing =
      startNode.nextStepId !== undefined || getConditionTargets(startNode).length > 0;
    if (!hasOutgoing && (flow?.steps || []).length > 1) {
      warnings.push('El nodo de inicio deberÃ­a tener al menos una conexiÃ³n de salida');
    }
  }

  // Validate steps
  const stepMap = new Map((flow?.steps || []).map((step) => [step.id, step]));
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
          errors.push(`Paso "${step.name}": URL invÃ¡lida`);
        }
        break;
      case 'delay':
        if (!config.duration || config.duration <= 0) {
          errors.push(`Paso "${step.name}": DuraciÃ³n debe ser mayor a 0`);
        }
        break;
      case 'condition': {
        const condConfig = (config || {}) as ConditionConfig;
        const branches = Array.isArray(condConfig.branches) ? condConfig.branches : [];
        if (branches.length === 0) {
          errors.push(`Paso "${step.name}": Debe tener al menos una ruta configurada`);
        }

        // Check for duplicate branch IDs
        const branchIds = branches.map(b => b.id).filter(Boolean);
        const duplicateIds = branchIds.filter((id, idx) => branchIds.indexOf(id) !== idx);
        if (duplicateIds.length > 0) {
          errors.push(`Paso "${step.name}": IDs de rama duplicados: ${duplicateIds.join(', ')}`);
        }

        branches.forEach((branch, idx) => {
          if (!branch) return;
          const rules = Array.isArray(branch.rules) ? branch.rules : [];

          if (!branch.nextStepId) {
            errors.push(`Paso "${step.name}": La ruta "${branch.label || `Ruta ${idx + 1}`}" debe seleccionar un paso destino`);
          } else if (!stepMap.has(branch.nextStepId)) {
            warnings.push(`Paso "${step.name}": La ruta "${branch.label || `Ruta ${idx + 1}`}" apunta a un paso inexistente`);
          }

          if (rules.length === 0) {
            warnings.push(`Paso "${step.name}": La ruta "${branch.label || `Ruta ${idx + 1}`}" no tiene condiciones definidas`);
          }

          // Validate branch logic
          if (branch.logic && !['AND', 'OR'].includes(branch.logic)) {
            errors.push(`Paso "${step.name}": Lógica de rama inválida: ${branch.logic}`);
          }

          rules.forEach((rule, ruleIdx) => {
            if (!rule.source) {
              errors.push(`Paso "${step.name}", Ruta ${idx + 1}, Regla ${ruleIdx + 1}: Falta fuente (form/evaluation)`);
            }

            if (!rule.field) {
              warnings.push(`Paso "${step.name}", Ruta ${idx + 1}, Regla ${ruleIdx + 1}: No tiene campo seleccionado`);
            }

            if (!rule.operator) {
              warnings.push(`Paso "${step.name}", Ruta ${idx + 1}, Regla ${ruleIdx + 1}: No tiene operador seleccionado`);
            } else if (!['equals', 'not_equals', '>', '<', '>=', '<=', 'contains'].includes(rule.operator)) {
              errors.push(`Paso "${step.name}", Ruta ${idx + 1}, Regla ${ruleIdx + 1}: Operador inválido: ${rule.operator}`);
            }

            if (rule.value === undefined || rule.value === '') {
              warnings.push(`Paso "${step.name}", Ruta ${idx + 1}, Regla ${ruleIdx + 1}: Valor de comparación vacío`);
            }
          });
        });

        if (condConfig.fallbackNextStepId && !stepMap.has(condConfig.fallbackNextStepId)) {
          warnings.push(`Paso "${step.name}": La ruta alternativa apunta a un paso inexistente`);
        }

        if (!conditionHasOutputs(step)) {
          warnings.push(`Paso "${step.name}": Configura al menos una ruta o alternativa`);
        }
        break;
      }
    }
  });

  // Check for cycles using DFS
  const detectCycles = () => {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    
    const hasCycle = (stepId: string): boolean => {
      if (recStack.has(stepId)) return true;
      if (visited.has(stepId)) return false;
      
      visited.add(stepId);
      recStack.add(stepId);
      
      const step = stepMap.get(stepId);
      if (step) {
        const nextSteps = step.nextStepId ? [step.nextStepId] : [];
        const conditionTargets = getConditionTargets(step);
        
        for (const nextId of [...nextSteps, ...conditionTargets]) {
          if (hasCycle(nextId)) return true;
        }
      }
      
      recStack.delete(stepId);
      return false;
    };
    
    for (const step of (flow?.steps || [])) {
      if (!visited.has(step.id) && hasCycle(step.id)) {
        return step.id;
      }
    }
    return null;
  };
  
  const cycleStart = detectCycles();
  if (cycleStart) {
    errors.push(`Ciclo detectado en el flujo comenzando desde: ${stepMap.get(cycleStart)?.name || cycleStart}`);
  }

  // Check for duplicate step IDs
  const stepIds = (flow?.steps || []).map(s => s.id);
  const duplicateStepIds = stepIds.filter((id, idx) => stepIds.indexOf(id) !== idx);
  if (duplicateStepIds.length > 0) {
    errors.push(`IDs de paso duplicados: ${duplicateStepIds.join(', ')}`);
  }

  // Check for disconnected steps
  const connectedSteps = new Set<string>();
  const startNode = (flow?.steps || []).find(step => step.type === 'start');
  
  (flow?.steps || []).forEach(step => {
    if (step.nextStepId) connectedSteps.add(step.nextStepId);
    getConditionTargets(step).forEach(target => connectedSteps.add(target));
  });
  
  // All steps except start should be connected
  const orphanSteps = (flow?.steps || []).filter(step =>
    step.type !== 'start' && !connectedSteps.has(step.id)
  );
  
  if (orphanSteps.length > 0) {
    warnings.push(`${orphanSteps.length} paso(s) desconectado(s): ${orphanSteps.map(s => s.name).join(', ')}`);
  }



  // Check for steps without outgoing connections (potential dead ends)
  const stepsWithoutNext = (flow?.steps || []).filter(step => {
    if (step.type === 'start') return false;
    if (step.type === 'condition') return !conditionHasOutputs(step);
    return !step.nextStepId;
  });
  
  if (stepsWithoutNext.length > 1) {
    warnings.push(`MÃºltiples puntos finales detectados: ${stepsWithoutNext.map(s => s.name).join(', ')}`);
  }

  if (errors.length === 0 && warnings.length === 0) {
    return (
      <Card className="p-3 bg-green-50 border-green-200">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Flujo vÃ¡lido</span>
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
            {errors.map((error, i) => <li key={i}>â€¢ {error}</li>)}
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
            {warnings.map((warning, i) => <li key={i}>â€¢ {warning}</li>)}
          </ul>
        </div>
      )}
    </Card>
  );
}
