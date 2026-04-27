/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { LoginResponse, ChapterRole } from '../types/inventory'
import { loginRequest, clearStoredAuth, getStoredAuth, getStoredToken } from '../services/authService'
import { setTokenProvider } from '../services/api'

// Register the token provider at module load time so API calls have auth headers
// immediately — including on page refresh before any useEffect fires.
setTokenProvider(getStoredToken)

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  token: string
  username: string
  chapterRoles: ChapterRole[]
  chapterIds: number[]   // derived from chapterRoles for backward compat
  role: string
}

interface AuthContextValue {
  auth: AuthState | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialise from sessionStorage so a page refresh keeps the user logged in
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const stored = getStoredAuth()
    if (!stored) return null
    // Ensure chapterIds is always derived (handles tokens stored before this field existed)
    return { ...stored, chapterIds: stored.chapterRoles?.map((cr: ChapterRole) => cr.chapterId) ?? stored.chapterIds ?? [] }
  })

  const login = useCallback(async (username: string, password: string) => {
    const response: LoginResponse = await loginRequest(username, password)
    const state: AuthState = {
      token:        response.token,
      username:     response.username,
      chapterRoles: response.chapterRoles,
      chapterIds:   response.chapterRoles.map(cr => cr.chapterId),
      role:         response.role,
    }
    setAuth(state)
  }, [])

  const logout = useCallback(() => {
    clearStoredAuth()
    setAuth(null)
  }, [])

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
