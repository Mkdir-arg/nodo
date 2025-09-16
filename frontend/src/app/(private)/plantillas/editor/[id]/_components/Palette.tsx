"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Type, Hash, Calendar, CheckSquare, List } from "lucide-react";
import type { FieldType } from "@/lib/forms/types";

const FIELDS = [
  { type: "text" as FieldType, label: "Texto", icon: Type },
  { type: "number" as FieldType, label: "Número", icon: Hash },
  { type: "date" as FieldType, label: "Fecha", icon: Calendar },
  { type: "select" as FieldType, label: "Selección", icon: List },
  { type: "checkbox" as FieldType, label: "Checkbox", icon: CheckSquare },
];

export function Palette({ onAddField }: { onAddField: (type: FieldType) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Campos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {FIELDS.map(({ type, label, icon: Icon }) => (
          <Button
            key={type}
            variant="outline"
            className="w-full justify-start"
            onClick={() => onAddField(type)}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}