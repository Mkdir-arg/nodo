"use client";


import { getApiBaseUrl } from "@/lib/env";

const API = getApiBaseUrl() || "http://localhost:8000";


type Tokens = { access: string; refresh: string };

const LS_ACCESS = "access_token";
const LS_REFRESH = "refresh_token";

function resolvePath(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

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

  const res = await fetch(resolvePath("/api/token/refresh/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: tokens.refresh }),
    credentials: "include",
  });

  if (!res.ok) return null;

  const data = await res.json();
  const access = data.access as string;
  setTokens({ access, refresh: tokens.refresh });
  return access;
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const target =
    typeof input === "string"
      ? resolvePath(input)
      : input instanceof URL
        ? resolvePath(input.toString())
        : input;

  let access = getTokens()?.access;
  const headers = new Headers(init.headers ?? {});

  if (access && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${access}`);
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const requestInit: RequestInit = {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
  };

  let res = await fetch(target, requestInit);
  if (res.status !== 401) return res;

  const newAccess = await refreshAccessToken();
  if (!newAccess) return res;

  headers.set("Authorization", `Bearer ${newAccess}`);
  res = await fetch(target, requestInit);
  return res;
}

export async function login(identifier: string, password: string, remember = true) {
  const body = { identifier, password, username: identifier };
  const res = await fetch(resolvePath("/api/token/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Credenciales inválidas");
  }

  const data = (await res.json()) as Tokens;
  setTokens(data);

  if (!remember) {
    window.addEventListener("beforeunload", () => clearTokens());
  }
}

export async function me() {
  const res = await authFetch("/api/auth/me/", { method: "GET" });
  if (!res.ok) throw new Error("No autenticado");
  return res.json();
}

export function logout() {
  clearTokens();
}
