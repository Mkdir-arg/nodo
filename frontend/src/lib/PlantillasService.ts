import { api } from './api';

export const PlantillasService = {
  fetchPlantillas: () => api.get('/plantillas/'),
  fetchPlantilla: (id:string) => api.get(`/plantillas/${id}/`),
  existsNombre: (nombre:string, exclude_id?:string) => api.get(`/plantillas/exists?nombre=${encodeURIComponent(nombre)}${exclude_id?`&exclude_id=${exclude_id}`:''}`),
  savePlantilla: (data:any) => api.post('/plantillas/', data),
  updatePlantilla: (id:string, data:any) => api.put(`/plantillas/${id}/`, data),
  deletePlantilla: (id:string) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/plantillas/${id}/`, { method:'DELETE' })
};
