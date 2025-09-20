'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FieldDef } from '@/lib/legajos/schema';

interface FieldsEditorProps {
  fields: FieldDef[];
  onChange: (fields: FieldDef[]) => void;
}

export function FieldsEditor({ fields, onChange }: FieldsEditorProps) {
  const [localFields, setLocalFields] = useState<FieldDef[]>(fields);

  const addField = () => {
    const newField: FieldDef = {
      id: `fld_${Date.now()}`,
      key: `campo_${localFields.length + 1}`,
      type: 'text',
      label: `Campo ${localFields.length + 1}`,
      required: false,
      ui: { colSpan: 6 }
    };
    
    const updatedFields = [...localFields, newField];
    setLocalFields(updatedFields);
    onChange(updatedFields);
  };

  const updateField = (index: number, updates: Partial<FieldDef>) => {
    const updatedFields = localFields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    );
    setLocalFields(updatedFields);
    onChange(updatedFields);
  };

  const removeField = (index: number) => {
    const updatedFields = localFields.filter((_, i) => i !== index);
    setLocalFields(updatedFields);
    onChange(updatedFields);
  };

  const addOption = (fieldIndex: number) => {
    const field = localFields[fieldIndex];
    const options = field.options || [];
    const newOptions = [...options, { 
      value: `opcion_${options.length + 1}`, 
      label: `Opción ${options.length + 1}` 
    }];
    updateField(fieldIndex, { options: newOptions });
  };

  const updateOption = (fieldIndex: number, optionIndex: number, key: 'value' | 'label', value: string) => {
    const field = localFields[fieldIndex];
    const options = field.options || [];
    const updatedOptions = options.map((opt, i) => 
      i === optionIndex ? { ...opt, [key]: value } : opt
    );
    updateField(fieldIndex, { options: updatedOptions });
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = localFields[fieldIndex];
    const options = field.options || [];
    const updatedOptions = options.filter((_, i) => i !== optionIndex);
    updateField(fieldIndex, { options: updatedOptions });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">📋 Campos de la Plantilla</h3>
        <Button onClick={addField} variant="outline">
          + Agregar Campo
        </Button>
      </div>

      <div className="space-y-4">
        {localFields.map((field, fieldIndex) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Campo {fieldIndex + 1}</h4>
              <Button 
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
                <Label>Clave</Label>
                <Input
                  value={field.key}
                  onChange={(e) => updateField(fieldIndex, { key: e.target.value })}
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
                  onChange={(e) => updateField(fieldIndex, { type: e.target.value as FieldDef['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="text">Texto</option>
                  <option value="email">Email</option>
                  <option value="number">Número</option>
                  <option value="date">Fecha</option>
                  <option value="select">Selección</option>
                  <option value="multiselect">Selección múltiple</option>
                  <option value="boolean">Verdadero/Falso</option>
                  <option value="checkbox">Casilla</option>
                  <option value="textarea">Área de texto</option>
                  <option value="file">Archivo</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={field.required || false}
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
                  value={field.help || ''}
                  onChange={(e) => updateField(fieldIndex, { help: e.target.value })}
                  placeholder="Este campo es opcional"
                />
              </div>
            </div>

            {/* Opciones para select/multiselect */}
            {(field.type === 'select' || field.type === 'multiselect') && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Opciones</Label>
                  <Button 
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

            {/* Configuración UI */}
            <div className="mt-3">
              <Label>Ancho de columna (1-12)</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={field.ui?.colSpan || 6}
                onChange={(e) => updateField(fieldIndex, { 
                  ui: { ...field.ui, colSpan: parseInt(e.target.value) || 6 }
                })}
                className="w-20"
              />
            </div>
          </div>
        ))}
      </div>

      {localFields.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          No hay campos configurados. Haga clic en "Agregar Campo" para comenzar.
        </div>
      )}
    </div>
  );
}