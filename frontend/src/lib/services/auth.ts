export interface TokenPair {
  access: string;
  refresh: string;
}

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) throw new Error("NEXT_PUBLIC_API_BASE no está definido");
  return base.replace(/\/+$/, "");
}

export async function login(username: string, password: string): Promise<TokenPair> {
  const res = await fetch(`${apiBase()}/api/token/`, {
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
  const res = await fetch(`${apiBase()}/api/token/refresh/`, {
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
  const res = await fetch(`${apiBase()}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${access}` },
  });
  if (!res.ok) throw new Error(`Me failed: HTTP ${res.status}`);
  return res.json();
}
