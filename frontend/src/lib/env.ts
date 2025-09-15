const RAW_API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

function normalizeForBrowser(url: string) {
  if (typeof window !== "undefined" && url.includes("://backend:")) {
    return url.replace("://backend:", "://localhost:");
  }
  return url;
}

export function getApiBaseUrl() {
  let base = RAW_API_URL;

  if (!base && typeof window !== "undefined") {
    base = window.location.origin.replace(/\/$/, "");
  }

  return normalizeForBrowser(base);
}
