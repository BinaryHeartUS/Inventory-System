import { API_BASE } from "./api";
import { getAuthConfig } from "./authConfig";
import { clearStoredAuth, getTokenExpiration, setStoredAuth } from "./authService";
import type { LoginResponse } from "../types/inventory";

const FLOW_KEY = "bh_oauth";
const FLOW_TTL = 10 * 60 * 1000;

interface LoginFlow {
  state: string;
  verifier: string;
  issuer: string;
  redirectUri: string;
  returnPath: string;
  createdAt: number;
}

export function safeInventoryPath(path: unknown): string {
  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    Array.from(path).some((character) => character.charCodeAt(0) <= 32)
  )
    return "/";
  const url = new URL(path, window.location.origin);
  if (url.origin !== window.location.origin || ["/login", "/auth/callback"].includes(url.pathname))
    return "/";
  return url.pathname + url.search + url.hash;
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function beginCentralLogin(returnPath: string): Promise<void> {
  const { issuer, clientId } = getAuthConfig();
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const state = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = base64url(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)))
  );
  const redirectUri = window.location.origin + "/auth/callback";
  const flow: LoginFlow = {
    state,
    verifier,
    issuer,
    redirectUri,
    returnPath: safeInventoryPath(returnPath),
    createdAt: Date.now(),
  };
  clearStoredAuth();
  sessionStorage.setItem(FLOW_KEY, JSON.stringify(flow));
  const url = new URL(issuer + "/api/oauth/authorize");
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
  }).toString();
  window.location.assign(url.href);
}

export async function finishCentralLogin(callbackUrl: string): Promise<string> {
  const { issuer, clientId } = getAuthConfig();
  const raw = sessionStorage.getItem(FLOW_KEY);
  sessionStorage.removeItem(FLOW_KEY);
  if (!raw) throw new Error("This sign-in request has expired. Please start again.");
  const flow: LoginFlow = JSON.parse(raw);
  const url = new URL(callbackUrl);
  const params = url.searchParams;
  if (
    typeof flow.createdAt !== "number" ||
    Date.now() - flow.createdAt > FLOW_TTL ||
    flow.createdAt > Date.now() ||
    typeof flow.verifier !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(flow.verifier) ||
    url.origin !== window.location.origin ||
    url.pathname !== "/auth/callback" ||
    flow.redirectUri !== window.location.origin + "/auth/callback" ||
    flow.issuer !== issuer ||
    params.getAll("state").length !== 1 ||
    params.get("state") !== flow.state ||
    params.getAll("iss").length !== 1 ||
    params.get("iss") !== issuer
  )
    throw new Error("Sign-in verification failed. Please start again.");
  if (params.has("error"))
    throw new Error("BinaryHeart sign-in was not completed. Please try again.");
  const code = params.get("code");
  if (!code || params.getAll("code").length !== 1)
    throw new Error("The sign-in response did not contain an authorization code.");
  const response = await fetch(issuer + "/api/oauth/token", {
    method: "POST",
    credentials: "omit",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      redirect_uri: flow.redirectUri,
      code_verifier: flow.verifier,
    }),
  });
  if (!response.ok) throw new Error("Unable to complete sign-in. Please start again.");
  const token: unknown = await response.json();
  if (
    !token ||
    typeof token !== "object" ||
    !("access_token" in token) ||
    typeof token.access_token !== "string" ||
    !("token_type" in token) ||
    token.token_type !== "Bearer" ||
    (getTokenExpiration(token.access_token) ?? 0) <= Date.now()
  )
    throw new Error("BinaryHeart returned an invalid access token.");

  // Only persist permissions normalized by Inventory after signature/issuer/audience verification.
  const session = await fetch(`${API_BASE}/auth/session`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store",
  });
  if (session.status === 401 || session.status === 403)
    throw new Error("This account does not have valid Inventory access. Contact an administrator.");
  if (!session.ok) throw new Error("Inventory could not verify your sign-in. Please try again.");
  const profile = (await session.json()) as LoginResponse;
  setStoredAuth({
    ...profile,
    issuer,
    chapterIds: profile.chapterRoles.map((assignment) => assignment.chapterId),
  });
  return safeInventoryPath(flow.returnPath);
}

export function centralLogout(): void {
  const { issuer, clientId } = getAuthConfig();
  clearStoredAuth();
  sessionStorage.removeItem(FLOW_KEY);
  const url = new URL(issuer + "/api/oauth/logout");
  url.search = new URLSearchParams({
    client_id: clientId,
    post_logout_redirect_uri: window.location.origin + "/login",
  }).toString();
  window.location.assign(url.href);
}
