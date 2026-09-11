/**
 * Registers the service worker in production builds only.
 *
 * The dev server (Vite) serves modules that must not be intercepted by a
 * cache, so registration is skipped when running under `vite dev`.
 */
export function registerServiceWorker(): void {
  if (import.meta.env.DEV) return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures are non-fatal — the app still works online.
    });
  });
}
