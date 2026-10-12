import PageHeading from "../PageHeading";
import PartySectionContainer from "../../containers/PartySectionContainer";

export interface ManagePartiesViewProps {
  individualsSection?: React.ReactNode;
  organizationsSection?: React.ReactNode;
  individualsKey: number;
  orgsKey: number;
  onRefreshIndividuals: () => void;
  onRefreshOrgs: () => void;
}

export default function ManagePartiesView({
  individualsSection,
  organizationsSection,
  individualsKey,
  orgsKey,
  onRefreshIndividuals,
  onRefreshOrgs,
}: ManagePartiesViewProps) {
  return (
    <div className="space-y-10">
      <PageHeading
        title="Manage Parties"
        subtitle="Create and edit individuals and organizations that serve as donors or recipients."
      />
      {individualsSection ?? <PartySectionContainer
        kind="individuals"
        refreshKey={individualsKey}
        onRefresh={onRefreshIndividuals}
      />}
      {organizationsSection ?? <PartySectionContainer kind="organizations" refreshKey={orgsKey} onRefresh={onRefreshOrgs} />}
    </div>
  );
}
