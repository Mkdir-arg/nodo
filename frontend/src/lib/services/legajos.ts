import { getJSON, postJSON } from '@/lib/api';

export const LegajosService = {
  create: (payload: { plantilla_id: string; data: any }) =>
    postJSON(`/legajos/`, payload),
  list: (
    params: { formId?: string; page?: number; page_size?: number; search?: string } = {}
  ) => {
    const q = new URLSearchParams();
    if (params.formId) q.set('plantilla_id', params.formId);
    if (params.page) q.set('page', String(params.page));
    if (params.page_size) q.set('page_size', String(params.page_size));
    if (params.search) q.set('search', params.search);
    const qs = q.toString();
    return getJSON(`/legajos/${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => getJSON(`/legajos/${id}/`),
};
