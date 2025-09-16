"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Builder from '@/components/form/builder/Builder';
import BuilderHeader from '@/components/form/builder/BuilderHeader';
import { useBuilderStore } from '@/lib/store/useBuilderStore';
import { saveLayout } from '@/lib/api/plantillas';
import { repo } from '@/lib/legajos/repo';
import { saveTemplateSimple } from '@/lib/legajos/simple-repo';
import { useNavStore } from '@/lib/store/useNavStore';

export default function CrearPlantillaPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [nombre, setNombre] = useState('');
  const { toFormLayout, clearDirty } = useBuilderStore();
  const { refreshPlantillas } = useNavStore();

  const handleSave = async () => {
    if (!nombre.trim()) {
      alert('Por favor ingresa un nombre para la plantilla');
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('🚀 INICIANDO GUARDADO');
      
      // Obtener datos del builder
      const builderLayout = toFormLayout();
      console.log('🔍 Builder layout completo:', JSON.stringify(builderLayout, null, 2));
      console.log('🔍 Nodos en builder:', builderLayout.nodes?.length || 0);
      
      // Crear campos de prueba si el builder está vacío
      let fields = [];
      let layout = [];
      
      if (!builderLayout.nodes || builderLayout.nodes.length === 0) {
        console.warn('⚠️ El builder está vacío. Creando campos de prueba...');
        fields = [
          {
            id: 'campo1',
            key: 'nombre',
            type: 'text',
            label: 'Nombre Completo',
            required: true
          },
          {
            id: 'campo2', 
            key: 'email',
            type: 'text',
            label: 'Email',
            required: false
          }
        ];
        layout = [
          {
            type: 'section',
            label: 'Datos Personales',
            children: [
              { type: 'field', fieldKey: 'nombre' },
              { type: 'field', fieldKey: 'email' }
            ]
          }
        ];
      } else {
        // Convertir nodos del builder a fields y layout
        const sections = builderLayout.nodes.filter(n => n.kind === 'section');
        const fieldNodes = builderLayout.nodes.filter(n => n.kind === 'field');
        
        fields = fieldNodes.map(field => ({
          id: field.id,
          key: field.props?.name || field.id,
          type: field.type,
          label: field.props?.label || 'Campo sin nombre',
          required: field.props?.required || false,
          ui: {
            colSpan: field.colSpan || 12
          }
        }));
        
        layout = sections.map(section => ({
          type: 'section',
          label: section.title,
          children: fieldNodes
            .filter(f => f.parentId === section.id)
            .sort((a, b) => a.order - b.order)
            .map(f => ({
              type: 'field',
              fieldKey: f.props?.name || f.id
            }))
        }));
      }
      
      console.log('📋 Fields finales:', fields);
      console.log('🏗️ Layout final:', layout);
      
      const uniqueId = `template-${Date.now()}`;
      const plantillaData = {
        id: uniqueId,
        name: nombre.trim(),
        slug: nombre.trim().toLowerCase().replace(/\s+/g, '-'),
        status: 'draft' as const,
        fields,
        layout,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('📦 Nombre original:', nombre.trim());
      console.log('📦 Nombre en plantillaData:', plantillaData.name);
      
      console.log('📦 Plantilla data final:', plantillaData);
      
      // Usar repositorio simple para evitar transformaciones
      const plantilla = await saveTemplateSimple(plantillaData);
      console.log('✅ PLANTILLA GUARDADA:', plantilla);
      
      // Guardar el layout si hay contenido
      const builderLayoutForSave = toFormLayout();
      if (builderLayoutForSave.nodes.length > 0) {
        try {
          await saveLayout(plantilla.id, builderLayoutForSave);
        } catch (layoutError) {
          console.warn('No se pudo guardar el layout:', layoutError);
        }
      }
      
      clearDirty();
      await refreshPlantillas();
      
      alert(`Plantilla "${nombre}" guardada exitosamente`);
      router.push('/plantillas');
    } catch (error: any) {
      console.error('Error completo:', error);
      alert(`Error al crear plantilla: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Crear Plantillas</h1>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Nombre:</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingresa el nombre de la plantilla"
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={!nombre.trim() || isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Guardando...' : 'Guardar Plantilla'}
          </button>
        </div>
      </div>
      
      <BuilderHeader plantillaId="" plantillaNombre={nombre} />
      
      <div className="flex-1 overflow-hidden">
        <Builder />
      </div>
    </div>
  );
}
