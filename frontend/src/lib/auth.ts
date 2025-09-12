"use client";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Tokens = { access: string; refresh: string };

const LS_ACCESS = "access_token";
const LS_REFRESH = "refresh_token";

export function getTokens(): Tokens | null {
  const access = typeof window !== "undefined" ? localStorage.getItem(LS_ACCESS) : null;
  const refresh = typeof window !== "undefined" ? localStorage.getItem(LS_REFRESH) : null;
  return access && refresh ? { access, refresh } : null;
}

export function setTokens(t: Tokens) {
  localStorage.setItem(LS_ACCESS, t.access);
  localStorage.setItem(LS_REFRESH, t.refresh);
}

export function clearTokens() {
  localStorage.removeItem(LS_ACCESS);
  localStorage.removeItem(LS_REFRESH);
}

async function refreshAccessToken(): Promise<string | null> {
  const tokens = getTokens();
  if (!tokens) return null;
  const res = await fetch(`${API}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: tokens.refresh }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const access = data.access as string;
  setTokens({ access, refresh: tokens.refresh });
  return access;
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  let access = getTokens()?.access;
  const headers = new Headers(init.headers);
  if (access) headers.set("Authorization", `Bearer ${access}`);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");

  let res = await fetch(input, { ...init, headers });
  if (res.status !== 401) return res;

  // reintento con refresh
  const newAccess = await refreshAccessToken();
  if (!newAccess) return res;
  headers.set("Authorization", `Bearer ${newAccess}`);
  res = await fetch(input, { ...init, headers });
  return res;
}

export async function login(identifier: string, password: string, remember = true) {
  const body = { identifier, password, username: identifier }; // backend aceptará email/username
  const res = await fetch(`${API}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Credenciales inválidas");
  }
  const data = (await res.json()) as Tokens;
  setTokens(data);
  if (!remember) {
    // opción simple: limpiar refresh al cerrar tab
    window.addEventListener("beforeunload", () => clearTokens());
  }
}

export async function me() {
  const res = await authFetch(`${API}/api/auth/me/`, { method: "GET" });
  if (!res.ok) throw new Error("No autenticado");
  return res.json();
}

export function logout() {
  clearTokens();
  // Opcional: invalidate react-query aquí si lo usás
}
