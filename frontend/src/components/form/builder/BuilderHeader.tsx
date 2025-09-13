'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import { PlantillasService } from '@/lib/services/plantillas';
import { serializeTemplateSchema } from '@/lib/serializeTemplate';

export default function BuilderHeader() {
  const router = useRouter();
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
      await PlantillasService.savePlantilla({
        nombre: nombre.trim(),
        descripcion: '',
        schema,
      });

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
