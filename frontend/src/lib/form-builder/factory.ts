import { nanoid } from "nanoid";

export type FieldType =
  | "text"|"textarea"|"number"
  | "select"|"dropdown"|"multiselect"|"select_with_filter"
  | "date"|"document"|"sum"|"phone"|"cuit_razon_social"
  | "info"|"group";

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
