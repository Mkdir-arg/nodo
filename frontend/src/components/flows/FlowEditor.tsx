'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { FLOWS_QUERY_KEY } from '@/lib/hooks/useFlowsMin';
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
  const queryClient = useQueryClient();
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
        await addFlow({
          name: flowData.name,
          description: flowData.description,
          steps: currentFlow.steps,
        });
      } else if (flowId && currentFlow) {
        await updateFlow(flowId, {
          name: flowData.name,
          description: flowData.description,
          steps: currentFlow.steps,
        });
      }
      
      // Invalidate flows query to update the sidebar menu
      queryClient.invalidateQueries({ queryKey: FLOWS_QUERY_KEY });
      
      // Navigate back to flows list
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
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-700 dark:via-purple-700 dark:to-indigo-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isNew ? '🚀 Crear Nuevo Flujo' : '✏️ Editar Flujo'}
              </h1>
              <p className="text-blue-100 text-lg">
                {isNew 
                  ? 'Diseña un flujo de trabajo automatizado paso a paso' 
                  : 'Modifica y optimiza tu flujo existente'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancelar
            </Button>
            {currentFlow && !isNew && (
              <Button 
                onClick={handleStartFlow}
                className="bg-green-500 hover:bg-green-600 text-white border-0"
              >
                <Play className="h-4 w-4 mr-2" />
                Ejecutar
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Flujo
            </Button>
          </div>
        </div>
      </div>

      {/* Templates for new flows */}
      {isNew && (
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800 shadow-lg dark:shadow-gray-900/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">🛠️ Plantillas Predefinidas</h2>
                <p className="text-gray-600 text-sm">Comienza rápido con flujos preconfigurados</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowTemplates(!showTemplates)}
              className="bg-white/80 border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              {showTemplates ? '🔼 Ocultar' : '🔽 Ver'} Plantillas
            </Button>
          </div>
          
          {showTemplates && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {FLOW_TEMPLATES.map((template, index) => (
                <div 
                  key={index} 
                  className="group p-4 bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-700 rounded-xl cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
                  onClick={() => handleUseTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      {template.name}
                    </h4>
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-medium">
                      {template.steps.length} pasos
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-600 font-medium">✨ Usar plantilla</span>
                    <svg className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Flow Configuration */}
      <Card className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-0 shadow-lg dark:shadow-gray-900/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">📝 Configuración Básica</h2>
            <p className="text-gray-600">Define el nombre y descripción de tu flujo</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              🏷️ Nombre del Flujo
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={flowData.name}
              onChange={(e) => setFlowData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Proceso de Onboarding, Seguimiento de Leads..."
              className="h-12 text-base border-2 focus:border-blue-500 transition-colors"
              required
            />
            <p className="text-xs text-gray-500">Elige un nombre descriptivo y único</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              📝 Descripción
              <span className="text-gray-400 text-xs">(opcional)</span>
            </Label>
            <Textarea
              id="description"
              value={flowData.description}
              onChange={(e) => setFlowData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe qué hace este flujo y cuándo se ejecuta..."
              className="min-h-[100px] text-base border-2 focus:border-blue-500 transition-colors resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500">Ayuda a otros usuarios a entender el propósito</p>
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