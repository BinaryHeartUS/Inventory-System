/**
 * Inventory's verified BinaryHeart session persistence.
 *
 * The JWT is stored in sessionStorage (not localStorage) so it is
 * automatically cleared when the browser tab is closed.
 *
 */

import type { ChapterRole } from "../types/inventory";
import { getAuthConfig } from "./authConfig";

const SESSION_KEY = "bh_auth";

// ─── Storage helpers ──────────────────────────────────────────────────────────

interface StoredAuth {
  issuer: string;
  token: string;
  username: string;
  chapterRoles: ChapterRole[];
  chapterIds: number[]; // derived from chapterRoles for use in services
  role: string;
}

export function getTokenExpiration(token: string): number | null {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;

    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof payload.exp === "number" && Number.isFinite(payload.exp)
      ? payload.exp * 1000
      : null;
  } catch {
    return null;
  }
}

export function getStoredAuth(): StoredAuth | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const auth = JSON.parse(raw) as StoredAuth;
    if (auth.issuer !== getAuthConfig().issuer) {
      clearStoredAuth();
      return null;
    }
    const expiresAt = getTokenExpiration(auth.token);
    if (expiresAt === null || expiresAt <= Date.now()) {
      clearStoredAuth();
      return null;
    }
    return auth;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: StoredAuth): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getStoredToken(): string | null {
  return getStoredAuth()?.token ?? null;
}
