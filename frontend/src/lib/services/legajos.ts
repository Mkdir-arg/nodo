import { http } from './http';

export const LegajosService = {
  create: (payload: { formulario: string; data: any }) =>
    http('/legajos/', { method: 'POST', body: JSON.stringify(payload) }),
  // (Opcional) listar y detalle:
  list: (
    params: { formId?: string; page?: number; page_size?: number } = {}
  ) => {
    const q = new URLSearchParams();
    if (params.formId) q.set('formulario', params.formId);
    if (params.page) q.set('page', String(params.page));
    if (params.page_size) q.set('page_size', String(params.page_size));
    return http(`/legajos/${q.toString() ? `?${q}` : ''}`);
  },
  get: (id: string) => http(`/legajos/${id}/`),
};
