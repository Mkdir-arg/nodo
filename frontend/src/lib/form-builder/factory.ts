import { nanoid } from "nanoid";

import type { FieldType } from "@/lib/forms/types";

export type { FieldType } from "@/lib/forms/types";

const LAYOUT_DEFAULTS: Record<string, { w: number; h: number }> = {
  "ui:header": { w: 12, h: 6 },
  "ui:kpi-grid": { w: 6, h: 4 },
  "ui:divider": { w: 12, h: 1 },
  "ui:banner": { w: 12, h: 3 },
  "ui:paginator": { w: 12, h: 4 },
  "field:text": { w: 6, h: 3 },
  "field:number": { w: 4, h: 3 },
};

export function defLayout(type: string) {
  return LAYOUT_DEFAULTS[type] ?? LAYOUT_DEFAULTS[`field:${type}`] ?? { w: 6, h: 3 };
}

export function newField(type: FieldType) {
  const id = `fld_${nanoid(6)}`;
  const typeLabels: Record<string, string> = {
    text: "Texto",
    textarea: "Área de texto", 
    number: "Número",
    email: "Email",
    checkbox: "Checkbox",
    date: "Fecha",
    document: "Archivo",
    image: "Imagen",
    select: "Selección"
  };
  const base = { id, label: typeLabels[type] || "Campo", required: false, esSubsanable: false, esEditableOperador: false, seMuestraEnGrilla: false } as any;

  if (type === "group") {
    return { type, id, key: `grupo_${nanoid(4)}`, label: "Grupo", required:false, minItems:0, maxItems:999, children: [] };
  }
  
  // Campos de referencia
  if (type === "ref:nombre") {
    return { type: "text", id, key: "nombre", label: "Nombre", required: false, esSubsanable: false, esEditableOperador: false, seMuestraEnGrilla: true };
  }
  if (type === "ref:apellido") {
    return { type: "text", id, key: "apellido", label: "Apellido", required: false, esSubsanable: false, esEditableOperador: false, seMuestraEnGrilla: true };
  }
  if (type === "ref:documento") {
    return { type: "text", id, key: "documento_numero", label: "Documento", required: false, esSubsanable: false, esEditableOperador: false, seMuestraEnGrilla: true };
  }
  if (type === "ref:documento_tipo") {
    return { type: "select", id, key: "documento_tipo", label: "Tipo Documento", required: false, options: [
      { value: "DNI", label: "DNI" },
      { value: "CUIL", label: "CUIL" },
      { value: "CUIT", label: "CUIT" },
      { value: "Pasaporte", label: "Pasaporte" }
    ], esSubsanable: false, esEditableOperador: false, seMuestraEnGrilla: false };
  }
  if (type === "ref:direccion") {
    return { type: "text", id, key: "direccion_calle", label: "Calle", required: false, esSubsanable: false, esEditableOperador: false, seMuestraEnGrilla: false };
  }
  if (type === "ref:direccion_numero") {
    return { type: "text", id, key: "direccion_numero", label: "Número", required: false, esSubsanable: false, esEditableOperador: false, seMuestraEnGrilla: false };
  }
  if (type === "ref:direccion_provincia") {
    return { type: "text", id, key: "direccion_provincia", label: "Provincia", required: false, esSubsanable: false, esEditableOperador: false, seMuestraEnGrilla: false };
  }
  if (type === "ref:direccion_municipio") {
    return { type: "text", id, key: "direccion_municipio", label: "Municipio", required: false, esSubsanable: false, esEditableOperador: false, seMuestraEnGrilla: false };
  }
  if (type === "info") {
    return { type, id, key: `info_${nanoid(4)}`, label: "Texto informativo", format:"text", html:"" };
  }
  if (type === "document") {
    return { ...base, type, key:`archivo`, accept:[".pdf",".jpg",".png"], maxSizeMB:5, isNewFileFlag:true };
  }
  if (type === "image") {
    return { ...base, type, key:`imagen`, accept:[".jpg",".jpeg",".png",".gif"], maxSizeMB:5, isNewFileFlag:true };
  }
  if (type === "sum") {
    return { ...base, type, key:`suma_${nanoid(4)}`, decimals:0, sources:[] };
  }
  if (type === "date") {
    return { ...base, type, key:`fecha` };
  }
  if (type === "time") {
    return { ...base, type, key:`hora`, placeholder:"14:30" };
  }
  if (type === "slider") {
    return { ...base, type, key:`slider_${nanoid(4)}`, min:0, max:100, step:1, showValue:true };
  }
  if (type === "rating") {
    return { ...base, type, key:`rating_${nanoid(4)}`, maxRating:5 };
  }
  if (type === "color") {
    return { ...base, type, key:`color`, placeholder:"#3B82F6" };
  }
  if (type === "currency") {
    return { ...base, type, key:`monto`, currency:"USD", locale:"en-US", min:0 };
  }
  if (type === "url") {
    return { ...base, type, key:`url`, placeholder:"https://ejemplo.com", showPreview:true };
  }
  if (type === "password") {
    return { ...base, type, key:`password`, showStrength:true };
  }
  if (type === "code") {
    return { ...base, type, key:`codigo_${nanoid(4)}`, language:"javascript", showLineNumbers:true, minRows:5, maxRows:15 };
  }
  if (type === "tags") {
    return { ...base, type, key:`tags_${nanoid(4)}`, maxTags:10 };
  }
  if (type === "switch") {
    return { ...base, type, key:`switch_${nanoid(4)}`, description:"" };
  }
  if (type === "date") {
    return { ...base, type, key:`fecha` };
  }
  if (type === "phone") {
    return { ...base, type, key:`telefono`, placeholder:"+54 11 1234-5678" };
  }
  if (type === "cuit_razon_social") {
    return { ...base, type, key:`cuit_rs_${nanoid(4)}` };
  }
  if (type === "number") {
    return { ...base, type, key:`numero`, min:undefined, max:undefined, step:undefined };
  }
  if (type === "textarea") {
    return { ...base, type, key:`descripcion`, placeholder:"", maxLength:undefined };
  }
  if (type === "text") {
    return { ...base, type, key:`texto`, placeholder:"", maxLength:undefined };
  }
  if (type === "email") {
    return { ...base, type, key:`email`, placeholder:"ejemplo@correo.com", maxLength:undefined };
  }
  // selects y checkbox
  if (type === "checkbox") {
    return { ...base, type, key:`acepta_terminos` };
  }
  return {
    ...base,
    type, // "select"|"dropdown"|"multiselect"|"select_with_filter"
    key: `seleccion`,
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
    colSpan: w, // Usar el ancho del layout como colSpan por defecto
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
      variant: "hero-glass",
      config: {
        background: {
          mode: "image" as const,
          imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop",
          overlay: {
            enabled: true,
            opacity: 0.15,
            blur: 0
          }
        },
        topbar: {
          enabled: true,
          position: "top-right" as const,
          actions: ["theme", "notifications", "profile", "logout"] as const,
          logoutLabel: "Cerrar Sesión"
        },
        card: {
          enabled: true,
          glass: {
            blur: 13,
            opacity: 0.8
          },
          leftIcon: {
            enabled: true,
            icon: "user",
            gradient: {
              from: "#F00B80",
              to: "#7928CA",
              angle: 45
            }
          },
          title: "{{ data.nombre }} {{ data.apellido }}",
          subtitle: "Legajo de Ciudadano",
          actions: [
            { id: "edit", icon: "edit", type: "navigate" as const, to: "/legajos/{{ meta.legajoId }}/editar" },
            { id: "print", icon: "printer", type: "command" as const, name: "print" as const }
          ]
        }
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
  
  if (type === "ui:paginator") {
    return {
      ...base,
      ui: { colSpan: 12 },
      config: {
        pages: [
          { id: "p1", title: "Página 1", fieldKeys: [] },
          { id: "p2", title: "Página 2", fieldKeys: [] }
        ],
        behavior: { create: "wizard", view: "sections" },
        variant: "stepper",
        show_progress: true,
        allow_jump: true,
        sticky_nav: false,
        glass: true,
        labels: { prev: "Anterior", next: "Siguiente", finish: "Finalizar" },
        initial_page: 0
      }
    };
  }

  if (type === "ui:relation") {
    return {
      ...base,
      config: {
        title: "Relaciones",
        description: "",
        target_template_id: "",
        target_template_name: "",
        cardinality: "one_to_many",
        selection: { required: false },
        search: { display_template: "{{ id }}", searchable_keys: [] },
        relations: []
      }
    };
  }

  return { ...base, config: {} };
}
