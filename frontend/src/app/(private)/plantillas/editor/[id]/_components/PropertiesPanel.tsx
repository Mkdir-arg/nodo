"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import type { LayoutNode, FieldProps, SelectOption } from "@/lib/forms/types";

interface PropertiesPanelProps {
  selectedNode: LayoutNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<LayoutNode>) => void;
  onDeleteNode: (nodeId: string) => void;
}

export function PropertiesPanel({ selectedNode, onUpdateNode, onDeleteNode }: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="text-sm">Propiedades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Selecciona un campo para editar sus propiedades
          </p>
        </CardContent>
      </Card>
    );
  }

  const updateField = (updates: Partial<FieldProps>) => {
    onUpdateNode(selectedNode.id, {
      field: { ...selectedNode.field, ...updates } as FieldProps
    });
  };

  const updateLayout = (updates: { colSpan?: number; row?: number; col?: number }) => {
    onUpdateNode(selectedNode.id, updates);
  };

  const addOption = () => {
    if (selectedNode.field && "options" in selectedNode.field) {
      const newOptions = [
        ...selectedNode.field.options,
        { label: "Nueva opción", value: `opt_${Date.now()}` }
      ];
      updateField({ options: newOptions } as any);
    }
  };

  const updateOption = (index: number, option: SelectOption) => {
    if (selectedNode.field && "options" in selectedNode.field) {
      const newOptions = [...selectedNode.field.options];
      newOptions[index] = option;
      updateField({ options: newOptions } as any);
    }
  };

  const removeOption = (index: number) => {
    if (selectedNode.field && "options" in selectedNode.field) {
      const newOptions = selectedNode.field.options.filter((_, i) => i !== index);
      updateField({ options: newOptions } as any);
    }
  };

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Propiedades
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteNode(selectedNode.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Layout Properties */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">DISEÑO</Label>
          
          <div>
            <Label htmlFor="colSpan">Ancho (columnas)</Label>
            <Select
              value={selectedNode.colSpan.toString()}
              onValueChange={(value) => updateLayout({ colSpan: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} columna{num > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Field Properties */}
        {selectedNode.field && "name" in selectedNode.field && (
          <div className="space-y-4">
            <Label className="text-xs font-semibold text-muted-foreground">CAMPO</Label>
            
            <div>
              <Label htmlFor="name">Nombre del campo</Label>
              <Input
                id="name"
                value={selectedNode.field.name}
                onChange={(e) => updateField({ name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="label">Etiqueta</Label>
              <Input
                id="label"
                value={selectedNode.field.label || ""}
                onChange={(e) => updateField({ label: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={selectedNode.field.placeholder || ""}
                onChange={(e) => updateField({ placeholder: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={selectedNode.field.required || false}
                onCheckedChange={(checked) => updateField({ required: checked })}
              />
              <Label htmlFor="required">Campo requerido</Label>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={selectedNode.field.description || ""}
                onChange={(e) => updateField({ description: e.target.value })}
                rows={2}
              />
            </div>

            {/* Type-specific properties */}
            {selectedNode.field.type === "number" && (
              <>
                <div>
                  <Label htmlFor="min">Valor mínimo</Label>
                  <Input
                    id="min"
                    type="number"
                    value={selectedNode.field.min || ""}
                    onChange={(e) => updateField({ min: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="max">Valor máximo</Label>
                  <Input
                    id="max"
                    type="number"
                    value={selectedNode.field.max || ""}
                    onChange={(e) => updateField({ max: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </>
            )}

            {(selectedNode.field.type === "select" || selectedNode.field.type === "radio") && "options" in selectedNode.field && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Opciones</Label>
                  <Button variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {selectedNode.field.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Etiqueta"
                        value={option.label}
                        onChange={(e) => updateOption(index, { ...option, label: e.target.value })}
                      />
                      <Input
                        placeholder="Valor"
                        value={option.value}
                        onChange={(e) => updateOption(index, { ...option, value: e.target.value })}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}