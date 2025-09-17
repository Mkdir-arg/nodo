"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BuilderWrapper from '@/components/form/builder/BuilderWrapper';
import BuilderHeader from '@/components/form/builder/BuilderHeader';
import Palette from '@/components/form/builder/Palette';
import PropertiesPanel from '@/components/form/builder/PropertiesPanel';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import { saveLayout } from '@/lib/api/plantillas';
import { repo } from '@/lib/legajos/repo';
import { saveTemplateSimple } from '@/lib/legajos/simple-repo';
import { useNavStore } from '@/lib/store/useNavStore';

export default function CrearPlantillaPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [nombre, setNombre] = useState('');
  const { buildSchema, resetDirty, sections } = useBuilderStore();
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
      const builderSchema = buildSchema();
      console.log('🔍 Builder schema completo:', JSON.stringify(builderSchema, null, 2));
      console.log('🔍 Secciones en builder:', sections?.length || 0);
      
      // Crear campos de prueba si el builder está vacío
      let fields = [];
      let layout = [];
      
      if (!sections || sections.length === 0) {
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
        // Convertir secciones del builder a fields y layout
        const allFields: any[] = [];
        
        sections.forEach(section => {
          const sectionFields = (section.nodes || section.children || []).filter((n: any) => n.kind !== 'ui');
          sectionFields.forEach(field => {
            allFields.push({
              id: field.id,
              key: field.key || field.id,
              type: field.type,
              label: field.label || 'Campo sin nombre',
              required: field.required || false,
              ui: {
                colSpan: 6
              }
            });
          });
        });
        
        fields = allFields;
        
        layout = sections.map(section => ({
          type: 'section',
          label: section.title || 'Sección',
          children: (section.nodes || section.children || [])
            .filter((n: any) => n.kind !== 'ui')
            .map((f: any) => ({
              type: 'field',
              fieldKey: f.key || f.id
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
      
      // El layout ya se guardó en el schema
      
      resetDirty();
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
