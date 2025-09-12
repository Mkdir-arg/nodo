import { Template } from "./schema";
import { nanoid } from "nanoid";

export const legajoCiudadano: Template = {
  id: "tmpl_ciudadano",
  name: "Legajo Ciudadano",
  slug: "legajo-ciudadano",
  version: "1.0.0",
  status: "published",
  fields: [
    { id: nanoid(), key: "nombre",   type:"text",    label:"Nombre", required:true },
    { id: nanoid(), key: "apellido", type:"text",    label:"Apellido", required:true },
    { id: nanoid(), key: "dni",      type:"text",    label:"DNI" },
    { id: nanoid(), key: "fecha_nac",type:"date",    label:"Fecha de nacimiento" },
    { id: nanoid(), key: "telefono", type:"text",    label:"Teléfono" },
    { id: nanoid(), key: "genero",   type:"select",  label:"Género", options:[
      {value:"f",label:"Femenino"},{value:"m",label:"Masculino"},{value:"x",label:"No binario"},{value:"o",label:"Otro"}
    ]},
    { id: nanoid(), key: "notas",    type:"textarea",label:"Notas" },
    { id: nanoid(), key: "acepta",   type:"boolean", label:"Acepta términos" }
  ],
  layout: [
    { type:"row", children:[
      { type:"col", span:6, children:[ {type:"field", fieldKey:"nombre"}, {type:"field", fieldKey:"apellido"}, {type:"field", fieldKey:"dni"} ]},
      { type:"col", span:6, children:[ {type:"field", fieldKey:"fecha_nac"}, {type:"field", fieldKey:"telefono"}, {type:"field", fieldKey:"genero"} ]}
    ]},
    { type:"section", label:"Notas", children:[ {type:"field", fieldKey:"notas"}, {type:"field", fieldKey:"acepta"} ] }
  ],
  rules: []
};
