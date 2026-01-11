"use client";
import { useEffect } from "react";
import { FieldType } from "@/lib/form-builder/factory";
import { useBuilderStore } from "@/lib/store/usePlantillaBuilderStore";

const GROUPS: Record<string, [FieldType, string][]> = {
  "Datos referencia": [
    ["text", "Nombre"],
    ["text", "Apellido"],
    ["select", "Tipo Documento"],
    ["number", "Número Documento"],
    ["select", "Provincia"],
    ["select", "Municipio"],
    ["text", "Calle"],
    ["number", "Número"],
  ],
  "Básicos": [
    ["text", "Texto corto"],
    ["email", "Email"],
    ["textarea", "Texto largo"],
    ["number", "Número"],
    ["phone", "Teléfono"],
    ["checkbox", "Checkbox"],
    ["info", "Texto informativo"],
    ["sum", "Suma (readonly)"],
  ],
  "Selección": [
    ["select", "Selector excluyente"],
    ["dropdown", "Lista desplegable"],
    ["multiselect", "Selector múltiple"],
    ["select_with_filter", "Lista con filtro"],
  ],
  "Avanzados": [
    ["date", "Fecha"],
    ["document", "Archivo"],
    ["image", "Imagen"],
    ["cuit_razon_social", "CUIT y Razón social"],
    ["group", "Grupo iterativo"],
  ],
};

const VISUALES = [
  { type: "ui:header", label: "Encabezado Hero\nImagen + card" },
  { type: "ui:divider", label: "Separador" },
  { type: "ui:banner", label: "Banner" },
  { type: "ui:paginator", label: "Paginador\nWizard/Tabs" },
  { type: "ui:relation", label: "Relación" },
];

export default function ComponentsModal({ open, onClose }:{open:boolean; onClose:()=>void}) {
  const { addField, getSectionIdForInsert } = useBuilderStore();

  useEffect(()=>{
    const onEsc = (e:KeyboardEvent)=>{ if (e.key==="Escape") onClose(); };
    if (open) document.addEventListener("keydown", onEsc);
    return ()=>document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;
  const insert = (type: string | any) => {
    const sid = getSectionIdForInsert();
    const id = addField(sid, type as any) as string;
    onClose();
    if (id) window.dispatchEvent(new CustomEvent('builder:open-props', { detail: { id } }));
  };
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[min(800px,92vw)] bg-white rounded-2xl shadow-xl p-4 dark:bg-slate-800 dark:border dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-3">Componentes</h3>
        <div className="space-y-6">
          {Object.entries(GROUPS).map(([title, items])=>(
            <div key={title}>
              <h4 className="text-sm font-semibold mb-2">{title}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {items.map(([type, label])=>(
                  <button key={type} type="button"
                    onClick={() => insert(type)}
                    className="border rounded-xl p-2 text-left hover:bg-gray-50 focus:outline-none focus:ring dark:border-slate-700 dark:hover:bg-slate-700">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <section>
            <h4 className="text-sm font-semibold mb-2">Visuales</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {VISUALES.map((c) => (
                <button
                  key={c.type}
                  type="button"
                  className="border rounded-xl p-2 text-left hover:bg-gray-50 focus:outline-none focus:ring dark:border-slate-700 dark:hover:bg-slate-700 whitespace-pre-line text-sm"
                  onClick={() => insert(c.type)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </section>
        </div>
        <div className="text-right mt-4">
          <button onClick={onClose} className="px-3 py-2 border rounded-xl dark:border-slate-700">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
