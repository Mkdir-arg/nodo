'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { RelationNodeConfig } from './types';

interface RelationNodeEditorProps {
  config: RelationNodeConfig;
  onChange: (config: RelationNodeConfig) => void;
}

export function RelationNodeEditor({ config, onChange }: RelationNodeEditorProps) {
  const [localConfig, setLocalConfig] = useState<RelationNodeConfig>(config);

  const handleChange = (updates: Partial<RelationNodeConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const handleArrayChange = (field: 'display_fields' | 'search_fields', value: string) => {
    const array = value.split(',').map(s => s.trim()).filter(Boolean);
    handleChange({ [field]: array });
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Configuración de Relación</h3>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={localConfig.title}
          onChange={(e) => handleChange({ title: e.target.value })}
          placeholder="Ej: Proyectos Asignados"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea
          id="description"
          value={localConfig.description || ''}
          onChange={(e) => handleChange({ description: e.target.value })}
          placeholder="Ej: Proyectos en los que participa el empleado"
          rows={2}
        />
      </div>

      {/* Relation Type */}
      <div className="space-y-2">
        <Label htmlFor="relation_type">Tipo de Relación</Label>
        <Input
          id="relation_type"
          value={localConfig.relation_type}
          onChange={(e) => handleChange({ relation_type: e.target.value })}
          placeholder="Ej: proyectos"
        />
        <p className="text-xs text-gray-500">
          Nombre de la relación desde este legajo
        </p>
      </div>

      {/* Inverse Relation Type */}
      <div className="space-y-2">
        <Label htmlFor="inverse_relation_type">Tipo de Relación Inversa</Label>
        <Input
          id="inverse_relation_type"
          value={localConfig.inverse_relation_type}
          onChange={(e) => handleChange({ inverse_relation_type: e.target.value })}
          placeholder="Ej: empleados"
        />
        <p className="text-xs text-gray-500">
          Nombre de la relación desde el legajo relacionado
        </p>
      </div>

      {/* Target Plantilla ID */}
      <div className="space-y-2">
        <Label htmlFor="target_plantilla_id">ID de Plantilla Destino</Label>
        <Input
          id="target_plantilla_id"
          value={localConfig.target_plantilla_id}
          onChange={(e) => handleChange({ target_plantilla_id: e.target.value })}
          placeholder="UUID de la plantilla"
        />
        <p className="text-xs text-gray-500">
          UUID de la plantilla con la que se relaciona
        </p>
      </div>

      {/* Display Fields */}
      <div className="space-y-2">
        <Label htmlFor="display_fields">Campos a Mostrar</Label>
        <Input
          id="display_fields"
          value={localConfig.display_fields.join(', ')}
          onChange={(e) => handleArrayChange('display_fields', e.target.value)}
          placeholder="nombre, fecha_inicio, estado"
        />
        <p className="text-xs text-gray-500">
          Campos separados por comas
        </p>
      </div>

      {/* Search Fields */}
      <div className="space-y-2">
        <Label htmlFor="search_fields">Campos de Búsqueda</Label>
        <Input
          id="search_fields"
          value={localConfig.search_fields.join(', ')}
          onChange={(e) => handleArrayChange('search_fields', e.target.value)}
          placeholder="nombre, codigo"
        />
        <p className="text-xs text-gray-500">
          Campos por los que se puede buscar
        </p>
      </div>

      {/* Permissions */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium">Permisos</h4>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allow_create">Permitir Crear Relaciones</Label>
            <p className="text-xs text-gray-500">
              Permite agregar nuevas relaciones
            </p>
          </div>
          <Switch
            id="allow_create"
            checked={localConfig.allow_create}
            onCheckedChange={(checked) => handleChange({ allow_create: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allow_remove">Permitir Eliminar Relaciones</Label>
            <p className="text-xs text-gray-500">
              Permite quitar relaciones existentes
            </p>
          </div>
          <Switch
            id="allow_remove"
            checked={localConfig.allow_remove}
            onCheckedChange={(checked) => handleChange({ allow_remove: checked })}
          />
        </div>
      </div>
    </div>
  );
}
