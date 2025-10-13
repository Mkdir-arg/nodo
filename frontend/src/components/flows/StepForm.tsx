'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { sanitizeHtml, sanitizeUrl, validateEmail } from '@/lib/utils/sanitize';
import StartNodeProperties from './StartNodeProperties';
import { FormConfigEditor } from './FormConfigEditor';
import { EvaluationConfigEditor } from './EvaluationConfigEditor';
import { ConditionConfigEditor } from './ConditionConfigEditor';
import type {
  FlowStep,
  ActionType,
  StartConfig,
  FormConfig,
  FormField,
  EvaluationConfig,
  EvaluationQuestion,
  ConditionConfig,
} from '@/lib/flows/types';
import { ACTION_TYPES } from '@/lib/flows/types';

interface StepFormProps {
  step?: FlowStep;
  onSubmit: (step: FlowStep) => void;
  onCancel: () => void;
  existingSteps?: FlowStep[];
}

export default function StepForm({ step, onSubmit, onCancel, existingSteps = [] }: StepFormProps) {
  const createConditionId = () =>
    (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `branch_${Math.random().toString(36).slice(2, 9)}`);

  const ensureConditionConfigShape = (cfg?: ConditionConfig): ConditionConfig => {
    const base = cfg || { branches: [], fallbackNextStepId: undefined };
    return {
      branches: Array.isArray(base.branches)
        ? base.branches.map((branch, index) => ({
            id: branch?.id || createConditionId(),
            label: branch?.label || `Ruta ${index + 1}`,
            logic: branch?.logic === 'OR' ? 'OR' : 'AND',
            rules: Array.isArray(branch?.rules) ? branch.rules : [],
            nextStepId: branch?.nextStepId,
          }))
        : [],
      fallbackNextStepId: base.fallbackNextStepId,
    };
  };

  const [formData, setFormData] = useState({
    name: step?.name || '',
    type: step?.type || 'email' as ActionType,
    config: step?.config || {},
  });

  const selectedActionType = ACTION_TYPES.find(t => t.value === formData.type) || ACTION_TYPES[0];

  const buildDefaultConfig = (type: ActionType) => {
    switch (type) {
      case 'condition':
        return ensureConditionConfigShape();
      default:
        return {};
    }
  };

  useEffect(() => {
    if (formData.type === 'condition') {
      const normalized = ensureConditionConfigShape(formData.config as ConditionConfig);
      if (JSON.stringify(normalized) !== JSON.stringify(formData.config)) {
        setFormData(prev => ({
          ...prev,
          config: normalized,
        }));
      }
    }
  }, [formData.type, formData.config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate better position for new steps
    const generatePosition = () => {
      if (step?.position) return step.position;
      
      const steps = existingSteps || [];
      const stepCount = steps.length;
      
      if (formData.type === 'start') {
        return { x: 100, y: 100 };
      }
      
      // Position steps in a flow pattern
      return {
        x: 100 + (stepCount * 200),
        y: 100 + (stepCount % 2 === 0 ? 0 : 150)
      };
    };

    const configToSave =
      formData.type === 'condition'
        ? ensureConditionConfigShape(formData.config as ConditionConfig)
        : formData.config;

    const stepData: FlowStep = {
      id: step?.id || `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name || `${selectedActionType.label} ${Date.now()}`,
      type: formData.type,
      config: configToSave,
      position: generatePosition(),
      nextStepId: step?.nextStepId,
    };

    onSubmit(stepData);
  };

  const updateConfig = (key: string, value: any) => {
    // Sanitize input based on field type
    let sanitizedValue = value;
    
    if (typeof value === 'string') {
      if (key === 'url') {
        try {
          sanitizedValue = sanitizeUrl(value);
        } catch {
          // Keep original value for validation feedback
          sanitizedValue = value;
        }
      } else if (key === 'to' && !validateEmail(value) && value.length > 0) {
        // Keep original for validation feedback
        sanitizedValue = value;
      } else {
        sanitizedValue = sanitizeHtml(value);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [key]: sanitizedValue }
    }));
  };

  const renderConfigFields = () => {
    switch (formData.type) {
      case 'start':
        return (
          <StartNodeProperties
            config={formData.config as StartConfig}
            onSave={(config) => {
              setFormData(prev => ({ ...prev, config }));
            }}
            onCancel={() => {}}
            embedded={true}
          />
        );

      case 'email':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="to" className="text-sm font-medium text-gray-700">Destinatario</Label>
              <Input
                id="to"
                value={formData.config.to || ''}
                onChange={(e) => updateConfig('to', e.target.value)}
                placeholder="usuario@ejemplo.com"
                className={`px-4 py-3 rounded-lg ${formData.config.to && !validateEmail(formData.config.to) ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                required
              />
              {formData.config.to && !validateEmail(formData.config.to) && (
                <p className="text-red-500 text-sm">Email inválido</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium text-gray-700">Asunto</Label>
              <Input
                id="subject"
                value={formData.config.subject || ''}
                onChange={(e) => updateConfig('subject', e.target.value)}
                placeholder="Asunto del correo"
                className="px-4 py-3 rounded-lg border-gray-200"
                required
              />
            </div>
            <div className="lg:col-span-2 space-y-2">
              <Label htmlFor="body" className="text-sm font-medium text-gray-700">Mensaje</Label>
              <Textarea
                id="body"
                value={formData.config.body || ''}
                onChange={(e) => updateConfig('body', e.target.value)}
                placeholder="Contenido del correo"
                rows={4}
                className="px-4 py-3 rounded-lg border-gray-200"
                required
              />
            </div>
          </div>
        );

      case 'condition':
        return (
          <ConditionConfigEditor
            config={ensureConditionConfigShape(formData.config as ConditionConfig)}
            onChange={(cfg) =>
              setFormData((prev) => ({
                ...prev,
                config: ensureConditionConfigShape(cfg),
              }))
            }
            steps={existingSteps}
            currentStepId={step?.id}
          />
        );

      case 'form':
        return <FormConfigEditor config={formData.config as FormConfig} onChange={updateConfig} />;

      case 'evaluation':
        return <EvaluationConfigEditor config={formData.config as EvaluationConfig} onChange={updateConfig} />;

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-semibold text-gray-700">Tipo de Acción</Label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => {
              const newType = e.target.value as ActionType;
              setFormData(prev => ({
                ...prev,
                type: newType,
                config: newType === prev.type ? prev.config : buildDefaultConfig(newType),
              }));
            }}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {ACTION_TYPES.map((type) => {
              const isStartDisabled = type.value === 'start' && 
                !step && 
                existingSteps.some(s => s.type === 'start');
              
              return (
                <option 
                  key={type.value} 
                  value={type.value}
                  disabled={isStartDisabled}
                >
                  {type.label} {isStartDisabled ? '(Ya existe)' : ''}
                </option>
              );
            })}
          </select>
          {selectedActionType && (
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">{selectedActionType.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Nombre del Paso</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder={`${selectedActionType?.label} ${Date.now()}`}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Configuration Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          ⚙️ Configuración
        </h4>
        {renderConfigFields()}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t border-gray-200">
        <Button 
          type="submit"
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg transition-all"
        >
          {step ? '✅ Actualizar Paso' : '🚀 Crear Paso'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold transition-all"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}