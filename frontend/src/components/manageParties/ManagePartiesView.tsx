import PageHeading from "../PageHeading";
import PartySectionContainer from "../../containers/PartySectionContainer";

export interface ManagePartiesViewProps {
  individualsKey: number;
  orgsKey: number;
  onRefreshIndividuals: () => void;
  onRefreshOrgs: () => void;
}

/**
 * ManagePartiesView — presentational shell for the party management page:
 * heading plus the individuals and organizations section containers.
 */
export default function ManagePartiesView({
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
      <PartySectionContainer
        kind="individuals"
        refreshKey={individualsKey}
        onRefresh={onRefreshIndividuals}
      />
      <PartySectionContainer kind="organizations" refreshKey={orgsKey} onRefresh={onRefreshOrgs} />
    </div>
  );
}
