import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getParty } from "../services/partyService";
import { getDevices } from "../services/deviceService";
import { getParts } from "../services/partService";
import { getTools } from "../services/toolService";
import { fetchAllPages } from "../services/api";
import type { PartyDetail, AnyDevice, Part, Tool } from "../types/inventory";
import { canManageAccounts } from "../utils/roles";
import PartyDetailView from "../components/parties/PartyDetailView";

export interface PartyDetailContainerProps {
  id: string | undefined;
}

export default function PartyDetailContainer({ id }: PartyDetailContainerProps) {
  const numId = Number(id);
  const navigate = useNavigate();
  const { auth } = useAuth();
  const isAdmin = canManageAccounts(auth?.role);

  const [party, setParty] = useState<PartyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [donatedDevices, setDonatedDevices] = useState<AnyDevice[]>([]);
  const [receivedDevices, setReceivedDevices] = useState<AnyDevice[]>([]);
  const [donatedParts, setDonatedParts] = useState<Part[]>([]);
  const [donatedTools, setDonatedTools] = useState<Tool[]>([]);

  useEffect(() => {
    if (!numId) return;
    Promise.all([
      getParty(numId),
      fetchAllPages((pageKey, pageSize) =>
        getDevices({
          pageKey,
          pageSize,
          donorId: numId,
          includeDonated: true,
          includeScrapped: true,
        })
      ),
      fetchAllPages((pageKey, pageSize) =>
        getDevices({
          pageKey,
          pageSize,
          recipientId: numId,
          includeDonated: true,
          includeScrapped: true,
        })
      ),
      fetchAllPages((pageKey, pageSize) => getParts({ pageKey, pageSize, donorId: numId })),
      fetchAllPages((pageKey, pageSize) => getTools({ pageKey, pageSize, donorId: numId })),
    ])
      .then(([p, byDonor, byRecipient, parts, tools]) => {
        setParty(p);
        setDonatedDevices(byDonor);
        setReceivedDevices(byRecipient);
        setDonatedParts(parts);
        setDonatedTools(tools);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [numId]);

  if (!isAdmin) return <Navigate to="/" replace />;

  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );

  if (!party)
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-sm font-semibold text-slate-900">Party not found</p>
        <Link
          to="/admin/parties"
          className="text-sm font-medium text-slate-600 hover:text-slate-800"
        >
          ← Back to Manage Parties
        </Link>
      </div>
    );

  return (
    <PartyDetailView
      party={party}
      donatedDevices={donatedDevices}
      receivedDevices={receivedDevices}
      donatedParts={donatedParts}
      donatedTools={donatedTools}
      onBack={() => navigate(-1)}
    />
  );
}
