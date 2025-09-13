"use client";
import { useMemo } from "react";
import { useBuilderStore } from "@/lib/store/usePlantillaBuilderStore";
import { newField, FieldType } from "@/lib/form-builder/factory";

type Item = { type: FieldType; label: string; note?: string };
const BASICOS: Item[] = [
  { type:"text", label:"Texto corto" },
  { type:"textarea", label:"Texto largo" },
  { type:"number", label:"Número" },
  { type:"info", label:"Texto informativo" },
  { type:"sum", label:"Suma (readonly)" },
];
const SELECCION: Item[] = [
  { type:"select", label:"Selector excluyente" },
  { type:"dropdown", label:"Lista desplegable" },
  { type:"multiselect", label:"Selector múltiple" },
  { type:"select_with_filter", label:"Lista con filtro" },
];
const AVANZADOS: Item[] = [
  { type:"date", label:"Fecha" },
  { type:"document", label:"Archivo" },
  { type:"phone", label:"Teléfono" },
  { type:"cuit_razon_social", label:"CUIT y Razón social" },
  { type:"group", label:"Grupo iterativo" },
];

export default function Palette() {
  const sections = useBuilderStore(s => s.sections);
  const selected = useBuilderStore(s => s.selected);
  const addField = useBuilderStore(s => s.addField); // (sectionId, type) ó (sectionId, node)
  const selectedSectionId = useMemo(()=>{
    // si está seleccionada una sección, usarla; si no, 1ra sección
    if (selected?.type === "section") return selected.id;
    return sections?.[0]?.id;
  }, [selected, sections]);

  const handleAdd = (t: FieldType) => {
    if (!selectedSectionId) return alert("Primero agregá/seleccioná una sección");
    // si el store espera (sectionId, type):
    try {
      addField(selectedSectionId, t as any);
    } catch {
      // fallback si espera un nodo completo:
      addField(selectedSectionId, newField(t) as any);
    }
  };

  const Block = ({title, items}:{title:string;items:Item[]}) => (
    <div className="mb-4">
      <h4 className="text-sm font-semibold mb-2">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {items.map(it=>(
          <button key={it.type} type="button"
            onClick={()=>handleAdd(it.type)}
            className="border rounded-xl p-2 text-left hover:bg-gray-50">
            <div className="text-sm font-medium">{it.label}</div>
            {it.note && <div className="text-xs opacity-70">{it.note}</div>}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <aside className="w-full">
      <Block title="Básicos" items={BASICOS} />
      <Block title="Selección" items={SELECCION} />
      <Block title="Avanzados" items={AVANZADOS} />
      <p className="text-xs opacity-60 mt-2">Tip: primero seleccioná una sección para insertar ahí.</p>
    </aside>
  );
}
