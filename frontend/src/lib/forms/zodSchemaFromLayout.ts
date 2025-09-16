import { z } from "zod";
import type { FormLayout, LayoutNode, FieldProps } from "./types";

function createFieldSchema(field: FieldProps): z.ZodTypeAny {
  switch (field.type) {
    case "text":
    case "textarea": {
      let schema = z.string();
      if (field.required) {
        schema = schema.min(1, "Este campo es requerido");
      }
      return schema;
    }
    
    case "number": {
      let schema = z.coerce.number();
      if (field.min !== undefined) schema = schema.min(field.min);
      if (field.max !== undefined) schema = schema.max(field.max);
      if (field.required) {
        schema = schema.refine(val => !isNaN(val), "Número requerido");
      }
      return schema;
    }
    
    case "date": {
      let schema = z.string().refine(val => !isNaN(Date.parse(val)), "Fecha inválida");
      if (field.required) {
        schema = schema.min(1, "Fecha requerida");
      }
      return schema;
    }
    
    case "select": {
      const values = field.options.map(opt => opt.value);
      let schema = z.enum(values as [string, ...string[]]);
      if (!field.required) {
        schema = schema.optional();
      }
      return schema;
    }
    
    case "multiselect": {
      const values = field.options.map(opt => opt.value);
      let schema = z.array(z.enum(values as [string, ...string[]]));
      if (field.required) {
        schema = schema.min(1, "Seleccione al menos una opción");
      }
      return schema;
    }
    
    case "radio": {
      const values = field.options.map(opt => opt.value);
      let schema = z.enum(values as [string, ...string[]]);
      if (!field.required) {
        schema = schema.optional();
      }
      return schema;
    }
    
    case "checkbox":
    case "switch": {
      let schema = z.boolean();
      if (field.required) {
        schema = schema.refine(val => val === true, "Este campo es requerido");
      }
      return schema;
    }
    
    case "file": {
      let schema = z.any();
      if (field.maxSizeMB) {
        schema = schema.refine(
          (file: File) => file.size <= (field.maxSizeMB! * 1024 * 1024),
          `Archivo debe ser menor a ${field.maxSizeMB}MB`
        );
      }
      if (field.accept?.length) {
        schema = schema.refine(
          (file: File) => field.accept!.some(type => file.type.includes(type)),
          `Tipo de archivo no permitido`
        );
      }
      return schema;
    }
    
    default:
      return z.any();
  }
}

function processNodes(nodes: LayoutNode[]): Record<string, z.ZodTypeAny> {
  const schemaFields: Record<string, z.ZodTypeAny> = {};
  
  for (const node of nodes) {
    if (node.kind === "field" && node.field) {
      if ("name" in node.field) {
        schemaFields[node.field.name] = createFieldSchema(node.field);
      }
    } else if (node.kind === "container") {
      // Procesar hijos recursivamente
      if (node.children) {
        const childFields = processNodes(node.children);
        Object.assign(schemaFields, childFields);
      }
      
      if (node.tabsChildren) {
        for (const tabNodes of Object.values(node.tabsChildren)) {
          const tabFields = processNodes(tabNodes);
          Object.assign(schemaFields, tabFields);
        }
      }
      
      // Para repeater, crear schema de array
      if (node.containerType === "repeater" && node.children) {
        const itemSchema = z.object(processNodes(node.children));
        // Usar un nombre base para el repeater
        const repeaterName = `repeater_${node.id}`;
        schemaFields[repeaterName] = z.array(itemSchema);
      }
    }
  }
  
  return schemaFields;
}

export function zodSchemaFromLayout(layout: FormLayout): z.ZodObject<any> {
  const schemaFields = processNodes(layout.nodes);
  return z.object(schemaFields);
}
