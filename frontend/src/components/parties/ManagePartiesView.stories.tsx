import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { withRouter } from "../../stories/decorators";
import { organization, person } from "../../stories/fixtures";
import PartySectionView from "./PartySectionView";
import ManagePartiesView from "./ManagePartiesView";
import { PersonPanel } from "./PersonPanel";
import { OrgPanel } from "./OrgPanel";

const initial = {
  name: "",
  email: "",
  contactName: "",
  contactEmail: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  hasLocation: false,
};
const meta = {
  component: ManagePartiesView,
  decorators: [withRouter],
  args: {
    individualsKey: 0,
    orgsKey: 0,
    onRefreshIndividuals: fn(),
    onRefreshOrgs: fn(),
    individualsSection: (
      <PartySectionView
        isPerson
        items={[person]}
        loading={false}
        listError={null}
        onRefresh={fn()}
        renderPanel={(id, onClose, onSaved) => (
          <PersonPanel
            isNew={id === "new"}
            loading={false}
            initial={initial}
            onClose={onClose}
            onSave={async () => onSaved()}
          />
        )}
      />
    ),
    organizationsSection: (
      <PartySectionView
        isPerson={false}
        items={[organization]}
        loading={false}
        listError={null}
        onRefresh={fn()}
        renderPanel={(id, onClose, onSaved) => (
          <OrgPanel
            isNew={id === "new"}
            loading={false}
            initial={initial}
            onClose={onClose}
            onSave={async () => onSaved()}
          />
        )}
      />
    ),
  },
} satisfies Meta<typeof ManagePartiesView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Parties: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Manage Parties" })).toBeVisible();
    await expect(canvas.getByText(person.name)).toBeVisible();
    await expect(canvas.getByText(organization.name)).toBeVisible();
  },
};
