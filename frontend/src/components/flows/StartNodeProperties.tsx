'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, X, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { fetchPlantillas, fetchPlantillaFields } from '@/lib/api/plantillas';
import type { StartConfig, TableCol } from '@/lib/flows/types';

interface StartNodePropertiesProps {
  config: StartConfig;
  onSave: (config: StartConfig) => void;
  onCancel: () => void;
  embedded?: boolean; // Para uso dentro de otros forms
}

export default function StartNodeProperties({ config, onSave, onCancel, embedded = false }: StartNodePropertiesProps) {
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [availableFields, setAvailableFields] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<TableCol[]>(
    config.tableColumns || [
      { key: 'id', label: 'ID' },
      { key: 'created_at', label: 'Creado' }
    ]
  );

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      selectedPlantilla: config.acceptedPlantillas?.[0] || '',
      defaultSort: config.defaultSort || { key: 'created_at', dir: 'desc' },
      pageSize: config.pageSize || 25,
      searchFilter: config.defaultFilters?.search || '',
    }
  });

  const watchedPlantilla = watch('selectedPlantilla');

  // Cargar plantillas del backend
  useEffect(() => {
    const loadPlantillas = async () => {
      try {
        console.log('Cargando plantillas...');
        const data = await fetchPlantillas();
        console.log('Datos recibidos:', data);
        // La API devuelve un array directo, no un objeto con results
        const plantillasList = Array.isArray(data) ? data : (data.results || []);
        console.log('Plantillas procesadas:', plantillasList);
        setPlantillas(plantillasList);
      } catch (error) {
        console.error('Error cargando plantillas:', error);
      }
    };
    loadPlantillas();
  }, []);

  // Cargar campos de la plantilla seleccionada
  useEffect(() => {
    const loadFields = async () => {
      if (!watchedPlantilla) {
        setAvailableFields([]);
        return;
      }

      try {
        const fields = await fetchPlantillaFields(watchedPlantilla);
        setAvailableFields(fields);
      } catch (error) {
        console.error('Error cargando campos:', error);
        setAvailableFields([]);
      }
    };
    
    loadFields();
  }, [watchedPlantilla]);

  // Auto-guardar cuando está embedded
  useEffect(() => {
    if (embedded) {
      const data = {
        selectedPlantilla: watchedPlantilla,
        defaultSort: watch('defaultSort'),
        pageSize: watch('pageSize'),
        searchFilter: watch('searchFilter')
      };
      const newConfig: StartConfig = {
        acceptedPlantillas: data.selectedPlantilla ? [data.selectedPlantilla] : [],
        tableColumns: tableColumns.filter(col => col.key && col.label),
        defaultFilters: {
          search: data.searchFilter,
          date_from: null,
          date_to: null,
        },
        defaultSort: data.defaultSort,
        pageSize: data.pageSize,
      };
      onSave(newConfig);
    }
  }, [watchedPlantilla, tableColumns, embedded, onSave, watch]);

  const addColumn = () => {
    setTableColumns([...tableColumns, { key: '', label: '' }]);
  };

  const updateColumn = (index: number, field: 'key' | 'label', value: string) => {
    const updated = [...tableColumns];
    updated[index][field] = value;
    setTableColumns(updated);
  };

  const removeColumn = (index: number) => {
    setTableColumns(tableColumns.filter((_, i) => i !== index));
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newColumns = [...tableColumns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newColumns.length) {
      [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
      setTableColumns(newColumns);
    }
  };

  const onSubmit = (data: any) => {
    const newConfig: StartConfig = {
      acceptedPlantillas: data.acceptedPlantillas,
      tableColumns: tableColumns.filter(col => col.key && col.label),
      defaultFilters: {
        search: data.searchFilter,
        date_from: null,
        date_to: null,
      },
      defaultSort: data.defaultSort,
      pageSize: data.pageSize,
    };
    onSave(newConfig);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-xl font-bold text-gray-800">🚀 Configuración de Inicio</h3>
          <p className="text-sm text-gray-600 mt-1">Define cómo se iniciará tu flujo de trabajo</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Plantillas Aceptadas */}
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              📄
            </div>
            <Label className="text-lg font-semibold text-gray-800">Plantilla Seleccionada</Label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {plantillas.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <p>No hay plantillas disponibles</p>
                <p className="text-sm mt-1">Crea una plantilla primero en la sección de Plantillas</p>
              </div>
            ) : (
              plantillas.map((plantilla) => (
                <label key={plantilla.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                  <input
                    type="radio"
                    value={plantilla.id}
                    {...register('selectedPlantilla')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{plantilla.nombre}</span>
                </label>
              ))
            )}
          </div>
        </Card>

        {/* Columnas de Tabla */}
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                📋
              </div>
              <Label className="text-lg font-semibold text-gray-800">Columnas de Tabla</Label>
            </div>
            <Button type="button" onClick={addColumn} size="sm" className="bg-green-500 hover:bg-green-600 text-white">
              <Plus className="h-4 w-4 mr-1" />
              Manual
            </Button>
          </div>
          
          {/* Campos disponibles de plantillas seleccionadas */}
          {availableFields.length > 0 && (
            <div className="mb-4">
              <Label className="text-xs text-gray-600 mb-2 block">Campos de la Plantilla Seleccionada:</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {availableFields.map((field) => {
                  const isSelected = tableColumns.some(col => col.key === field.key);
                  return (
                    <button
                      key={field.key}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setTableColumns(prev => prev.filter(col => col.key !== field.key));
                        } else {
                          setTableColumns(prev => [...prev, { key: field.key, label: field.label }]);
                        }
                      }}
                      className={`text-xs p-2 rounded border text-left ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium">{field.label}</div>
                      <div className="text-gray-500">{field.key}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            {tableColumns.map((column, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                {/* Controles móviles */}
                <div className="flex sm:flex-col gap-1 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      onClick={() => moveColumn(index, 'up')}
                      size="sm"
                      variant="ghost"
                      disabled={index === 0}
                      className="h-8 w-8 sm:h-6 sm:w-6 p-0"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => moveColumn(index, 'down')}
                      size="sm"
                      variant="ghost"
                      disabled={index === tableColumns.length - 1}
                      className="h-8 w-8 sm:h-6 sm:w-6 p-0"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 sm:hidden">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <Button
                      type="button"
                      onClick={() => removeColumn(index)}
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Grip para desktop */}
                <GripVertical className="hidden sm:block h-4 w-4 text-gray-400" />
                
                {/* Inputs */}
                <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full">
                  <Input
                    placeholder="Clave (ej: nombre)"
                    value={column.key}
                    onChange={(e) => updateColumn(index, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Etiqueta (ej: Nombre)"
                    value={column.label}
                    onChange={(e) => updateColumn(index, 'label', e.target.value)}
                    className="flex-1"
                  />
                </div>
                
                {/* Botón eliminar para desktop */}
                <Button
                  type="button"
                  onClick={() => removeColumn(index)}
                  size="sm"
                  variant="outline"
                  className="hidden sm:flex text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Filtros por Defecto */}
        <Card className="p-4">
          <Label className="text-sm font-medium mb-3 block">Filtros por Defecto</Label>
          <div>
            <Label htmlFor="searchFilter" className="text-xs">Búsqueda</Label>
            <Input
              id="searchFilter"
              {...register('searchFilter')}
              placeholder="Texto de búsqueda por defecto"
            />
          </div>
        </Card>

        {/* Ordenamiento */}
        <Card className="p-4">
          <Label className="text-sm font-medium mb-3 block">Ordenamiento por Defecto</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label htmlFor="sortKey" className="text-xs">Campo</Label>
              <select
                id="sortKey"
                {...register('defaultSort.key')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="created_at">Fecha de creación</option>
                <option value="updated_at">Última actualización</option>
                <option value="id">ID</option>
                {availableFields.map(field => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="sortDir" className="text-xs">Dirección</Label>
              <select
                id="sortDir"
                {...register('defaultSort.dir')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Tamaño de Página */}
        <Card className="p-4">
          <Label htmlFor="pageSize" className="text-sm font-medium mb-2 block">
            Elementos por Página
          </Label>
          <Input
            id="pageSize"
            type="number"
            min="10"
            max="100"
            {...register('pageSize', { valueAsNumber: true })}
          />
        </Card>

        {!embedded && (
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <Button 
              onClick={() => {
                const data = {
                  selectedPlantilla: watch('selectedPlantilla'),
                  defaultSort: watch('defaultSort'),
                  pageSize: watch('pageSize'),
                  searchFilter: watch('searchFilter')
                };
                const newConfig: StartConfig = {
                  acceptedPlantillas: data.selectedPlantilla ? [data.selectedPlantilla] : [],
                  tableColumns: tableColumns.filter(col => col.key && col.label),
                  defaultFilters: {
                    search: data.searchFilter,
                    date_from: null,
                    date_to: null,
                  },
                  defaultSort: data.defaultSort,
                  pageSize: data.pageSize,
                };
                onSave(newConfig);
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg transition-all"
            >
              ✅ Guardar Configuración
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold transition-all"
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}