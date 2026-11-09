import { API_BASE } from "./api";

export interface AuthConfig {
  enabled: boolean;
  issuer: string;
  clientId: string;
}

let config: AuthConfig = { enabled: false, issuer: "", clientId: "inventory" };

export function getAuthConfig(): AuthConfig {
  return config;
}

export async function loadAuthConfig(): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/config`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load authentication configuration. Please reload.");
  const data: unknown = await response.json();
  if (
    !data ||
    typeof data !== "object" ||
    !("enabled" in data) ||
    typeof data.enabled !== "boolean" ||
    !("issuer" in data) ||
    typeof data.issuer !== "string" ||
    !("clientId" in data) ||
    data.clientId !== "inventory"
  )
    throw new Error("Invalid authentication configuration.");
  if (data.enabled) {
    const url = new URL(data.issuer);
    if (
      url.origin !== data.issuer ||
      (url.protocol !== "https:" &&
        !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))
    )
      throw new Error("Invalid authentication issuer.");
  }
  config = { enabled: data.enabled, issuer: data.issuer, clientId: data.clientId };
}

export function accountPortalUrl(path: "/account" | "/accounts" | "/chapters"): string {
  const { enabled, issuer } = getAuthConfig();
  if (!enabled) throw new Error("Central authentication is not enabled.");
  return issuer + path;
}
