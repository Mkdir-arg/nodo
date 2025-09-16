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
  Folder,
  Tabs as TabsIcon,
  Copy
} from "lucide-react";
import type { FieldType } from "@/lib/forms/types";

interface PaletteItem {
  type: FieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: "text",
    label: "Texto",
    icon: Type,
    description: "Campo de texto simple"
  },
  {
    type: "textarea",
    label: "Área de texto",
    icon: FileText,
    description: "Campo de texto multilínea"
  },
  {
    type: "number",
    label: "Número",
    icon: Hash,
    description: "Campo numérico"
  },
  {
    type: "date",
    label: "Fecha",
    icon: Calendar,
    description: "Selector de fecha"
  },
  {
    type: "select",
    label: "Selección",
    icon: List,
    description: "Lista desplegable"
  },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: CheckSquare,
    description: "Casilla de verificación"
  },
  {
    type: "section",
    label: "Sección",
    icon: Folder,
    description: "Contenedor de campos"
  },
  {
    type: "tabs",
    label: "Pestañas",
    icon: TabsIcon,
    description: "Contenedor con pestañas"
  },
  {
    type: "repeater",
    label: "Repetidor",
    icon: Copy,
    description: "Lista de elementos repetibles"
  },
];

interface PaletteProps {
  onAddField: (type: FieldType) => void;
}

export function Palette({ onAddField }: PaletteProps) {
  return (
    <Card className="w-64 h-fit">
      <CardHeader>
        <CardTitle className="text-sm">Campos disponibles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {PALETTE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.type}
              variant="outline"
              className="w-full justify-start h-auto p-3"
              onClick={() => onAddField(item.type)}
              role="option"
              aria-label={`Agregar ${item.label}: ${item.description}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}