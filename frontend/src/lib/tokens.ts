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

function isValidToken(token: string): boolean {
  return typeof token === 'string' && token.length > 0 && !/[<>"'&]/.test(token);
}

export function storeTokens(tokens: Tokens) {
  if (!hasWindow()) return;
  if (!isValidToken(tokens.access) || !isValidToken(tokens.refresh)) {
    console.warn('Invalid token format detected');
    return;
  }
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
    
    // También almacenar en cookies para el middleware
    document.cookie = `access_token=${tokens.access}; path=/; max-age=28800`; // 8 horas
    document.cookie = `refresh_token=${tokens.refresh}; path=/; max-age=604800`; // 7 días
  } catch {
    /* ignore quota errors */
  }
}

export function storeAccessToken(access: string) {
  if (!hasWindow()) return;
  if (!isValidToken(access)) {
    console.warn('Invalid access token format detected');
    return;
  }
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
    
    // Limpiar cookies también
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  } catch {
    /* ignore */
  }
}
