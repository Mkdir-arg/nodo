"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Undo, Redo, Save, Eye, EyeOff } from "lucide-react";

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onTogglePreview: () => void;
  isPreview: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
}

export function Toolbar({
  onUndo,
  onRedo,
  onSave,
  onTogglePreview,
  isPreview,
  canUndo,
  canRedo,
  isSaving,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-4 border-b bg-background">
      <Button
        variant="outline"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Deshacer"
      >
        <Undo className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="Rehacer"
      >
        <Redo className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6" />
      
      <Button
        variant="outline"
        size="sm"
        onClick={onTogglePreview}
        aria-label={isPreview ? "Salir de vista previa" : "Vista previa"}
      >
        {isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {isPreview ? "Editar" : "Vista previa"}
      </Button>
      
      <Separator orientation="vertical" className="h-6" />
      
      <Button
        onClick={onSave}
        disabled={isSaving}
        size="sm"
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? "Guardando..." : "Guardar"}
      </Button>
    </div>
  );
}