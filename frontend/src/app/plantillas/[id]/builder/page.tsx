"use client";
import { useEffect, useState } from "react";
import { useBuilder } from "@/lib/legajos/builder/store";
import { repo } from "@/lib/legajos/repo";
import DynamicForm from "@/lib/legajos/renderer/Renderer";
import { FieldDef } from "@/lib/legajos/schema";
import { useRouter, useParams } from "next/navigation";
import { useClientGuard } from "@/lib/useClientGuard";

const FIELD_TYPES: {type: FieldDef["type"]; label: string}[] = [
  { type:"text", label:"Texto" },
  { type:"number", label:"Número" },
  { type:"date", label:"Fecha" },
  { type:"select", label:"Select" },
  { type:"textarea", label:"Área de texto" },
  { type:"boolean", label:"Booleano" },
];

export default function BuilderPage() {
  useClientGuard();
  const r = useRouter();
  const params = useParams();
  const { template, setTemplate, addField, addFieldToLayout, updateField } = useBuilder();
  const [preview, setPreview] = useState(false);

  // cargar plantilla si existe
  useEffect(()=>{ (async()=>{
    const id = params?.id as string;
    const t = await repo.getTemplate(id);
    if (t) setTemplate(t);
  })(); },[params,setTemplate]);

  const add = (t: FieldDef["type"]) => {
    const f = addField(t);
    // por simplicidad: agregar al primer col
    addFieldToLayout(f.key, [0,0]);
  };

  const save = async () => { await repo.upsertTemplate(template); alert("Plantilla guardada"); };
  const publish = async () => { await repo.publishTemplate(template.id); setTemplate({ ...template, status:"published" }); alert("Publicada"); };

  return (
    <div className="min-h-screen grid grid-cols-12 bg-gray-900 text-white">
      {/* Paleta izquierda */}
      <aside className="col-span-2 border-r border-gray-800 p-3">
        <h3 className="font-semibold mb-2">Bloques</h3>
        <div className="space-y-2">
          {FIELD_TYPES.map(ft=>(
            <button key={ft.type} onClick={()=>add(ft.type)} className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 text-left">{ft.label}</button>
          ))}
        </div>
      </aside>

      {/* Lienzo central (vista construcción simple) */}
      <main className="col-span-7 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">{template.name} <span className="text-gray-400 text-sm">({template.status})</span></h2>
          <div className="flex gap-2">
            <button onClick={()=>setPreview(v=>!v)} className="px-3 py-1 rounded-lg bg-gray-800">{preview ? "Editar" : "Vista previa"}</button>
            <button onClick={save} className="px-3 py-1 rounded-lg bg-blue-600">Guardar</button>
            <button onClick={publish} className="px-3 py-1 rounded-lg bg-emerald-600">Publicar</button>
          </div>
        </div>

        {!preview ? (
          <div className="border border-dashed border-gray-700 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-2">Fila 1 / Columna única</p>
            <ul className="space-y-2">
              {template.layout[0]?.children?.[0]?.children?.map((n,i)=>(
                <li key={i} className="bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span>{n.type==="field" ? n.fieldKey : n.type}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="border border-gray-800 rounded-xl p-4 bg-gray-900">
            <DynamicForm template={template} onSubmit={(v)=>console.log("preview submit", v)} />
          </div>
        )}
      </main>

      {/* Inspector derecho (propiedades básicas del último campo agregado) */}
      <aside className="col-span-3 border-l border-gray-800 p-4">
        <h3 className="font-semibold mb-3">Inspector</h3>
        <p className="text-sm text-gray-400 mb-2">Seleccioná un campo en el lienzo (por ahora, editar el último agregado).</p>
        {/* MVP: editar el último field */}
        {(() => {
          const kids = template.layout[0]?.children?.[0]?.children ?? [];
          const last = kids.map(k=>k.fieldKey).filter(Boolean).pop();
          const f = template.fields.find(x=>x.key===last);
          if (!f) return <p className="text-sm text-gray-500">No hay campo seleccionado.</p>;
          return (
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1 text-gray-300">Label</label>
                <input value={f.label} onChange={e=>updateField(f.key, { label:e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-300">Key</label>
                <input value={f.key} onChange={e=>updateField(f.key, { key:e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-300">Required</label>
                <input type="checkbox" checked={!!f.required} onChange={e=>updateField(f.key, { required:e.target.checked })}
                  className="w-4 h-4" />
              </div>
            </div>
          );
        })()}
      </aside>
    </div>
  );
}
