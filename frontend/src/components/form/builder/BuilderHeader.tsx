'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useBuilderStore } from '@/lib/store/useBuilderStore';
import { saveLayout } from '@/lib/api/plantillas';

interface BuilderHeaderProps {
  plantillaId?: string;
}

export function BuilderHeader({ plantillaId }: BuilderHeaderProps) {
  const router = useRouter();
  const { dirty, toFormLayout, clearDirty } = useBuilderStore();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!plantillaId) {
      toast.error('ID de plantilla no disponible');
      return;
    }

    setSaving(true);
    try {
      const layout = toFormLayout();
      await saveLayout(plantillaId, layout);
      clearDirty();
      toast.success('Layout guardado correctamente');
    } catch (error: any) {
      console.error('Error al guardar:', error);
      if (error.message?.includes('404')) {
        toast.error(error.message);
      } else {
        toast.error('Error al guardar el layout');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="px-3 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Volver
        </button>
        <h1 className="text-xl font-semibold">Constructor de Formularios</h1>
      </div>

      <div className="flex items-center gap-3">
        {dirty && (
          <span className="text-sm text-orange-600">
            Cambios sin guardar
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}