import { http } from './http';

export type FetchPlantillasParams = {
  search?: string;
  estado?: 'ACTIVO' | 'INACTIVO';
  page?: number;
  page_size?: number;
};

const postPutWithFallback = async (method:'POST'|'PUT', pathA:string, pathB:string, payload:any) => {
  try { return await http(pathA, { method, body: JSON.stringify(payload) }); }
  catch { return await http(pathB, { method, body: JSON.stringify(payload) }); }
};

export const PlantillasService = {
  fetchPlantillas: (p: FetchPlantillasParams = {}) => {
    const q = new URLSearchParams();
    if (p.search) q.set('search', p.search);
    if (p.estado) q.set('estado', p.estado);
    if (p.page) q.set('page', String(p.page));
    if (p.page_size) q.set('page_size', String(p.page_size));
    return http(`/plantillas?${q}`).catch(() => http(`/formularios?${q}`));
  },
  fetchPlantilla: (id: string) => http(`/plantillas/${id}`).catch(()=>http(`/formularios/${id}`)),
  existsNombre: async (nombre:string, excludeId?:string) => {
    const q = new URLSearchParams({ nombre });
    if (excludeId) q.set('exclude_id', excludeId);
    try {
      const res = await http(`/plantillas/exists?${q}`);
      return !!res.exists;
    } catch {
      const res = await http(`/formularios/exists?${q}`);
      return !!res.exists;
    }
  },
  savePlantilla: (payload:any) => postPutWithFallback('POST', `/plantillas`, `/formularios`, payload),
  updatePlantilla: (id:string, payload:any) => postPutWithFallback('PUT', `/plantillas/${id}`, `/formularios/${id}`, payload),
  deletePlantilla: (id:string) => http(`/plantillas/${id}`, { method: 'DELETE' }).catch(() => http(`/formularios/${id}`, { method: 'DELETE' })),
};
