const API = process.env.NEXT_PUBLIC_API_BASE || "/api";

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export type FetchPlantillasParams = { search?: string; estado?: "ACTIVO"|"INACTIVO"; page?: number; page_size?: number; };

export const PlantillasService = {
  fetchPlantillas: (p: FetchPlantillasParams = {}) => {
    const q = new URLSearchParams();
    if (p.search) q.set("search", p.search);
    if (p.estado) q.set("estado", p.estado);
    if (p.page) q.set("page", String(p.page));
    if (p.page_size) q.set("page_size", String(p.page_size));
    return apiFetch(`/plantillas?${q.toString()}`);
  },
  fetchPlantilla: (id: string) => apiFetch(`/plantillas/${id}`),
  existsNombre: async (nombre: string, excludeId?: string) => {
    const q = new URLSearchParams({ nombre });
    if (excludeId) q.set("exclude_id", excludeId);
    const r = await apiFetch(`/plantillas/exists?${q.toString()}`);
    return r.exists as boolean; // true si YA existe
  },
  savePlantilla: (payload: any) => apiFetch(`/plantillas`, { method: "POST", body: JSON.stringify(payload) }),
  updatePlantilla: (id: string, payload: any) => apiFetch(`/plantillas/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
};
