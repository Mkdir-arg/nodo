"use client";

import { apiUrl } from "./api";

export interface TokenPair {
  access: string;
  refresh: string;
}

function base(): string {
  // Solo para loguear la base efectiva (resuelta en runtime)
  return apiUrl("");
}

export async function login(username: string, password: string): Promise<TokenPair> {
  const url = apiUrl("token/"); // queda p.ej. http://localhost:8000/api/token/
  console.log("[auth] BASE =", base(), "LOGIN URL =", url);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      detail = (await res.json())?.detail ?? detail;
    } catch {}
    throw new Error(`Login failed: ${detail}`);
  }
  return res.json();
}

export async function refreshToken(refresh: string): Promise<{ access: string }> {
  const url = apiUrl("token/refresh/");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      detail = (await res.json())?.detail ?? detail;
    } catch {}
    throw new Error(`Refresh failed: ${detail}`);
  }
  return res.json();
}

export async function me(access: string) {
  const url = apiUrl("auth/me/");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${access}` },
  });

  if (!res.ok) {
    throw new Error(`Me failed: HTTP ${res.status}`);
  }
  return res.json();
}
