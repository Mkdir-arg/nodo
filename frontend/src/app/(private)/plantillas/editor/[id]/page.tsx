"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getPlantillaLayoutQueryOptions } from "@/lib/api/plantillas";

import Palette from "./_components/Palette";
import CanvasGrid, { CanvasGridProvider } from "./_components/CanvasGrid";
import PropertiesPanel from "./_components/PropertiesPanel";
import Toolbar from "./_components/Toolbar";
import Preview from "./_components/Preview";

export default function PlantillaEditorPage() {
  const params = useParams();
  const rawId = (params as any)?.id;
  const plantillaId = Array.isArray(rawId) ? rawId[0] : rawId ?? "";

  const layoutQuery = useQuery({
    ...getPlantillaLayoutQueryOptions(plantillaId || "placeholder"),
    enabled: Boolean(plantillaId),
  });

  const layout = layoutQuery.data?.layout;
  const layoutVersion = layoutQuery.data?.layoutVersion ?? 1;
  const updatedAt = layoutQuery.data?.updatedAt ?? "";
  const layoutDefinitionVersion = layout?.version ?? 1;

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleTogglePreview = useCallback(() => {
    setIsPreviewOpen((prev) => !prev);
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  if (!plantillaId) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
        Falta el identificador de la plantilla.
      </div>
    );
  }

  if (layoutQuery.isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200">
        Cargando editor…
      </div>
    );
  }

  if (layoutQuery.isError || !layoutQuery.data) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-200">
        No fue posible cargar el layout de la plantilla.
      </div>
    );
  }

  return (
    <CanvasGridProvider layout={layout} key={`${plantillaId}-${layoutVersion}`}>
      <div className="flex flex-1 flex-col gap-4">
        <Toolbar
          plantillaId={plantillaId}
          layoutVersion={layoutVersion}
          layoutDefinitionVersion={layoutDefinitionVersion}
          updatedAt={updatedAt}
          isPreviewOpen={isPreviewOpen}
          onTogglePreview={handleTogglePreview}
        />

        <div className="grid min-h-[28rem] flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)_minmax(15rem,20rem)]">
          <Palette />
          <CanvasGrid />
          <PropertiesPanel />
        </div>

        <Preview open={isPreviewOpen} onClose={handleClosePreview} />
      </div>
    </CanvasGridProvider>
  );
}
