"use client";
import { useEffect } from "react";
import { newField, FieldType } from "@/lib/form-builder/factory";
import { useBuilderStore } from "@/lib/store/usePlantillaBuilderStore";

const GROUPS: Record<string,[FieldType,string][]> = {
  "Componentes básicos": [
    ["text","Texto corto"], ["textarea","Texto largo"],
    ["info","Texto informativo"], ["number","Número"], ["sum","Suma (readonly)"],
  ],
  "Componentes avanzados": [
    ["select_with_filter","Lista desplegable con filtro"], ["date","Fecha"],
    ["phone","Teléfono"], ["cuit_razon_social","CUIT y razón social"], ["document","Archivo"],
    ["select","Selector excluyente"], ["multiselect","Selector múltiple"], ["dropdown","Lista desplegable"],
    ["group","Grupo iterativo"],
  ],
};

export default function ComponentsModal({ open, onClose }:{open:boolean; onClose:()=>void}) {
  const sections = useBuilderStore(s=>s.sections);
  const selected = useBuilderStore(s=>s.selected);
  const addField = useBuilderStore(s=>s.addField);
  const addSection = useBuilderStore(s=>s.addSection);
  const sectionId = selected?.type==="section" ? selected.id : sections?.[0]?.id;

  useEffect(()=>{
    const onEsc = (e:KeyboardEvent)=>{ if (e.key==="Escape") onClose(); };
    if (open) document.addEventListener("keydown", onEsc);
    return ()=>document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[min(800px,92vw)] bg-white rounded-2xl shadow-xl p-4">
        <h3 className="text-lg font-semibold mb-3">Componentes</h3>
        <div className="space-y-6">
          {Object.entries(GROUPS).map(([title, items])=>(
            <div key={title}>
              <h4 className="text-sm font-semibold mb-2">{title}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {items.map(([type, label])=>(
                  <button key={type} type="button"
                    onClick={()=>{
                      const sid = sectionId || addSection();
                      let id: string | undefined;
                      try { id = addField(sid, type as any) as string; }
                      catch { id = addField(sid, newField(type)) as string; }
                      onClose();
                      if (id) window.dispatchEvent(new CustomEvent('builder:open-props',{detail:{id}}));
                    }}
                    className="border rounded-xl p-2 text-left hover:bg-gray-50 focus:outline-none focus:ring">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-right mt-4">
          <button onClick={onClose} className="px-3 py-2 border rounded-xl">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
