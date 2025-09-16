import { queryOptions } from "@tanstack/react-query";
import { getJSON, putJSON } from "@/lib/api";
import type { FormLayout } from "@/lib/forms/types";

export interface PlantillaLayoutResponse {
  id: string;
  layout_json?: unknown;
  layout_version?: number;
  updated_at: string;
}

export interface PlantillaLayout {
  id: string;
  layout: FormLayout;
  layoutVersion: number;
  updatedAt: string;
}

export const DEFAULT_FORM_LAYOUT: FormLayout = { version: 1, nodes: [] };

// ANTES: `/api/plantillas/${id}/layout/`  →  genera /api/api/...
const layoutPath = (plantillaId: string) => `plantillas/${plantillaId}/layout/`;

function isFormLayout(value: unknown): value is FormLayout {
  if (!value || typeof value !== "object") return false;
  const layout = value as Partial<FormLayout>;
  return typeof layout.version === "number" && Array.isArray(layout.nodes);
}

function toFormLayout(input: unknown): FormLayout {
  if (isFormLayout(input)) {
    return {
      version: input.version,
      nodes: Array.isArray(input.nodes) ? [...input.nodes] : [],
    };
  }
  return { version: DEFAULT_FORM_LAYOUT.version, nodes: [] };
}

function normalizeLayout(response: PlantillaLayoutResponse): PlantillaLayout {
  const layoutVersion = typeof response.layout_version === "number" ? response.layout_version : 1;
  return {
    id: response.id,
    layout: toFormLayout(response.layout_json),
    layoutVersion,
    updatedAt: response.updated_at,
  };
}

export async function getLayout(plantillaId: string): Promise<PlantillaLayout> {
  const response = await getJSON<PlantillaLayoutResponse>(layoutPath(plantillaId));
  return normalizeLayout(response);
}

export async function saveLayout(plantillaId: string, layout: FormLayout): Promise<PlantillaLayout> {
  const response = await putJSON<PlantillaLayoutResponse>(layoutPath(plantillaId), {
    layout_json: layout,
  });
  return normalizeLayout(response);
}

export const plantillasKeys = {
  all: ["plantillas"] as const,
  layout: (plantillaId: string) => ["plantillas", "layout", plantillaId] as const,
};

export function getPlantillaLayoutQueryOptions(plantillaId: string) {
  return queryOptions({
    queryKey: plantillasKeys.layout(plantillaId),
    queryFn: () => getLayout(plantillaId),
  });
}
