'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { designTokens } from '@/lib/design/tokens';
import FlowCanvas from './FlowCanvas';
import StepForm from './StepForm';
import ExecuteFlowButton from './ExecuteFlowButton';
import FlowValidator from './FlowValidator';
import ExecutionHistory from './ExecutionHistory';
import StartTableModal from './StartTableModal';
import FlowMonitor from './FlowMonitor';
import { useFlowStore } from '@/lib/store/useFlowStore';
import { FLOW_TEMPLATES } from '@/lib/flows/templates';
import type { Flow, FlowStep, StartConfig, ActionType } from '@/lib/flows/types';

interface FlowEditorProps {
  flowId?: string;
  isNew?: boolean;
}

export default function FlowEditor({ flowId, isNew = false }: FlowEditorProps) {
  const router = useRouter();
  const { flows, currentFlow, setCurrentFlow, addFlow, updateFlow, addStep, updateStep, deleteStep } = useFlowStore();
  
  const [editingStep, setEditingStep] = useState<FlowStep | null>(null);
  const [showStepForm, setShowStepForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [flowData, setFlowData] = useState({
    name: '',
    description: '',
  });

  // Initialize flow data
  useEffect(() => {
    if (isNew) {
      setCurrentFlow(null);
      setFlowData({ name: '', description: '' });
    } else if (flowId) {
      const flow = flows?.find(f => f.id === flowId);
      if (flow) {
        setCurrentFlow(flow);
        setFlowData({ name: flow.name, description: flow.description || '' });
      }
    }
  }, [flowId, isNew, flows, setCurrentFlow]);

  const handleSave = async () => {
    if (!flowData.name.trim()) {
      alert('El nombre del flujo es requerido');
      return;
    }

    // Validate flow before saving
    if (!currentFlow?.steps || currentFlow.steps.length === 0) {
      alert('El flujo debe tener al menos un paso');
      return;
    }

    const hasStartNode = currentFlow.steps.some(step => step.type === 'start');
    if (!hasStartNode) {
      alert('El flujo debe tener un nodo de inicio');
      return;
    }

    // Validate step configurations
    const invalidSteps = currentFlow.steps.filter(step => {
      if (step.type === 'email') {
        const config = step.config as any;
        return !config.to || !config.subject;
      }
      if (step.type === 'http') {
        const config = step.config as any;
        return !config.url;
      }
      if (step.type === 'start') {
        const config = step.config as any;
        return !config.acceptedPlantillas || config.acceptedPlantillas.length === 0;
      }
      return false;
    });

    if (invalidSteps.length > 0) {
      alert(`Pasos con configuración incompleta: ${invalidSteps.map(s => s.name).join(', ')}`);
      return;
    }

    try {
      if (isNew) {
        const newFlow = await addFlow({
          name: flowData.name,
          description: flowData.description,
          steps: currentFlow.steps,
        });
        // Update currentFlow with real ID
        if (newFlow && typeof newFlow === 'object' && 'id' in newFlow) {
          setCurrentFlow({ ...currentFlow, id: newFlow.id as string });
        }
      } else if (flowId && currentFlow) {
        await updateFlow(flowId, {
          name: flowData.name,
          description: flowData.description,
          steps: currentFlow.steps,
        });
      }
      router.push('/flujos');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el flujo');
    }
  };

  const handleUseTemplate = (template: typeof FLOW_TEMPLATES[0]) => {
    setFlowData({ name: template.name, description: template.description || '' });
    const tempFlow: Flow = {
      id: 'temp',
      ...template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentFlow(tempFlow);
    setShowTemplates(false);
  };

  const handleCancel = () => {
    router.push('/flujos');
  };

  const handleAddStep = () => {
    setEditingStep(null);
    setShowStepForm(true);
  };

  const canAddStepType = (type: ActionType) => {
    if (type === 'start') {
      const hasStartNode = (currentFlow?.steps || []).some(step => step.type === 'start');
      return !hasStartNode;
    }
    return true;
  };

  const handleEditStep = (step: FlowStep) => {
    setEditingStep(step);
    setShowStepForm(true);
  };

  const handleStepSubmit = (stepData: FlowStep) => {
    try {
      // Validate StartNode uniqueness
      if (stepData.type === 'start' && !editingStep) {
        const hasStartNode = (currentFlow?.steps || []).some(step => step.type === 'start');
        if (hasStartNode) {
          alert('Solo puede haber un nodo de inicio por flujo');
          return;
        }
      }

      const targetFlowId = currentFlow?.id || 'temp';
      
      if (editingStep) {
        // Update existing step
        if (currentFlow) {
          const updatedSteps = currentFlow.steps.map(step => 
            step.id === editingStep.id ? { ...step, ...stepData } : step
          );
          setCurrentFlow({ ...currentFlow, steps: updatedSteps });
        }
      } else {
        // Add new step
        if (currentFlow) {
          // Add to existing flow and connect to previous step
          const updatedSteps = [...currentFlow.steps];
          
          // No auto-connection - users will connect manually with React Flow
          
          updatedSteps.push(stepData);
          setCurrentFlow({ ...currentFlow, steps: updatedSteps });
        } else {
          // Create new flow with first step
          const tempFlow: Flow = {
            id: 'temp',
            name: flowData.name || 'Nuevo Flujo',
            description: flowData.description,
            steps: [stepData],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setCurrentFlow(tempFlow);
        }
      }

      setShowStepForm(false);
      setEditingStep(null);
    } catch (error) {
      console.error('Error al agregar/actualizar paso:', error);
      alert('Error al procesar el paso. Inténtalo nuevamente.');
    }
  };

  const handleStepCancel = () => {
    setShowStepForm(false);
    setEditingStep(null);
  };

  const handleDeleteStep = (stepId: string) => {
    if (currentFlow) {
      const stepToDelete = currentFlow.steps.find(step => step.id === stepId);
      if (!stepToDelete) return;

      // Find step that points to the one being deleted
      const parentStep = currentFlow.steps.find(step => step.nextStepId === stepId);
      
      // Reconnect the flow: parent -> deleted.next
      if (parentStep && stepToDelete.nextStepId) {
        parentStep.nextStepId = stepToDelete.nextStepId;
      } else if (parentStep) {
        parentStep.nextStepId = undefined;
      }

      const updatedSteps = currentFlow.steps.filter(step => step.id !== stepId);
      setCurrentFlow({ ...currentFlow, steps: updatedSteps });
    }
  };

  const handleConnectSteps = (sourceId: string, targetId: string) => {
    if (currentFlow) {
      const updatedSteps = currentFlow.steps.map(step => 
        step.id === sourceId 
          ? { ...step, nextStepId: targetId }
          : step
      );
      setCurrentFlow({ ...currentFlow, steps: updatedSteps });
    }
  };

  const handleUpdatePositions = (updatedSteps: FlowStep[]) => {
    if (currentFlow) {
      const updatedFlow = {
        ...currentFlow,
        steps: updatedSteps
      };
      setCurrentFlow(updatedFlow);
    }
  };

  const handleStartFlow = () => {
    const startNode = (currentFlow?.steps || []).find(step => step.type === 'start');
    if (startNode && startNode.config) {
      setShowStartModal(true);
    } else {
      alert('Este flujo no tiene un nodo de inicio configurado');
    }
  };

  const getStartNodeConfig = (): StartConfig | null => {
    const startNode = (currentFlow?.steps || []).find(step => step.type === 'start');
    return startNode?.config as StartConfig || null;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? 'Nuevo Flujo' : 'Editar Flujo'}
        subtitle={isNew ? 'Crea un nuevo flujo de trabajo automatizado' : 'Modifica tu flujo existente'}
        onBack={handleCancel}
        actions={
          <>
            {currentFlow && !isNew && (
              <>
                <Button 
                  onClick={handleStartFlow}
                  variant="outline"
                  className={designTokens.button.success}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Flujo
                </Button>
                <ExecuteFlowButton flow={currentFlow} />
              </>
            )}
            <Button onClick={handleSave} className={designTokens.button.primary}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Flujo
            </Button>
          </>
        }
      />

      {/* Templates for new flows */}
      {isNew && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Plantillas</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              {showTemplates ? 'Ocultar' : 'Ver'} Plantillas
            </Button>
          </div>
          
          {showTemplates && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FLOW_TEMPLATES.map((template, index) => (
                <div key={index} className="p-3 border rounded cursor-pointer hover:bg-gray-50" onClick={() => handleUseTemplate(template)}>
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{template.steps.length} pasos</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Flow basic info */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nombre del Flujo</Label>
            <Input
              id="name"
              value={flowData.name}
              onChange={(e) => setFlowData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ingrese el nombre del flujo"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={flowData.description}
              onChange={(e) => setFlowData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del flujo"
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Flow validation */}
      {currentFlow && (
        <FlowValidator flow={currentFlow} />
      )}

      {/* Flow Designer */}
      <div className={designTokens.card.gradient}>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Diseñador de Flujo</h2>
                  <p className="text-sm text-gray-600">Arrastra y conecta pasos para crear tu flujo</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status="info">
                  {(currentFlow?.steps || []).length} pasos
                </StatusBadge>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 overflow-hidden">
              <FlowCanvas
                steps={currentFlow?.steps || []}
                onAddStep={handleAddStep}
                onEditStep={handleEditStep}
                onDeleteStep={handleDeleteStep}
                onConnectSteps={handleConnectSteps}
                onUpdatePositions={handleUpdatePositions}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Execution monitoring - only for existing flows */}
      {!isNew && flowId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"></div>
          <div className="space-y-4">
            <FlowMonitor flowSlug={flowId} />
            <ExecutionHistory flowId={flowId} />
          </div>
        </div>
      )}

      {/* Step form modal */}
      {showStepForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
              <h3 className="text-2xl font-bold text-white">
                {editingStep ? '✏️ Editar Paso' : '✨ Nuevo Paso'}
              </h3>
              <p className="text-blue-100 mt-1">
                {editingStep ? 'Modifica la configuración del paso' : 'Configura un nuevo paso en tu flujo'}
              </p>
            </div>
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              <StepForm
                step={editingStep || undefined}
                onSubmit={handleStepSubmit}
                onCancel={handleStepCancel}
                existingSteps={currentFlow?.steps || []}
              />
            </div>
          </div>
        </div>
      )}

      {/* Start Flow Modal */}
      {showStartModal && currentFlow && getStartNodeConfig() && (
        <StartTableModal
          isOpen={showStartModal}
          onClose={() => setShowStartModal(false)}
          flowSlug={currentFlow.id}
          startConfig={getStartNodeConfig()!}
        />
      )}
    </div>
  );
}