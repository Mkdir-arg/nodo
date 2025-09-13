'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlantillasService } from '@/lib/services/plantillas';
import { useBuilderStore } from '@/lib/store/usePlantillaBuilderStore';

const bc = typeof window !== "undefined" ? new BroadcastChannel("nav-legajos") : null;
function notifyNav(type:"refresh"|"refresh_and_expand", plantilla?: any){
  try { bc?.postMessage({ type, plantilla }); } catch {}
  try { localStorage.setItem("nav-legajos:ping", Date.now().toString()); } catch {}
}

export default function BuilderHeader() {
  const router = useRouter();
  const params = useSearchParams();
  const editingId = params?.get("id"); // si esta ruta lo trae; o usar prop
  const { nombre, setNombre, buildSchema, plantillaId, version, descripcion, resetDirty } = useBuilderStore();
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // debounce de unicidad
  useEffect(() => {
    let t: any;
    const check = async () => {
      if (!nombre?.trim()) { setNameError("El nombre es obligatorio"); return; }
      const exists = await PlantillasService.existsNombre(nombre.trim(), plantillaId || undefined);
      setNameError(exists ? "Ya existe una plantilla con este nombre" : null);
    };
    t = setTimeout(check, 300);
    return () => clearTimeout(t);
  }, [nombre, plantillaId]);

  const canSave = useMemo(() => !!nombre?.trim() && !nameError, [nombre, nameError]);

  const onPreview = () => {
    const schema = buildSchema();
    try { localStorage.setItem("nodo.plantilla.preview", JSON.stringify(schema)); } catch {}
    window.open("/plantillas/previsualizacion", "_blank", "noopener,noreferrer");
  };

  const onSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion || null,
      schema: buildSchema(),
    };
    try {
      if (!plantillaId) {
        const res = await PlantillasService.savePlantilla(payload);
        resetDirty();
        notifyNav("refresh_and_expand", res);
        router.replace(`/plantillas/editar/${res.id}`);
      } else {
        const res = await PlantillasService.updatePlantilla(plantillaId, payload);
        resetDirty();
        notifyNav("refresh");
        // quedarse en la página
      }
    } catch (e) {
      console.error(e);
      alert("Error al guardar la plantilla");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
      <div className="space-y-1 w-full lg:w-[36rem]">
        <label className="text-sm font-medium">Nombre de la plantilla *</label>
        <input
          className={`w-full border rounded-xl p-2 ${nameError ? 'border-red-500' : ''}`}
          value={nombre} onChange={e=>setNombre(e.target.value)}
          placeholder="Ej.: Legajo de Ciudadano"
        />
        {nameError && <p className="text-sm text-red-600">{nameError}</p>}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onPreview} className="px-4 py-2 rounded-xl border">Previsualizar</button>
        <button type="button" onClick={onSave} disabled={!canSave || saving}
          className="px-4 py-2 rounded-xl text-white disabled:opacity-50"
          style={{ background: "#0ea5e9" }}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
