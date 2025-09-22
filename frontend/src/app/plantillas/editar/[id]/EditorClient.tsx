"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { repo } from "@/lib/legajos/repo";
import BuilderWrapper from '@/components/form/builder/BuilderWrapper';
import BuilderHeader from '@/components/form/builder/BuilderHeader';
import Palette from '@/components/form/builder/Palette';
import PropertiesPanel from '@/components/form/builder/PropertiesPanel';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import { saveTemplateSimple } from '@/lib/legajos/simple-repo';
import { useNavStore } from '@/lib/store/useNavStore';

export default function EditorClient({ plantillaId }: { plantillaId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { buildSchema, resetDirty } = useBuilderStore();
  const { refreshPlantillas } = useNavStore();

  const { data: template, isLoading, error } = useQuery({
    queryKey: ['template', plantillaId],
    queryFn: async () => {
      console.log('Fetching template with ID:', plantillaId);
      const result = await repo.getTemplate(plantillaId);
      console.log('Template fetched:', result);
      return result;
    },
    retry: 1
  });
  
  console.log('Query state:', { template, isLoading, error, plantillaId });

  // Cargar plantilla en el builder cuando esté disponible
  useEffect(() => {
    if (template) {
      console.log('Template loaded:', template);
      setNombre(template.name);
      
      // Transformar template al formato esperado por setTemplate
      const templateForBuilder = {
        id: template.id,
        nombre: template.name,
        version: template.version || 1,
        descripcion: template.description,
        schema: {
          sections: template.layout ? [{
            id: 'sec_1',
            title: 'Campos',
            nodes: template.fields || [],
            layout_mode: 'flow'
          }] : []
        }
      };
      
      console.log('Setting template in builder:', templateForBuilder);
      const { setTemplate } = useBuilderStore.getState();
      setTemplate(templateForBuilder);
    }
  }, [template]);
  


  const handleSave = async () => {
    if (!nombre.trim()) {
      alert('Por favor ingresa un nombre para la plantilla');
      return;
    }
    
    setIsSaving(true);
    try {
      const builderSchema = buildSchema();
      console.log('Builder schema:', builderSchema);
      
      // Transformar layout para que sea compatible con el schema
      const transformedLayout = (builderSchema.sections || []).map(section => ({
        type: 'section',
        label: section.title || 'Sección',
        children: (section.nodes || section.children || []).map(field => ({
          type: 'field',
          fieldKey: field.key
        }))
      }));
      
      const updatedTemplate = {
        id: template.id,
        name: nombre.trim(),
        slug: template.slug || nombre.trim().toLowerCase().replace(/\s+/g, '-'),
        description: template.description || '',
        fields: builderSchema.nodes || template?.fields || [],
        layout: transformedLayout,
        version: template.version || 1,
        status: template.status || 'published',
        createdAt: template.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Updated template:', updatedTemplate);
      
      // Usar repo.upsertTemplate para actualizar
      await repo.upsertTemplate(updatedTemplate);
      
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['template'] });
      queryClient.invalidateQueries({ queryKey: ['plantillas'] });
      queryClient.invalidateQueries({ queryKey: ['legajos'] });
      
      resetDirty();
      await refreshPlantillas();
      
      alert(`Plantilla "${nombre}" actualizada exitosamente`);
      router.push('/plantillas');
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error al actualizar plantilla: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Cargando plantilla...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Plantilla no encontrada</h1>
          <p className="text-gray-600 mb-4">La plantilla que buscas no existe.</p>
          <button
            onClick={() => router.push("/plantillas")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver a Plantillas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Editar Plantilla</h1>
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
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
      
      <BuilderHeader plantillaId={plantillaId} plantillaNombre={nombre} />
      
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 p-4">
          <div className="flex gap-4 h-full">
            <div className="w-64 flex-shrink-0">
              <Palette />
            </div>
            <div className="flex-1">
              <BuilderWrapper />
            </div>
            <div className="w-80 flex-shrink-0">
              <PropertiesPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}