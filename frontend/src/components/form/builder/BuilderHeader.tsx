'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import { PlantillasService } from '@/lib/services/plantillas';
import { serializeTemplateSchema } from '@/lib/serializeTemplate';
import { PLANTILLAS_QUERY_KEY } from '@/lib/hooks/usePlantillasMin';
import { useTemplateStore } from '@/stores/templateStore';

export default function BuilderHeader() {
  const router = useRouter();
  const qc = useQueryClient();
  const { sections, validateAll, nombre, setNombre, resetDirty } = useBuilderStore();
  const [saving, setSaving] = useState(false);

  const onBack = () => router.push('/plantillas');

  const onSave = async () => {
    const errs = validateAll();
    if (!nombre.trim()) errs.unshift({ code: 'NAME', message: 'Debes ingresar un nombre.' });
    if (errs.length) {
      alert('Revisá el formulario:\n- ' + errs.map(e => e.message).join('\n- '));
      return;
    }
    setSaving(true);
    try {
      const schema = serializeTemplateSchema(nombre.trim(), sections || []);
      const { visualConfig } = useTemplateStore.getState();
      type SavePlantillaResult = {
        id?: string | number;
      };

      const saved = (await PlantillasService.savePlantilla({
        nombre: nombre.trim(),
        descripcion: '',
        schema,
        visual_config: visualConfig,
      })) as SavePlantillaResult;
      const schemaId =
        schema && typeof schema === 'object' ? (schema as { id?: string | number }).id : undefined;
      const id = saved?.id ?? schemaId;
      if (id) {
        try {
          await PlantillasService.updateVisualConfig(String(id), visualConfig);
        } catch {}
      }
      await qc.invalidateQueries({ queryKey: PLANTILLAS_QUERY_KEY });
      await qc.invalidateQueries({ queryKey: ['plantillas', 'list'] });

      // limpiar flags/auto-save y volver
      resetDirty();
      try {
        localStorage.removeItem('nodo.form.builder');
      } catch {}
      alert('Plantilla guardada');
      router.replace('/plantillas?created=1');
    } catch (e: any) {
      console.error(e);
      alert(`Error al guardar: ${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-4 flex items-center gap-3">
      <button onClick={onBack} className="px-3 py-2 rounded-xl border hover:bg-gray-50">
        ← Volver
      </button>

      <div className="flex-1">
        <label className="block text-sm mb-1">Nombre de la plantilla *</label>
        <input
          className="w-full border rounded-xl px-3 py-2"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Legajo ciudadano"
        />
      </div>

      <button
        className="px-4 py-2 rounded-xl bg-sky-600 text-white disabled:opacity-50"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </div>
  );
}
