import { nanoid } from "nanoid";

export type FieldType =
  | "text"|"textarea"|"number"
  | "select"|"dropdown"|"multiselect"|"select_with_filter"
  | "date"|"document"|"sum"|"phone"|"cuit_razon_social"
  | "info"|"group";

const LAYOUT_DEFAULTS: Record<string, { w: number; h: number }> = {
  "ui:header": { w: 12, h: 5 },
  "ui:kpi-grid": { w: 6, h: 4 },
  "ui:divider": { w: 12, h: 1 },
  "ui:banner": { w: 12, h: 3 },
  "field:text": { w: 6, h: 3 },
  "field:number": { w: 4, h: 3 },
};

export function defLayout(type: string) {
  return LAYOUT_DEFAULTS[type] ?? LAYOUT_DEFAULTS[`field:${type}`] ?? { w: 6, h: 3 };
}

export function newField(type: FieldType) {
  const id = `fld_${nanoid(6)}`;
  const base = { id, label: "Sin título", required: false, esSubsanable: false, esEditableOperador: false, seMuestraEnGrilla: false } as any;

  if (type === "group") {
    return { type, id, key: `grupo_${nanoid(4)}`, label: "Grupo", required:false, minItems:0, maxItems:999, children: [] };
  }
  if (type === "info") {
    return { type, id, key: `info_${nanoid(4)}`, label: "Texto informativo", format:"text", html:"" };
  }
  if (type === "document") {
    return { ...base, type, key:`archivo_${nanoid(4)}`, accept:[".pdf",".jpg",".png"], maxSizeMB:5, isNewFileFlag:true };
  }
  if (type === "sum") {
    return { ...base, type, key:`suma_${nanoid(4)}`, decimals:0, sources:[] };
  }
  if (type === "date") {
    return { ...base, type, key:`fecha_${nanoid(4)}` };
  }
  if (type === "phone") {
    return { ...base, type, key:`telefono_${nanoid(4)}` };
  }
  if (type === "cuit_razon_social") {
    return { ...base, type, key:`cuit_rs_${nanoid(4)}` };
  }
  if (type === "number") {
    return { ...base, type, key:`numero_${nanoid(4)}`, min:undefined, max:undefined, step:undefined };
  }
  if (type === "textarea") {
    return { ...base, type, key:`texto_largo_${nanoid(4)}`, placeholder:"", maxLength:undefined };
  }
  if (type === "text") {
    return { ...base, type, key:`texto_${nanoid(4)}`, placeholder:"", maxLength:undefined };
  }
  // selects
  return {
    ...base,
    type, // "select"|"dropdown"|"multiselect"|"select_with_filter"
    key: `select_${nanoid(4)}`,
    placeholder: "Seleccione...",
    options: [{ value:"opcion_1", label:"Opción 1" }],
  };
}

export function createNode(type: string) {
  if (type.startsWith("ui:")) return createUiNode(type);

  const node = newField(type as FieldType);
  const { w, h } = defLayout(type);
  const id = node.id ?? crypto.randomUUID();
  return {
    ...node,
    id,
    kind: "field",
    layout: { i: id, x: 0, y: Number.POSITIVE_INFINITY, w, h },
  };
}

function createUiNode(type: string) {
  const id = crypto.randomUUID();
  const { w, h } = defLayout(type);
  const base = {
    id,
    kind: "ui" as const,
    type,
    layout: { i: id, x: 0, y: Number.POSITIVE_INFINITY, w, h },
  };

  if (type === "ui:header") {
    return {
      ...base,
      config: {
        variant: "hero",
        show_photo: true,
        title: "{{ data.ciudadano.apellido }}, {{ data.ciudadano.nombre }}",
        subtitle: "Legajo de Ciudadano",
      },
    };
  }

  if (type === "ui:kpi-grid") {
    return {
      ...base,
      config: {
        layout: "grid-4",
        items: [
          { id: "k1", label: "Intervenciones", value: "{{ meta.counts.intervenciones }}" },
          { id: "k2", label: "Archivos", value: "{{ meta.counts.archivos }}" },
          { id: "k3", label: "Alertas", value: "{{ meta.counts.alertas_activas }}" },
          { id: "k4", label: "Completitud", value: "{{ meta.completitud }}%" },
        ],
      },
    };
  }

  if (type === "ui:divider") return { ...base, config: { label: "Sección", subtle: true } };
  if (type === "ui:banner") return { ...base, config: { intent: "info", text: "Mensaje" } };
  if (type === "ui:summary-pinned") return { ...base, config: { fields: [] } };
  if (type === "ui:attachments") return { ...base, config: { allow_preview: true } };
  if (type === "ui:timeline") return { ...base, config: { dense: false } };

  return { ...base, config: {} };
}
