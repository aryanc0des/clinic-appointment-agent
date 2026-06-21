const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const CLINIC_IS_MOCK = process.env.NEXT_PUBLIC_CLINIC_MOCK_MODE !== "false";

const STAFF_TOKEN_KEY = "carebook_staff_access_token";
const STAFF_REFRESH_KEY = "carebook_staff_refresh_token";

export function getStaffToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STAFF_TOKEN_KEY);
}

export function setStaffTokens(access: string, refresh: string) {
  localStorage.setItem(STAFF_TOKEN_KEY, access);
  localStorage.setItem(STAFF_REFRESH_KEY, refresh);
}

export function clearStaffTokens() {
  localStorage.removeItem(STAFF_TOKEN_KEY);
  localStorage.removeItem(STAFF_REFRESH_KEY);
}

async function refreshStaffToken(): Promise<string | null> {
  const refresh = localStorage.getItem(STAFF_REFRESH_KEY);
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) { clearStaffTokens(); return null; }
    const data = await res.json();
    setStaffTokens(data.access_token, data.refresh_token ?? refresh);
    return data.access_token;
  } catch {
    clearStaffTokens();
    return null;
  }
}

export async function clinicApiRequest<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options as RequestInit & { skipAuth?: boolean };
  const headers = new Headers(fetchOptions.headers);
  headers.set("Content-Type", "application/json");

  if (!skipAuth) {
    const token = getStaffToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${API_BASE}${path}`;
  let res = await fetch(url, { ...fetchOptions, headers });

  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshStaffToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(url, { ...fetchOptions, headers });
    } else {
      clearStaffTokens();
      if (typeof window !== "undefined") window.location.href = "/clinic/login";
      throw new Error("Session expired.");
    }
  }

  if (!res.ok) {
    let detail = `Request failed: ${res.status}`;
    try { const err = await res.json(); detail = err.detail ?? detail; } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
