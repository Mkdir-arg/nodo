'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Plus, FolderPlus } from 'lucide-react';
import { useBuilderStore } from '@/lib/store/useBuilderStore';
import { toast } from '@/lib/toast';
import FieldTypeModal from './FieldTypeModal';

interface BuilderHeaderProps {
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

export default function BuilderHeader({ onSave, isSaving = false }: BuilderHeaderProps) {
  const { dirty, addSection, addField, nodes } = useBuilderStore();
  const [showFieldModal, setShowFieldModal] = useState(false);
  
  const sections = nodes.filter(n => n.kind === 'section');
  const firstSectionId = sections[0]?.id;

  const handleSave = async () => {
    try {
      await onSave();
      toast.success('Layout guardado correctamente');
    } catch (error: any) {
      if (error.status === 404) {
        toast.error('Endpoint de layout no encontrado (404). Verificar ruta en Django: /api/plantillas/<id>/layout/');
      } else {
        toast.error('Error al guardar el layout');
      }
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

        <Button
          onClick={handleSave}
          disabled={!dirty || isSaving}
          size="sm"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
      
      <FieldTypeModal
        isOpen={showFieldModal}
        onClose={() => setShowFieldModal(false)}
        onSelect={handleFieldTypeSelect}
      />
    </>
  );
}