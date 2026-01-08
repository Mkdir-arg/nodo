'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { UIRelationNode, UIRelationItem } from '@/components/form/shared/ui/relation/types';
import { useTemplatesList } from './relation/useTemplatesList';
import { nanoid } from 'nanoid';

interface RelationPropertiesProps {
  node: UIRelationNode;
  onChange: (patch: Partial<UIRelationNode>) => void;
}

const cardinalityOptions = [
  { value: 'one_to_one', label: '1:1' },
  { value: 'one_to_many', label: '1:N' },
  { value: 'many_to_one', label: 'N:1' },
  { value: 'many_to_many', label: 'N:N' },
];

export default function RelationProperties({ node, onChange }: RelationPropertiesProps) {
  const config = node.config;
  const relations = config.relations || [];
  const { templates, isLoading, searchQuery, setSearchQuery } = useTemplatesList();
  const [showDropdown, setShowDropdown] = useState(false);

  const updateConfig = (patch: Partial<typeof config>) => {
    onChange({ config: { ...config, ...patch } });
  };

  const addRelation = () => {
    const newRelation: UIRelationItem = {
      id: nanoid(6),
      relation_label: 'Relación',
      inverse_relation_label: 'Inversa'
    };
    updateConfig({ relations: [...relations, newRelation] });
  };

  const updateRelation = (index: number, patch: Partial<UIRelationItem>) => {
    const updated = [...relations];
    updated[index] = { ...updated[index], ...patch };
    updateConfig({ relations: updated });
  };

  const removeRelation = (index: number) => {
    updateConfig({ relations: relations.filter((_, i) => i !== index) });
  };

  const selectedTemplate = templates.find((t: any) => t.id === config.target_template_id);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-1">Relaciones</h3>
        <p className="text-xs text-gray-600">Define múltiples vínculos con la misma plantilla</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Título del bloque</label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => updateConfig({ title: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Relaciones"
        />
      </div>

      {/* Configuración compartida */}
      <div className="border rounded-lg p-3 bg-gray-50 space-y-3">
        <div className="text-sm font-semibold">Configuración compartida</div>
        
        {/* Plantilla destino */}
        <div className="space-y-1">
          <label className="text-xs font-medium">Plantilla destino</label>
          <div className="relative">
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full border rounded px-2 py-1.5 text-sm cursor-pointer flex items-center justify-between bg-white"
            >
              <span className={selectedTemplate ? 'text-gray-900' : 'text-gray-400'}>
                {selectedTemplate?.nombre || 'Seleccionar...'}
              </span>
              {showDropdown ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>

            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-hidden">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full px-2 py-1 text-xs border rounded"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto max-h-32">
                  {isLoading ? (
                    <div className="p-2 text-xs text-gray-500 text-center">Cargando...</div>
                  ) : templates.length === 0 ? (
                    <div className="p-2 text-xs text-gray-500 text-center">No hay plantillas</div>
                  ) : (
                    templates.map((t: any) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          updateConfig({ 
                            target_template_id: t.id, 
                            target_template_name: t.nombre 
                          });
                          setShowDropdown(false);
                          setSearchQuery('');
                        }}
                        className="px-2 py-1.5 hover:bg-gray-100 cursor-pointer text-xs"
                      >
                        {t.nombre}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="text-xs font-medium block mb-1">Tipo de relación</label>
          <select
            value={config.cardinality}
            onChange={(e) => updateConfig({ cardinality: e.target.value as any })}
            className="w-full border rounded px-2 py-1 text-xs"
          >
            {cardinalityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Obligatorio */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.selection.required || false}
            onChange={(e) => updateConfig({ 
              selection: { ...config.selection, required: e.target.checked } 
            })}
          />
          <span className="text-xs">Obligatorio</span>
        </label>

        {/* Max items */}
        {config.cardinality !== 'one_to_one' && (
          <div>
            <label className="text-xs font-medium block mb-1">Máx. vínculos</label>
            <input
              type="number"
              min="1"
              value={config.selection.max_items || ''}
              onChange={(e) => updateConfig({ 
                selection: { 
                  ...config.selection, 
                  max_items: e.target.value ? Number(e.target.value) : undefined 
                } 
              })}
              className="w-full border rounded px-2 py-1 text-xs"
              placeholder="Sin límite"
            />
          </div>
        )}
      </div>

      {/* Lista de relaciones */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Tipos de relación</label>
          <button
            onClick={addRelation}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            <Plus className="h-3 w-3" />
            Agregar
          </button>
        </div>

        {relations.length === 0 ? (
          <div className="border border-dashed rounded-lg p-4 text-center text-sm text-gray-500">
            No hay tipos de relación. Hacé clic en "Agregar".
          </div>
        ) : (
          <div className="space-y-2">
            {relations.map((rel, idx) => (
              <div key={rel.id} className="border rounded-lg p-3 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Tipo {idx + 1}</span>
                  <button
                    onClick={() => removeRelation(idx)}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium block mb-1">Relación</label>
                    <input
                      type="text"
                      value={rel.relation_label}
                      onChange={(e) => updateRelation(idx, { relation_label: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-xs"
                      placeholder="Padre"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1">Inversa</label>
                    <input
                      type="text"
                      value={rel.inverse_relation_label}
                      onChange={(e) => updateRelation(idx, { inverse_relation_label: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-xs"
                      placeholder="Hijo"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
