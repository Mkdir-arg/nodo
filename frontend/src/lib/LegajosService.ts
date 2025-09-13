import { api } from './api';

export const LegajosService = {
  createLegajo: (data:any) => api.post('/legajos/', data),
  fetchLegajo: (id:string) => api.get(`/legajos/${id}/`),
};
