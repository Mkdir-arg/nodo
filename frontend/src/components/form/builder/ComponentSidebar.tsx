"use client";
import { useMemo, useState } from "react";
import { useBuilderStore } from "@/lib/store/usePlantillaBuilderStore";
import { newField, FieldType } from "@/lib/form-builder/factory";

const BASICOS: [FieldType,string][] = [
  ["text","Texto corto"], ["textarea","Texto largo"], ["number","Número"],
  ["info","Texto informativo"], ["sum","Suma (readonly)"]
];
const SELECCION: [FieldType,string][] = [
  ["select","Selector excluyente"], ["dropdown","Lista desplegable"],
  ["multiselect","Selector múltiple"], ["select_with_filter","Lista con filtro"]
];
const AVANZADOS: [FieldType,string][] = [
  ["date","Fecha"], ["document","Archivo"], ["phone","Teléfono"],
  ["cuit_razon_social","CUIT y Razón social"], ["group","Grupo iterativo"]
];

export default function ComponentSidebar() {
  const sections = useBuilderStore(s=>s.sections);
  const selected = useBuilderStore(s=>s.selected);
  const addField = useBuilderStore(s=>s.addField);
  const addSection = useBuilderStore(s=>s.addSection);
  const [q, setQ] = useState("");

  const sectionId = useMemo(()=>{
    if (selected?.type==="section") return selected.id;
    return sections?.[0]?.id;
  }, [selected, sections]);

  const handleAdd = (t: FieldType) => {
    const sid = sectionId || addSection();
    try { addField(sid, t as any); }
    catch { addField(sid, newField(t) as any); }
  };

  const Block = ({title, items}:{title:string; items:[FieldType,string][]}) => (
    <div className="mb-4">
      <h4 className="text-sm font-semibold mb-2">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {items
          .filter(([,label])=> label.toLowerCase().includes(q.toLowerCase()))
          .map(([type,label])=>(
          <button key={type} type="button"
            onClick={()=>handleAdd(type)}
            className="border rounded-xl p-2 text-left hover:bg-gray-50 focus:outline-none focus:ring">
            <div className="text-sm font-medium">{label}</div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <aside className="sticky top-20 h-[calc(100vh-6rem)] overflow-auto pr-4 w-full lg:w-80">
      <div className="mb-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar componente…"
          className="w-full border rounded-xl p-2" />
      </div>
      <Block title="Básicos" items={BASICOS} />
      <Block title="Selección" items={SELECCION} />
      <Block title="Avanzados" items={AVANZADOS} />
      <p className="text-xs opacity-60 mt-2">Tip: seleccioná una sección para insertar ahí.</p>
    </aside>
  );
}
