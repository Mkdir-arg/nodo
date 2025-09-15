import { deleteJSON, getJSON, patchJSON, postJSON, putJSON } from '@/lib/api';

export type FetchPlantillasParams = {
  search?: string;
  estado?: 'ACTIVO' | 'INACTIVO';
  page?: number;
  page_size?: number;
};

const qsOf = (o: Record<string, string | number | undefined>) => {
  const q = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') q.set(k, String(v));
  });
  return q.toString() ? `?${q.toString()}` : '';
};

const normalizeList = (res: any) => {
  if (Array.isArray(res)) return { count: res.length, results: res };
  if (res?.results) return { count: res.count ?? res.results.length, results: res.results };
  if (res?.items) return { count: res.total ?? res.items.length, results: res.items };
  return { count: res?.count ?? 0, results: res?.results ?? [] };
};

const getWithFallback = (a: string, b: string) => getJSON(a).catch(() => getJSON(b));

export const PlantillasService = {
  fetchPlantillas: async (p: FetchPlantillasParams = {}) => {
    const qs = qsOf({ search: p.search, estado: p.estado, page: p.page, page_size: p.page_size });
    const res = await getWithFallback(`/plantillas/${qs}`, `/formularios/${qs}`);
    return normalizeList(res);
  },

  fetchPlantilla: (id: string) => getWithFallback(`/plantillas/${id}/`, `/formularios/${id}/`),

  existsNombre: async (nombre: string, excludeId?: string) => {
    const qs = qsOf({ nombre: nombre?.trim(), exclude_id: excludeId });
    type ExistsResponse = { exists?: boolean };
    try {
      const r = await getJSON<ExistsResponse>(`/plantillas/exists/${qs}`);
      return Boolean(r?.exists);
    } catch {
      const r = await getJSON<ExistsResponse>(`/formularios/exists/${qs}`);
      return Boolean(r?.exists);
    }
  },

  savePlantilla: (payload: any) =>
    postJSON(`/plantillas/`, payload).catch(() => postJSON(`/formularios/`, payload)),

  updatePlantilla: (id: string, payload: any) =>
    putJSON(`/plantillas/${id}/`, payload).catch(() => putJSON(`/formularios/${id}/`, payload)),

  updateVisualConfig: (id: string, cfg: any) =>
    patchJSON(`/plantillas/${id}/visual-config/`, cfg),

  deletePlantilla: (id: string) =>
    deleteJSON(`/plantillas/${id}/`).catch(() => deleteJSON(`/formularios/${id}/`)),
};
