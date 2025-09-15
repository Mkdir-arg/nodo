"use client";

import { getJSON, postJSON } from "@/lib/api";
import { Tokens, clearStoredTokens, getStoredTokens, storeTokens } from "@/lib/tokens";

export function getTokens(): Tokens | null {
  return getStoredTokens();
}

export function setTokens(t: Tokens) {
  storeTokens(t);
}

export function clearTokens() {
  clearStoredTokens();
}

export async function refreshAccessToken(): Promise<string | null> {
  const tokens = getTokens();
  if (!tokens) return null;

  try {
    const data = await postJSON<{ access: string }>("/api/token/refresh/", {
      refresh: tokens.refresh,
    });
    const access = data.access;
    if (!access) return null;

    setTokens({ access, refresh: tokens.refresh });
    return access;
  } catch {
    return null;
  }
}

export async function login(identifier: string, password: string, remember = true) {
  try {
    const data = await postJSON<Tokens>("/api/token/", {
      username: identifier,
      password,
    });
    setTokens(data);

    if (!remember) {
      window.addEventListener("beforeunload", () => clearTokens());
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("HTTP")) {
      throw new Error("Credenciales inválidas");
    }
    throw error;
  }
}

export async function me() {
  try {
    return await getJSON("/api/auth/me/");
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("HTTP 401")) {
      throw new Error("No autenticado");
    }
    throw error;
  }
}

export function logout() {
  clearTokens();
}
