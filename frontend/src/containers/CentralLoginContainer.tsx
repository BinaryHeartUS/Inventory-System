import { useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { beginCentralLogin, safeInventoryPath } from "../services/centralAuthService";
import SignInProgress from "../components/SignInProgress";

export default function CentralLoginContainer() {
  const { auth } = useAuth();
  const location = useLocation();
  const from = safeInventoryPath((location.state as { from?: string } | null)?.from);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  if (auth) return <Navigate to={from} replace />;
  if (loading) return <SignInProgress />;

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
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <img src="/icon.png" alt="BinaryHeart" className="h-12 w-12" />
        <h1 className="text-2xl font-bold leading-tight text-slate-900">
          Sign in to the BinaryHeart Inventory System
        </h1>
        <p className="text-sm leading-relaxed text-slate-600">
          Use your BinaryHeart account to access inventory.
        </p>
        {error && (
          <p
            role="alert"
            className="w-full rounded-lg border border-red-200 bg-red-50 p-3 text-left text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <button
          disabled={loading}
          onClick={() => void signIn()}
          className="w-full rounded-lg bg-heart-blue px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-heart-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heart-blue disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Opening sign-in..." : "Sign in with BinaryHeart"}
        </button>
      </div>
    </main>
  );
}
