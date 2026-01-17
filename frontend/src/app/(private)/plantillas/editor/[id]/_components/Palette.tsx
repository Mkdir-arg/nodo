"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Type, 
  Hash, 
  Calendar, 
  CheckSquare, 
  List, 
  FileText, 
  Image,
  AlignLeft,
  Info,
  Calculator,
  Mail,
  Phone,
  Building2,
  CalendarDays
} from "lucide-react";
import type { FieldType } from "@/lib/forms/types";

const FIELD_GROUPS = [
  {
    title: "📝 Datos de Referencia",
    fields: [
      { type: "ref:nombre" as FieldType, label: "Nombre", icon: Type },
      { type: "ref:apellido" as FieldType, label: "Apellido", icon: Type },
      { type: "ref:documento" as FieldType, label: "Número Documento", icon: Hash },
      { type: "ref:documento_tipo" as FieldType, label: "Tipo Documento", icon: List },
      { type: "ref:direccion" as FieldType, label: "Calle", icon: Building2 },
      { type: "ref:direccion_numero" as FieldType, label: "Número", icon: Hash },
      { type: "ref:direccion_provincia" as FieldType, label: "Provincia", icon: Building2 },
      { type: "ref:direccion_municipio" as FieldType, label: "Municipio", icon: Building2 },
      { type: "phone" as FieldType, label: "Teléfono", icon: Phone },
      { type: "email" as FieldType, label: "Email", icon: Mail },
    ]
  },
  {
    title: "✉️ Campos Básicos",
    fields: [
      { type: "text" as FieldType, label: "Texto", icon: Type },
      { type: "number" as FieldType, label: "Número", icon: Hash },
      { type: "textarea" as FieldType, label: "Área de texto", icon: AlignLeft },
      { type: "checkbox" as FieldType, label: "Checkbox", icon: CheckSquare },
      { type: "select" as FieldType, label: "Selección", icon: List },
      { type: "info" as FieldType, label: "Información", icon: Info },
      { type: "sum" as FieldType, label: "Suma", icon: Calculator },
    ]
  },
  {
    title: "📅 Campos Avanzados",
    fields: [
      { type: "date" as FieldType, label: "Fecha", icon: Calendar },
      { type: "document" as FieldType, label: "Archivo", icon: FileText },
      { type: "image" as FieldType, label: "Imagen", icon: Image },
      { type: "cuit_razon_social" as FieldType, label: "CUIT + Razón Social", icon: Building2 },
    ]
  },
  {
    title: "🎨 Visuales",
    fields: [
      { type: "calendar" as FieldType, label: "Calendario", icon: CalendarDays },
    ]
  }
];

export function Palette({ onAddField }: { onAddField: (type: FieldType) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Campos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {FIELD_GROUPS.map((group) => (
          <div key={group.title} className="space-y-2">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.fields.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant="outline"
                  className="w-full justify-start text-sm hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950 dark:hover:border-blue-700 transition-colors"
                  onClick={() => onAddField(type)}
                >
                  <Icon className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}