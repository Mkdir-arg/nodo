'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Plus, FolderPlus } from 'lucide-react';
import { useBuilderStore } from '@/lib/store/useBuilderStore';
import { saveLayout } from '@/lib/api/plantillas';

// Importar fetchJSON helper
const fetchJSON = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`http://localhost:8000${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};
import FieldTypeModal from './FieldTypeModal';

// Simple toast function
const toast = {
  success: (message: string) => alert(`✓ ${message}`),
  error: (message: string) => alert(`✗ ${message}`)
};

interface BuilderHeaderProps {
  plantillaId: string;
  plantillaNombre: string;
}

export default function BuilderHeader({ plantillaId, plantillaNombre }: BuilderHeaderProps) {
  const { dirty, addSection, addField, nodes, getFormLayout, clearDirty } = useBuilderStore();
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nombre, setNombre] = useState(plantillaNombre);
  const [isEditingName, setIsEditingName] = useState(false);
  
  useEffect(() => {
    setNombre(plantillaNombre);
  }, [plantillaNombre]);
  
  const sections = nodes.filter(n => n.kind === 'section');
  const firstSectionId = sections[0]?.id;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const layout = getFormLayout();
      
      if (layout.nodes.length === 0) {
        toast.error('Agrega al menos una sección antes de guardar');
        return;
      }
      await saveLayout(plantillaId, layout);
      
      // Guardar nombre si cambió
      if (nombre !== plantillaNombre) {
        await fetchJSON(`/api/plantillas/${plantillaId}/`, {
          method: 'PATCH',
          body: JSON.stringify({ nombre })
        });
      }
      
      toast.success('Layout guardado correctamente');
      clearDirty();
    } catch (error: any) {
      if (error.message.includes('404')) {
        toast.error('Endpoint de layout no encontrado (404). Verificar ruta en Django: /api/plantillas/<id>/layout/');
      } else {
        toast.error('Error al guardar el layout');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddField = () => {
    if (!firstSectionId) {
      toast.error('Primero agrega una sección');
      return;
    }
    setShowFieldModal(true);
  };

  const handleFieldTypeSelect = (fieldType: any) => {
    if (fieldType.category === 'section') {
      addSection(fieldType.config.title);
    } else {
      addField(firstSectionId!, {
        type: fieldType.id,
        colSpan: fieldType.defaultColSpan,
        props: fieldType.config
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-4">
          {isEditingName ? (
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
              className="text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
              autoFocus
            />
          ) : (
            <h1 
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => setIsEditingName(true)}
              title="Haz clic para editar"
            >
              {nombre}
            </h1>
          )}
          <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addSection()}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Agregar Sección
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddField}
            disabled={!firstSectionId}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Campo
          </Button>
          </div>
        </div>

        {plantillaId && (
          <Button
            onClick={handleSave}
            disabled={!dirty || isSaving}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        )}
      </div>
      
      <FieldTypeModal
        isOpen={showFieldModal}
        onClose={() => setShowFieldModal(false)}
        onSelect={handleFieldTypeSelect}
      />
    </>
  );
}