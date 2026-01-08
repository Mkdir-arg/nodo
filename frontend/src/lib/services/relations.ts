import { getJSON, postJSON, deleteJSON } from "@/lib/api/index";

export const RelationsService = {
  list: (legajoId: string) =>
    getJSON<{ outgoing: any[]; incoming: any[] }>(`/api/legajos/${legajoId}/relations/`),

  create: (legajoId: string, payload: { target_legajo_id: string; relation_type: string; inverse_relation_type?: string }) =>
    postJSON(`/api/legajos/${legajoId}/relations/`, payload),

  delete: (legajoId: string, relationId: string) =>
    deleteJSON(`/api/legajos/${legajoId}/relations/${relationId}/`),
};
