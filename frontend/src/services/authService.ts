/**
 * Auth service — login, token persistence, and logout.
 *
 * The JWT is stored in sessionStorage (not localStorage) so it is
 * automatically cleared when the browser tab is closed.
 *
 * Endpoint: POST /api/auth/login → LoginResponse
 */

import { API_BASE } from './api'
import type { LoginResponse, ChapterRole } from '../types/inventory'

const SESSION_KEY = 'bh_auth'

// ─── Mock credentials (dev only) ─────────────────────────────────────────────
// Used when VITE_USE_MOCK=true so the frontend can be developed without
// a running backend. Remove or ignore in production.

const MOCK_USERS: Record<string, { password: string; chapterRoles: ChapterRole[]; role: string }> = {
  admin:        { password: 'admin',        chapterRoles: [{ chapterId: 1, role: 'Admin' }, { chapterId: 2, role: 'Admin' }, { chapterId: 3, role: 'Admin' }, { chapterId: 4, role: 'Admin' }, { chapterId: 5, role: 'Admin' }], role: 'Admin' },
  rosehulman:   { password: 'rosehulman',   chapterRoles: [{ chapterId: 1, role: 'Chapter Admin' }], role: 'Chapter Admin' },
  northwestern: { password: 'northwestern', chapterRoles: [{ chapterId: 2, role: 'Chapter Admin' }], role: 'Chapter Admin' },
  iu:           { password: 'iu',           chapterRoles: [{ chapterId: 3, role: 'Editor' }], role: 'Editor' },
  newtrier:     { password: 'newtrier',     chapterRoles: [{ chapterId: 4, role: 'Viewer' }], role: 'Viewer' },
  rosehulmaneditor: { password: 'rosehulmaneditor', chapterRoles: [{ chapterId: 1, role: 'Editor' }], role: 'Editor' },
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ─── Storage helpers ──────────────────────────────────────────────────────────

interface StoredAuth {
  token: string
  username: string
  chapterRoles: ChapterRole[]
  chapterIds: number[]  // derived from chapterRoles for use in services
  role: string
}

export function getStoredAuth(): StoredAuth | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

function setStoredAuth(auth: StoredAuth): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(auth))
}

export function clearStoredAuth(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function getStoredToken(): string | null {
  return getStoredAuth()?.token ?? null
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginRequest(username: string, password: string): Promise<LoginResponse> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300)) // simulate network
    const user = MOCK_USERS[username.toLowerCase()]
    if (!user || user.password !== password) throw new Error('Invalid username or password')
    const data: LoginResponse = { token: 'mock-token', username, chapterRoles: user.chapterRoles, role: user.role }
    setStoredAuth({ ...data, chapterIds: data.chapterRoles.map(cr => cr.chapterId) })
    return data
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (res.status === 401) throw new Error('Invalid username or password')
  if (res.status === 400) throw new Error('Username and password are required')
  if (!res.ok) throw new Error('Login failed — please try again')

  const data = (await res.json()) as LoginResponse
  setStoredAuth({ token: data.token, username: data.username, chapterRoles: data.chapterRoles, chapterIds: data.chapterRoles.map(cr => cr.chapterId), role: data.role })
  return data
}
