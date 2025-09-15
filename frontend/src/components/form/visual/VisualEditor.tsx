'use client';
import { useState } from 'react';
import EditorHeader from './EditorHeader';
import EditorCounters from './EditorCounters';
import { useVisualConfigStore } from '@/lib/store/usePlantillaVisualStore';
import { PlantillasService } from '@/lib/services/plantillas';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';

export default function VisualEditor() {
  const { visualConfig } = useVisualConfigStore();
  const plantillaId = useBuilderStore((s) => s.plantillaId);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!plantillaId) return;
    setSaving(true);
    try {
      await PlantillasService.updateVisualConfig(plantillaId, visualConfig);
      alert('Config visual guardada');
    } catch (e: any) {
      alert(e?.message || e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <EditorHeader />
      <EditorCounters />
      <button
        className="px-4 py-2 rounded bg-sky-600 text-white disabled:opacity-50"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </div>
  );
}
