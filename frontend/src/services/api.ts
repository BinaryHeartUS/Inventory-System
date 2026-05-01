/**
 * Base HTTP utilities for all inventory API calls.
 *
 * The backend URL is configured via the VITE_API_URL environment variable
 * (set in docker-compose.yml / .env). Falls back to localhost for local dev.
 *
 * All functions throw on non-2xx responses so callers can .catch() or use
 * try/catch in async service functions.
 */

export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

// ─── Auth header ──────────────────────────────────────────────────────────────

// Set by AuthProvider on mount so api helpers don't need to import authService
// (which would create a circular dependency: authService → api → authService).
let _getToken: (() => string | null) | null = null

export function setTokenProvider(fn: () => string | null): void {
  _getToken = fn
}

function authHeaders(): Record<string, string> {
  const token = _getToken?.()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: authHeaders(),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

/** Like apiPost but expects no JSON response body (e.g. 201 with plain-text). */
export async function apiPostVoid(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status} ${res.statusText}`)
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export async function apiPutVoid(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status} ${res.statusText}`)
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status} ${res.statusText}`)
}
