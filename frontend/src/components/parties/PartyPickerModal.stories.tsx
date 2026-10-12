import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { organization, person } from "../../stories/fixtures";
import { PartyPickerModal, PartyTypeBadge } from "./PartyPickerModal";
import { changeFormControls } from "../../stories/interactions";

const meta = {
  component: PartyPickerModal,
  args: {
    parties: [person, organization],
    loading: false,
    onSelect: fn(),
    onCancel: fn(),
    onCreate: fn(async () => {}),
  },
} satisfies Meta<typeof PartyPickerModal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CreateWithAddress: Story = {
  play: async ({ canvas, canvasElement, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "New Individual" }));
    await userEvent.click(canvas.getByRole("button", { name: "Add address (optional)" }));
    await changeFormControls(canvasElement.querySelectorAll<HTMLElement>(".relative.bg-white")[1]);
    await userEvent.click(canvas.getByRole("button", { name: "Create" }));
    await expect(args.onCreate).toHaveBeenCalledWith("Person", {
      name: "A",
      email: "A",
      location: "(A,A,A,,A)",
    });
  },
};
export const Select: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByText(person.name));
    await expect(args.onSelect).toHaveBeenCalledWith(person);
  },
};
export const Search: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole("textbox"), "organization");
    await expect(canvas.getByText(organization.name)).toBeVisible();
    await expect(canvas.queryByText(person.name)).not.toBeInTheDocument();
    await userEvent.clear(canvas.getByRole("textbox"));
    await userEvent.type(canvas.getByRole("textbox"), "missing");
    await expect(canvas.getByText("No matches.")).toBeVisible();
  },
};
export const Empty: Story = { args: { parties: [] } };
export const Loading: Story = { args: { loading: true } };
export const CreateIndividual: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "New Individual" }));
    await userEvent.type(canvas.getByPlaceholderText("Full name"), "  Alex  ");
    await userEvent.click(canvas.getByRole("button", { name: "Create" }));
    await expect(args.onCreate).toHaveBeenCalledWith("Person", { name: "Alex" });
  },
};
export const CreateOrganization: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "New Organization" }));
    await userEvent.type(canvas.getByPlaceholderText("Organization name"), "Community Center");
    await userEvent.type(canvas.getByPlaceholderText("Primary contact"), "Alex");
    await userEvent.click(canvas.getByRole("button", { name: "Create" }));
    await expect(args.onCreate).toHaveBeenCalledWith("Organization", {
      name: "Community Center",
      contactName: "Alex",
    });
  },
};
export const CreateError: Story = {
  args: {
    onCreate: fn(async () => {
      throw new Error("Unable to create party");
    }),
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "New Individual" }));
    await userEvent.type(canvas.getByPlaceholderText("Full name"), "Alex");
    await userEvent.click(canvas.getByRole("button", { name: "Create" }));
    await expect(canvas.getByText("Unable to create party")).toBeVisible();
  },
};
export const CancelCreation: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "New Individual" }));
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.queryByPlaceholderText("Full name")).not.toBeInTheDocument();
  },
};
export const IndividualBadge: Story = { render: () => <PartyTypeBadge type="Person" /> };
export const OrganizationBadge: Story = { render: () => <PartyTypeBadge type="Organization" /> };
