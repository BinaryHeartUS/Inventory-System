import type { ReactNode } from "react";

export default function SignInProgress({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center p-4">
      <section className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <img src="/icon.png" alt="BinaryHeart" className="h-12 w-12" />
        <h1 className="text-xl font-bold text-slate-900">Signing in with BinaryHeart</h1>
        {children ?? (
          <div role="status" className="flex items-center gap-3 text-sm text-slate-500">
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-heart-blue"
            />
            Please wait...
          </div>
        )}
      </section>
    </div>
  );
}
