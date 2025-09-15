"use client";

import { login as requestLogin, me as requestMe, refreshToken } from "@/services/auth";
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
    const data = await refreshToken(tokens.refresh);
    const access = data.access;
    if (!access) return null;

    setTokens({ access, refresh: tokens.refresh });
    return access;
  } catch {
    return null;
  }
}

export async function login(identifier: string, password: string, remember = true) {
  const tokens = await requestLogin(identifier, password);
  setTokens(tokens);

  if (!remember) {
    window.addEventListener("beforeunload", () => clearTokens());
  }
}

export async function me() {
  const tokens = getTokens();
  if (!tokens?.access) {
    throw new Error("No autenticado");
  }
  try {
    return await requestMe(tokens.access);
  } catch (error) {
    if (error instanceof Error && error.message.includes("HTTP 401")) {
      throw new Error("No autenticado");
    }
    throw error;
  }
}

export function logout() {
  clearTokens();
}
