import { getApiBaseUrl } from "@/lib/env";

export async function fetcher<T>(url: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("No se configuró la URL de la API");
  }
  const res = await fetch(`${base}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    throw new Error('API error');
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: (url: string) => fetcher(url),
  post: (url: string, data: any) => fetcher(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url: string, data: any) => fetcher(url, { method: 'PUT', body: JSON.stringify(data) }),
};
