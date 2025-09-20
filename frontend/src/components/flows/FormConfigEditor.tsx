'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { FormConfig, FormField } from '@/lib/flows/types';

interface FormConfigEditorProps {
  config: FormConfig;
  onChange: (key: string, value: any) => void;
}

export function FormConfigEditor({ config, onChange }: FormConfigEditorProps) {
  const [fields, setFields] = useState<FormField[]>(config.fields || []);

  const addField = () => {
    const newField: FormField = {
      name: `campo_${fields.length + 1}`,
      label: `Campo ${fields.length + 1}`,
      type: 'text',
      required: false
    };
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    onChange('fields', updatedFields);
  };

  const updateField = (index: number, field: Partial<FormField>) => {
    const updatedFields = fields.map((f, i) => i === index ? { ...f, ...field } : f);
    setFields(updatedFields);
    onChange('fields', updatedFields);
  };

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    onChange('fields', updatedFields);
  };

  const addOption = (fieldIndex: number) => {
    const field = fields[fieldIndex];
    const options = field.options || [];
    const newOptions = [...options, { value: `opcion_${options.length + 1}`, label: `Opción ${options.length + 1}` }];
    updateField(fieldIndex, { options: newOptions });
  };

  const updateOption = (fieldIndex: number, optionIndex: number, key: 'value' | 'label', value: string) => {
    const field = fields[fieldIndex];
    const options = field.options || [];
    const updatedOptions = options.map((opt, i) => 
      i === optionIndex ? { ...opt, [key]: value } : opt
    );
    updateField(fieldIndex, { options: updatedOptions });
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = fields[fieldIndex];
    const options = field.options || [];
    const updatedOptions = options.filter((_, i) => i !== optionIndex);
    updateField(fieldIndex, { options: updatedOptions });
  };

  return (
    <div className="space-y-6">
      {/* Configuración básica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Título del Formulario</Label>
          <Input
            id="title"
            value={config.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Datos Personales"
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Input
            id="description"
            value={config.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Complete los siguientes campos"
          />
        </div>
      </div>

      {/* Campos del formulario */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">📋 Campos del Formulario</h4>
          <Button type="button" onClick={addField} variant="outline">
            + Agregar Campo
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, fieldIndex) => (
            <div key={fieldIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium">Campo {fieldIndex + 1}</h5>
                <Button 
                  type="button" 
                  onClick={() => removeField(fieldIndex)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Eliminar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={field.name}
                    onChange={(e) => updateField(fieldIndex, { name: e.target.value })}
                    placeholder="nombre_campo"
                  />
                </div>
                <div>
                  <Label>Etiqueta</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(fieldIndex, { label: e.target.value })}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(fieldIndex, { type: e.target.value as FormField['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="text">Texto</option>
                    <option value="email">Email</option>
                    <option value="number">Número</option>
                    <option value="date">Fecha</option>
                    <option value="select">Selección</option>
                    <option value="checkbox">Casilla</option>
                    <option value="textarea">Área de texto</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(fieldIndex, { required: e.target.checked })}
                    />
                    <span>Obligatorio</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <Label>Placeholder</Label>
                  <Input
                    value={field.placeholder || ''}
                    onChange={(e) => updateField(fieldIndex, { placeholder: e.target.value })}
                    placeholder="Ingrese su nombre"
                  />
                </div>
                <div>
                  <Label>Texto de ayuda</Label>
                  <Input
                    value={field.help_text || ''}
                    onChange={(e) => updateField(fieldIndex, { help_text: e.target.value })}
                    placeholder="Este campo es opcional"
                  />
                </div>
              </div>

              {/* Opciones para select */}
              {field.type === 'select' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Opciones</Label>
                    <Button 
                      type="button" 
                      onClick={() => addOption(fieldIndex)}
                      variant="outline"
                      size="sm"
                    >
                      + Opción
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(field.options || []).map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2">
                        <Input
                          placeholder="Valor"
                          value={option.value}
                          onChange={(e) => updateOption(fieldIndex, optionIndex, 'value', e.target.value)}
                        />
                        <Input
                          placeholder="Etiqueta"
                          value={option.label}
                          onChange={(e) => updateOption(fieldIndex, optionIndex, 'label', e.target.value)}
                        />
                        <Button
                          type="button"
                          onClick={() => removeOption(fieldIndex, optionIndex)}
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay campos configurados. Haga clic en "Agregar Campo" para comenzar.
          </div>
        )}
      </div>
    </div>
  );
}