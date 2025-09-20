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
import type { FlowStep, ActionType, StartConfig, FormConfig, FormField, EvaluationConfig, EvaluationQuestion } from '@/lib/flows/types';
import { ACTION_TYPES } from '@/lib/flows/types';

interface StepFormProps {
  step?: FlowStep;
  onSubmit: (step: FlowStep) => void;
  onCancel: () => void;
  existingSteps?: FlowStep[];
}

export default function StepForm({ step, onSubmit, onCancel, existingSteps = [] }: StepFormProps) {
  const [formData, setFormData] = useState({
    name: step?.name || '',
    type: step?.type || 'email' as ActionType,
    config: step?.config || {},
  });

  const selectedActionType = ACTION_TYPES.find(t => t.value === formData.type) || ACTION_TYPES[0];

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

    const stepData: FlowStep = {
      id: step?.id || `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name || `${selectedActionType.label} ${Date.now()}`,
      type: formData.type,
      config: formData.config,
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

      case 'http':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-2">
                <Label htmlFor="url" className="text-sm font-medium text-gray-700">URL</Label>
                <Input
                  id="url"
                  value={formData.config.url || ''}
                  onChange={(e) => updateConfig('url', e.target.value)}
                  placeholder="https://api.ejemplo.com/endpoint"
                  className="px-4 py-3 rounded-lg border-gray-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method" className="text-sm font-medium text-gray-700">Método</Label>
                <select
                  id="method"
                  value={formData.config.method || 'GET'}
                  onChange={(e) => updateConfig('method', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="body" className="text-sm font-medium text-gray-700">Cuerpo (JSON)</Label>
              <Textarea
                id="body"
                value={formData.config.body || ''}
                onChange={(e) => updateConfig('body', e.target.value)}
                placeholder='{"key": "value"}'
                rows={3}
                className="px-4 py-3 rounded-lg border-gray-200 font-mono text-sm"
              />
            </div>
          </div>
        );

      case 'delay':
        return (
          <>
            <div>
              <Label htmlFor="duration">Duración</Label>
              <Input
                id="duration"
                type="number"
                value={formData.config.duration || ''}
                onChange={(e) => updateConfig('duration', parseInt(e.target.value))}
                placeholder="5"
                min="1"
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unidad</Label>
              <select
                id="unit"
                value={formData.config.unit || 'seconds'}
                onChange={(e) => updateConfig('unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="seconds">Segundos</option>
                <option value="minutes">Minutos</option>
                <option value="hours">Horas</option>
              </select>
            </div>
          </>
        );

      case 'condition':
        return (
          <div>
            <Label htmlFor="condition">Condición</Label>
            <Input
              id="condition"
              value={formData.config.condition || ''}
              onChange={(e) => updateConfig('condition', e.target.value)}
              placeholder="x > 5"
              required
            />
          </div>
        );

      case 'database':
        return (
          <>
            <div>
              <Label htmlFor="table">Tabla</Label>
              <Input
                id="table"
                value={formData.config.table || ''}
                onChange={(e) => updateConfig('table', e.target.value)}
                placeholder="usuarios"
                required
              />
            </div>
            <div>
              <Label htmlFor="operation">Operación</Label>
              <select
                id="operation"
                value={formData.config.operation || 'insert'}
                onChange={(e) => updateConfig('operation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="insert">Insertar</option>
                <option value="update">Actualizar</option>
                <option value="delete">Eliminar</option>
              </select>
            </div>
            <div>
              <Label htmlFor="data">Datos (JSON)</Label>
              <Textarea
                id="data"
                value={JSON.stringify(formData.config.data || {}, null, 2)}
                onChange={(e) => {
                  try {
                    updateConfig('data', JSON.parse(e.target.value));
                  } catch {
                    // Invalid JSON, keep as string for now
                  }
                }}
                placeholder='{"nombre": "Juan", "email": "juan@ejemplo.com"}'
                rows={3}
                required
              />
            </div>
          </>
        );

      case 'form':
        return <FormConfigEditor config={formData.config as FormConfig} onChange={updateConfig} />;

      case 'evaluation':
        return <EvaluationConfigEditor config={formData.config as EvaluationConfig} onChange={updateConfig} />;

      case 'transform':
        return (
          <>
            <div>
              <Label htmlFor="input">Entrada</Label>
              <Input
                id="input"
                value={formData.config.input || ''}
                onChange={(e) => updateConfig('input', e.target.value)}
                placeholder="variable_entrada"
                required
              />
            </div>
            <div>
              <Label htmlFor="transformation">Transformación</Label>
              <Input
                id="transformation"
                value={formData.config.transformation || ''}
                onChange={(e) => updateConfig('transformation', e.target.value)}
                placeholder="toUpperCase()"
                required
              />
            </div>
            <div>
              <Label htmlFor="output">Salida</Label>
              <Input
                id="output"
                value={formData.config.output || ''}
                onChange={(e) => updateConfig('output', e.target.value)}
                placeholder="variable_salida"
                required
              />
            </div>
          </>
        );

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
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              type: e.target.value as ActionType,
              config: {} // Reset config when changing type
            }))}
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