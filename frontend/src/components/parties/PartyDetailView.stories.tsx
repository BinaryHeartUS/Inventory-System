import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { withRouter } from "../../stories/decorators";
import { device, misc, organization, part, person, tool } from "../../stories/fixtures";
import PartyDetailView from "./PartyDetailView";

const meta = {
  component: PartyDetailView,
  decorators: [withRouter],
  args: {
    party: person,
    donatedDevices: [device],
    receivedDevices: [{ ...device, id: 46 }],
    donatedParts: [part],
    donatedTools: [tool],
    donatedMisc: [misc],
    onBack: fn(),
  },
} satisfies Meta<typeof PartyDetailView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Individual: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Manage Parties" })).toHaveAttribute(
      "href",
      "/admin/parties"
    );
  },
};
export const Organization: Story = { args: { party: organization } };
export const Empty: Story = {
  args: {
    donatedDevices: [],
    receivedDevices: [],
    donatedParts: [],
    donatedTools: [],
    donatedMisc: [],
  },
};
export const WithContactAndAddress: Story = {
  args: {
    party: {
      ...person,
      type: "Person",
      email: "alex@example.com",
      location: {
        street: "123 Main St",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "USA",
      },
    },
  },
};
export const ReceiptSelection: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Create Donation Receipt" }));
    const generate = canvas.getByRole("button", { name: "Generate Donor Receipt" });
    await expect(generate).toBeDisabled();
    await userEvent.click(canvas.getAllByRole("checkbox")[1]);
    await expect(generate).toBeEnabled();
    await userEvent.click(canvas.getAllByRole("checkbox")[1]);
    await expect(generate).toBeDisabled();
    await userEvent.click(canvas.getAllByRole("checkbox")[0]);
    await userEvent.click(canvas.getAllByRole("checkbox")[0]);
    await expect(generate).toBeDisabled();
    await userEvent.click(canvas.getAllByRole("checkbox")[0]);
    await userEvent.click(generate);
    await expect(canvas.getByRole("heading", { name: "Generate Donation Receipt" })).toBeVisible();
    await userEvent.click(canvas.getAllByRole("button", { name: "Cancel" })[0]);
    await expect(
      canvas.queryByRole("heading", { name: "Generate Donation Receipt" })
    ).not.toBeInTheDocument();
  },
};
export const CollapseGroups: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /^Donated / }));
    await userEvent.click(canvas.getByRole("button", { name: /^Received / }));
    await expect(canvas.queryByRole("table")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: /Back/ }));
    await expect(args.onBack).toHaveBeenCalledOnce();
  },
};
