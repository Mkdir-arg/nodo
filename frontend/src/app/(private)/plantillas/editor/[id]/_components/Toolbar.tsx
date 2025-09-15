"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { plantillasKeys, saveLayout } from "@/lib/api/plantillas";
import type { FormLayout } from "@/lib/forms/types";
import {
  canvasNodesToLayout,
  canvasNodesToPreviewSchema,
  useCanvasGridContext,
} from "./CanvasGrid";
import { useToast } from "@/components/ui/toast-provider";

function formatUpdatedAt(value: string) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

interface ToolbarProps {
  plantillaId: string;
  layoutVersion: number;
  layoutDefinitionVersion: number;
  updatedAt: string;
  /** Si el editor tiene un modo de vista previa embebido, pasá este flag para alternar el label/estado. */
  isPreviewOpen?: boolean;
  /** Si querés que el botón de vista previa abra/cierre un panel embebido, pasá este handler.
   *  Si no lo pasás, el botón abrirá una nueva pestaña con la previsualización. */
  onTogglePreview?: () => void;
}

export default function Toolbar({
  plantillaId,
  layoutVersion,
  layoutDefinitionVersion,
  updatedAt,
  isPreviewOpen = false,
  onTogglePreview,
}: ToolbarProps) {
  const { nodes } = useCanvasGridContext();
  const queryClient = useQueryClient();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const saveMutation = useMutation({
    mutationFn: (layout: FormLayout) => saveLayout(plantillaId, layout),
    onSuccess: (data) => {
      queryClient.setQueryData(plantillasKeys.layout(plantillaId), data);
      showSuccessToast("Cambios guardados correctamente.");
    },
    onError: () => {
      showErrorToast("No se pudieron guardar los cambios.");
    },
  });

  const handleSave = useCallback(() => {
    const layout = canvasNodesToLayout(nodes, layoutDefinitionVersion);
    saveMutation.mutate(layout);
  }, [layoutDefinitionVersion, nodes, saveMutation]);

  const handlePreview = useCallback(() => {
    // Siempre guardamos el schema en localStorage para que la página de preview pueda leerlo si corresponde.
    const schema = canvasNodesToPreviewSchema(nodes);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("nodo.plantilla.preview", JSON.stringify(schema));
      }
    } catch {
      /* ignore localStorage errors */
    }

    // Si nos pasaron un toggle embebido, lo usamos.
    if (onTogglePreview) {
      onTogglePreview();
      return;
    }

    // Si no, abrimos una pestaña de preview dedicada.
    try {
      if (typeof window !== "undefined") {
        window.open("/plantillas/previsualizacion", "_blank", "noopener,noreferrer");
      }
    } catch {
      showErrorToast("No fue posible abrir la vista previa.");
    }
  }, [nodes, onTogglePreview, showErrorToast]);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Editor de plantilla
        </p>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Plantilla #{plantillaId}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Versión actual del layout:{" "}
          <span className="font-medium text-slate-700 dark:text-slate-200">{layoutVersion}</span>
        </p>
      </div>

      <div className="flex flex-col items-end gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Última actualización:{" "}
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {formatUpdatedAt(updatedAt)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isPreviewOpen ? "secondary" : "outline"}
            size="sm"
            onClick={handlePreview}
            aria-pressed={isPreviewOpen}
            className="text-xs"
          >
            {isPreviewOpen ? "Cerrar vista previa" : "Vista previa"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="text-xs"
          >
            {saveMutation.isPending ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </header>
  );
}
