import type { RelationNode, RelatedRecord } from './types';

// Ejemplo de configuración del nodo
export const exampleRelationNode: RelationNode = {
  id: "relation-1",
  type: "ui:relation",
  kind: "ui",
  config: {
    relation_type: "proyectos",
    inverse_relation_type: "empleados",
    target_plantilla_id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Proyectos Asignados",
    description: "Proyectos en los que participa el empleado",
    allow_create: true,
    allow_remove: true,
    display_fields: ["nombre", "fecha_inicio", "estado"],
    search_fields: ["nombre", "codigo"]
  }
};

// Ejemplo de registros relacionados
export const exampleRelatedRecords: RelatedRecord[] = [
  {
    id: "proj-1",
    nombre: "Sistema CRM",
    fecha_inicio: "15/01/2024",
    estado: "En Progreso",
    codigo: "CRM-2024"
  },
  {
    id: "proj-2",
    nombre: "App Mobile",
    fecha_inicio: "01/03/2024",
    estado: "Completado",
    codigo: "APP-2024"
  },
  {
    id: "proj-3",
    nombre: "Portal Web",
    fecha_inicio: "10/02/2024",
    estado: "En Planificación",
    codigo: "WEB-2024"
  }
];

// Ejemplo de resultados de búsqueda
export const exampleSearchResults: RelatedRecord[] = [
  {
    id: "proj-4",
    nombre: "Sistema de Inventario",
    fecha_inicio: "20/04/2024",
    estado: "En Progreso",
    codigo: "INV-2024"
  },
  {
    id: "proj-5",
    nombre: "Dashboard Analytics",
    fecha_inicio: "15/05/2024",
    estado: "En Planificación",
    codigo: "DASH-2024"
  }
];
