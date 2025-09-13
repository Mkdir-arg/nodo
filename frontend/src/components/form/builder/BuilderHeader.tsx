'use client';
import { useState } from 'react';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';
import { PlantillasService } from '@/lib/services/plantillas';
import { serializeTemplateSchema } from '@/lib/serializeTemplate';

export default function BuilderHeader() {
  const { sections, validateAll } = useBuilderStore();
  const [nombre, setNombre] = useState('');
  const [saving, setSaving] = useState(false);

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
      const payload = { nombre: nombre.trim(), descripcion: '', schema };
      await PlantillasService.savePlantilla(payload);
      alert('Guardado con éxito');
    } catch (e: any) {
      console.error('save error', e);
      alert(`Error al guardar: ${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-4 flex items-center gap-3">
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
