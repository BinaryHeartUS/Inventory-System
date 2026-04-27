import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

/**
 * Wraps any route that requires authentication.
 * Unauthenticated users are redirected to /login, with the original
 * path stored in location.state.from so they can be sent back after login.
 */
export default function ProtectedRoute({ children }: Props) {
  const { auth } = useAuth()
  const location = useLocation()

  if (!auth) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
