import { useEffect } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { accountPortalUrl } from "../services/authConfig";
import { canManageAccounts } from "../utils/roles";

type PortalPage = "/account" | "/accounts" | "/chapters";

export default function CentralManagementRedirect({ page }: { page: PortalPage }) {
  const { auth } = useAuth();
  const allowed = page === "/account" || canManageAccounts(auth?.role);
  const destination = accountPortalUrl(page);
  useEffect(() => {
    if (allowed) window.location.replace(destination);
  }, [allowed, destination]);
  if (!allowed) return <Navigate to="/" replace />;
  return (
    <p className="p-6">
      Opening BinaryHeart accounts...{" "}
      <a className="underline" href={destination}>
        Continue
      </a>
    </p>
  );
}
