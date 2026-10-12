import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { OrgPanel } from "./OrgPanel";

const meta = {
  component: OrgPanel,
  args: {
    isNew: true,
    loading: false,
    initial: {
      name: "",
      contactName: "",
      contactEmail: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      hasLocation: false,
    },
    onClose: fn(),
    onSave: fn(async () => {}),
  },
} satisfies Meta<typeof OrgPanel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Create: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole("button", { name: "Create" })).toBeDisabled();
    await userEvent.type(canvas.getByPlaceholderText("e.g. Acme Corp"), "  Community Center  ");
    await userEvent.click(canvas.getByRole("button", { name: "Create" }));
    await expect(args.onSave).toHaveBeenCalledWith({ name: "Community Center" });
  },
};
export const EditWithContact: Story = {
  args: {
    isNew: false,
    initial: {
      name: "Community Center",
      contactName: "Alex",
      contactEmail: "alex@example.com",
      street: "123 Main St",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA",
      hasLocation: true,
    },
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(args.onSave).toHaveBeenCalledWith({
      name: "Community Center",
      contactName: "Alex",
      contactEmail: "alex@example.com",
      location: "(123 Main St,Chicago,IL,60601,USA)",
    });
  },
};
export const AddressToggle: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Address (optional)" }));
    await expect(canvas.getByPlaceholderText("123 Main St")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Hide address" }));
    await expect(canvas.queryByPlaceholderText("123 Main St")).not.toBeInTheDocument();
  },
};
export const SaveError: Story = {
  args: {
    onSave: fn(async () => {
      throw new Error("Unable to save organization");
    }),
  },
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByPlaceholderText("e.g. Acme Corp"), "Community Center");
    await userEvent.click(canvas.getByRole("button", { name: "Create" }));
    await expect(canvas.getByText("Unable to save organization")).toBeVisible();
  },
};
export const Loading: Story = { args: { loading: true } };
export const Cancel: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
