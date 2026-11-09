import { useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { beginCentralLogin, safeInventoryPath } from "../services/centralAuthService";

export default function CentralLoginContainer() {
  const { auth } = useAuth();
  const location = useLocation();
  const from = safeInventoryPath((location.state as { from?: string } | null)?.from);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  if (auth) return <Navigate to={from} replace />;

  async function signIn() {
    setLoading(true);
    setError(null);
    try {
      await beginCentralLogin(from);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start sign-in.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-slate-50 flex items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <img src="/icon.png" alt="BinaryHeart" className="w-12 h-12" />
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-bold text-slate-900">Sign in to Inventory</h1>
          <p className="text-sm text-slate-500">Use your BinaryHeart account to continue.</p>
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          disabled={loading}
          onClick={() => void signIn()}
          className="w-full rounded-lg bg-heart-blue px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Opening sign-in..." : "Sign in with BinaryHeart"}
        </button>
      </div>
    </main>
  );
}
