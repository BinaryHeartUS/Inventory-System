import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canManageAccounts } from "../utils/roles";
import ManagePartiesView from "../components/manageParties/ManagePartiesView";

/**
 * ManagePartiesContainer — admin guard plus the independent refresh keys for the
 * individuals and organizations sections.
 */
export default function ManagePartiesContainer() {
  const { auth } = useAuth();
  const isAdmin = canManageAccounts(auth?.role);

  // Separate refresh keys so refreshing one section doesn't reload the other
  const [individualsKey, setIndividualsKey] = useState(0);
  const [orgsKey, setOrgsKey] = useState(0);

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <ManagePartiesView
      individualsKey={individualsKey}
      orgsKey={orgsKey}
      onRefreshIndividuals={() => setIndividualsKey((k) => k + 1)}
      onRefreshOrgs={() => setOrgsKey((k) => k + 1)}
    />
  );
}
