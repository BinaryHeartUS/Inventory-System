import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { withRouter } from "../../stories/decorators";
import { organization, person } from "../../stories/fixtures";
import { PersonPanel } from "./PersonPanel";
import { OrgPanel } from "./OrgPanel";
import PartySectionView from "./PartySectionView";

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
  component: PartySectionView,
  decorators: [withRouter],
  args: {
    isPerson: true,
    items: [person],
    loading: false,
    listError: null,
    onRefresh: fn(),
    renderPanel: (id, onClose, onSaved) => (
      <PersonPanel
        isNew={id === "new"}
        loading={false}
        initial={id === "new" ? initial : { ...initial, name: person.name }}
        onClose={onClose}
        onSave={async () => onSaved()}
      />
    ),
  },
} satisfies Meta<typeof PartySectionView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Individuals: Story = {};
export const Organizations: Story = {
  args: {
    isPerson: false,
    items: [organization],
    renderPanel: (id, onClose, onSaved) => (
      <OrgPanel
        isNew={id === "new"}
        loading={false}
        initial={id === "new" ? initial : { ...initial, name: organization.name }}
        onClose={onClose}
        onSave={async () => onSaved()}
      />
    ),
  },
};
export const CreateIndividual: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add Individual" }));
    await userEvent.type(canvas.getByPlaceholderText("Full name"), "Sam");
    await userEvent.click(canvas.getByRole("button", { name: "Create" }));
    await expect(args.onRefresh).toHaveBeenCalledOnce();
    await expect(canvas.queryByTestId("person-panel")).not.toBeInTheDocument();
  },
};
export const Edit: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Edit" }));
    await expect(canvas.getByTestId("person-panel")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.queryByTestId("person-panel")).not.toBeInTheDocument();
  },
};
export const NoMatches: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole("textbox"), "missing");
    await expect(canvas.getByText("No matches.")).toBeVisible();
  },
};
export const EmptyIndividuals: Story = { args: { items: [] } };
export const EmptyOrganizations: Story = { args: { items: [], isPerson: false } };
export const Loading: Story = { args: { loading: true } };
export const Error: Story = { args: { listError: "Unable to load parties" } };
