import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { finishCentralLogin } from "../services/centralAuthService";

export default function AuthCallback() {
  const request = useRef<Promise<string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (!request.current) {
      const callback = window.location.href;
      window.history.replaceState(null, "", "/auth/callback");
      request.current = finishCentralLogin(callback);
    }
    request.current
      .then((path) => {
        if (active) window.location.replace(path);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Sign-in failed.");
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-xl font-bold mb-4">Signing in to Inventory</h1>
      {error ? (
        <div role="alert">
          <p>{error}</p>
          <Link className="mt-4 inline-block underline" to="/login">
            Return to sign-in
          </Link>
        </div>
      ) : (
        <p role="status">Verifying your account...</p>
      )}
    </main>
  );
}
