"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getPlantillaLayoutQueryOptions } from "@/lib/api/plantillas";
import DynamicFormRenderer from "@/lib/forms/runtime/DynamicFormRenderer";
import type { CollectOptions } from "@/lib/forms/zodSchemaFromLayout";
import { PlantillasService } from "@/lib/services/plantillas";

type PlantillaDetail = { schema?: unknown; nombre?: string };

const EMPTY_FIELDS: NonNullable<CollectOptions["fields"]> = [];

function extractSchemaFields(schema: unknown): NonNullable<CollectOptions["fields"]> {
  if (!schema || typeof schema !== "object") return EMPTY_FIELDS;
  const result: any[] = [];
  const asArray = (value: any) => (Array.isArray(value) ? value : value ? [value] : []);

  const visit = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (!node || typeof node !== "object") return;
      const type = String((node as any).type || "").toLowerCase();
      if (type === "section") {
        visit(asArray((node as any).children || (node as any).nodes));
        return;
      }
      if (type === "tabs") {
        const tabsChildren = (node as any).tabsChildren;
        if (tabsChildren && typeof tabsChildren === "object") {
          Object.values(tabsChildren).forEach((children: any) => {
            visit(asArray(children));
          });
        }
        return;
      }
      if (type === "repeater") {
        const baseKey = typeof (node as any).key === "string" ? (node as any).key : undefined;
        asArray((node as any).children).forEach((child: any) => {
          if (!child || typeof child !== "object") return;
          const cloned = { ...child };
          if (baseKey && typeof cloned.key === "string") {
            cloned.key = `${baseKey}.${cloned.key}`;
          }
          visit([cloned]);
        });
        return;
      }
      if (type === "group") {
        const baseKey = typeof (node as any).key === "string" ? (node as any).key : undefined;
        asArray((node as any).children).forEach((child: any) => {
          if (!child || typeof child !== "object") return;
          const cloned = { ...child };
          if (baseKey && typeof cloned.key === "string") {
            cloned.key = `${baseKey}.${cloned.key}`;
          }
          result.push(cloned);
        });
        return;
      }
      result.push(node);
    });
  };

  if (Array.isArray((schema as any).nodes)) visit((schema as any).nodes);
  else if (Array.isArray((schema as any).sections)) visit((schema as any).sections);
  else if (Array.isArray(schema)) visit(schema as any[]);

  return result;
}

export default function PlantillaRenderPage() {
  const params = useParams();
  const rawId = (params as any)?.id;
  const plantillaId = Array.isArray(rawId) ? rawId[0] : rawId ?? "";

  const layoutQuery = useQuery({
    ...getPlantillaLayoutQueryOptions(plantillaId || "placeholder"),
    enabled: Boolean(plantillaId),
  });

  const plantillaQuery = useQuery({
    queryKey: ["plantillas", "detail", plantillaId],
    queryFn: () => PlantillasService.fetchPlantilla(plantillaId),
    enabled: Boolean(plantillaId),
  });

  const plantillaData = plantillaQuery.data as PlantillaDetail | undefined;
  const schemaSource = plantillaData?.schema;
  const plantillaNombre = plantillaData?.nombre;

  const schemaFields = useMemo(() => extractSchemaFields(schemaSource), [schemaSource]);

  if (!plantillaId) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
        Falta el identificador de la plantilla.
      </div>
    );
  }

  if (layoutQuery.isLoading || plantillaQuery.isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200">
        Cargando formulario…
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

  if (plantillaQuery.isError) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-200">
        No fue posible obtener los detalles de la plantilla.
      </div>
    );
  }

  const layout = (layoutQuery.data as any).layout;
  const nombre = plantillaNombre ?? "Formulario";

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{nombre}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Completá los campos para validar el comportamiento del layout.
        </p>
      </header>

      <DynamicFormRenderer
        layout={layout}
        fields={schemaFields}
        submitLabel="Enviar"
        onSubmit={(values) => {
          // eslint-disable-next-line no-console
          console.log("Formulario enviado", values);
        }}
      />
    </div>
  );
}
