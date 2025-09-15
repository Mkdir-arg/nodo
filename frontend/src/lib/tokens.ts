export type Tokens = { access: string; refresh: string };

export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

const hasWindow = () => typeof window !== "undefined";

export function getAccessToken(): string | null {
  if (!hasWindow()) return null;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  if (!hasWindow()) return null;
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredTokens(): Tokens | null {
  const access = getAccessToken();
  const refresh = getRefreshToken();
  if (!access || !refresh) return null;
  return { access, refresh };
}

export function storeTokens(tokens: Tokens) {
  if (!hasWindow()) return;
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  } catch {
    /* ignore quota errors */
  }
}

export function storeAccessToken(access: string) {
  if (!hasWindow()) return;
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
  } catch {
    /* ignore quota errors */
  }
}

export function clearStoredTokens() {
  if (!hasWindow()) return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
