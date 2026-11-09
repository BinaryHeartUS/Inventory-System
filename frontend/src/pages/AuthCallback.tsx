import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { finishCentralLogin } from "../services/centralAuthService";
import { useAuth } from "../context/AuthContext";
import SignInProgress from "../components/SignInProgress";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
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
        if (active) {
          refreshAuth();
          void navigate(path, { replace: true });
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Sign-in failed.");
      });
    return () => {
      active = false;
    };
  }, [navigate, refreshAuth]);
  return (
    <SignInProgress>
      {error ? (
        <div role="alert">
          <p>{error}</p>
          <Link className="mt-4 inline-block underline" to="/login">
            Return to sign-in
          </Link>
        </div>
      ) : undefined}
    </SignInProgress>
  );
}
