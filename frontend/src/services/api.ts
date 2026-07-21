/**
 * Base HTTP utilities for all inventory API calls.
 *
 * The backend URL is configured via the VITE_API_URL environment variable
 * (set in docker-compose.yml / .env). Falls back to localhost for local dev.
 *
 * All functions throw on non-2xx responses so callers can .catch() or use
 * try/catch in async service functions.
 */

export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

// ─── Auth header ──────────────────────────────────────────────────────────────

// Set by AuthProvider on mount so api helpers don't need to import authService
// (which would create a circular dependency: authService → api → authService).
let _getToken: (() => string | null) | null = null;
let _onUnauthorized: (() => void) | null = null;

export function setTokenProvider(fn: () => string | null): void {
  _getToken = fn;
}

/** Called by AuthProvider so the api layer can trigger logout on 401. */
export function setUnauthorizedHandler(fn: () => void): void {
  _onUnauthorized = fn;
}

function authHeaders(): Record<string, string> {
  const token = _getToken?.();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleUnauthorized(): never {
  _onUnauthorized?.();
  throw new Error("UNAUTHORIZED");
}

/**
 * Builds a query string from a set of parameters, skipping null/undefined/empty values.
 * e.g. buildQuery({ pageKey: 0, pageSize: 100, search: "dell" }) → "?pageKey=0&pageSize=100&search=dell"
 */
export function buildQuery(
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue;
    sp.set(key, String(value));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/**
 * Repeatedly calls a paginated fetcher until a short/empty page is returned, accumulating all
 * rows. Used by export and detail views that genuinely need every matching row (the fetch is
 * still bounded by the server-side filter passed into `fetchPage`).
 */
export async function fetchAllPages<T>(
  fetchPage: (pageKey: number, pageSize: number) => Promise<T[]>,
  pageSize = 500
): Promise<T[]> {
  const all: T[] = [];
  let pageKey = 0;
  for (;;) {
    const batch = await fetchPage(pageKey, pageSize);
    all.push(...batch);
    if (batch.length < pageSize) break;
    pageKey += 1;
  }
  return all;
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: authHeaders(),
  });
  if (res.status === 401) handleUnauthorized();
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `GET ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** Like apiGet but returns null on 404 instead of throwing. */
export async function apiGetOrNull<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: authHeaders(),
  });
  if (res.status === 401) handleUnauthorized();
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `GET ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (res.status === 401) handleUnauthorized();
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `POST ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** Like apiPost but expects no JSON response body (e.g. 201 with plain-text). */
export async function apiPostVoid(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (res.status === 401) handleUnauthorized();
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `POST ${path} failed: ${res.status} ${res.statusText}`);
  }
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (res.status === 401) handleUnauthorized();
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `PUT ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPutVoid(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (res.status === 401) handleUnauthorized();
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `PUT ${path} failed: ${res.status} ${res.statusText}`);
  }
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (res.status === 401) handleUnauthorized();
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `DELETE ${path} failed: ${res.status} ${res.statusText}`);
  }
}
