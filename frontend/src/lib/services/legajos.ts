// frontend/src/services/legajos.ts
"use client";

import { getJSON, postJSON } from "@/lib/api";

export type CrearLegajoPayload = {
  plantilla_id: string;              // UUID/ID de la plantilla
  data: Record<string, any>;         // objeto JSON (no string)
};

export const LegajosService = {
  // POST /api/legajos/
  create: (payload: CrearLegajoPayload) =>
    postJSON("/api/legajos/", payload),

  // GET /api/legajos/?plantilla_id=...&page=...&page_size=...&search=...
  list: (params: { formId?: string; page?: number; page_size?: number; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.formId) q.set("plantilla_id", params.formId);
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));
    if (params.search) q.set("search", params.search);
    const qs = q.toString();
    return getJSON<any>(`/api/legajos/${qs ? `?${qs}` : ""}`);
  },

  // GET /api/legajos/:id/
  get: (id: string) => getJSON<any>(`/api/legajos/${id}/`),
};
