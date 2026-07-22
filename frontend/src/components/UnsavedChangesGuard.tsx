import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Blocks navigation away from a page while there are unsaved changes.
 *
 * Handles both navigation types:
 *  - In-app SPA navigation (sidebar link, tab, breadcrumb, back button) via
 *    the data router's `useBlocker`, showing an in-app confirm dialog.
 *  - Browser-level navigation (refresh, tab close, external URL) via the
 *    native `beforeunload` prompt.
 *
 * Requires a data router (`createBrowserRouter` + `RouterProvider`).
 */
export default function UnsavedChangesGuard({ when }: { when: boolean }) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname
  );

  // Native prompt for refresh / tab close / external navigation.
  useEffect(() => {
    if (!when) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [when]);

  if (blocker.state !== "blocked") return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => blocker.reset?.()} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-slate-900">Discard unsaved changes?</h2>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
          You have unsaved changes on this page. If you leave now, your changes will be lost.
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={() => blocker.reset?.()}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Keep editing
          </button>
          <button
            type="button"
            onClick={() => blocker.proceed?.()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-brand-red-dark transition-colors"
          >
            Discard changes
          </button>
        </div>
      </div>
    </div>
  );
}
