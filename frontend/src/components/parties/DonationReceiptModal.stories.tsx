import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { DonationReceiptModal } from "./DonationReceiptModal";

const meta = {
  component: DonationReceiptModal,
  args: {
    donorName: "Alex Morgan",
    items: [{ id: 42, label: "ThinkPad", year: 2022, value: 250 }],
    onClose: fn(),
  },
} satisfies Meta<typeof DonationReceiptModal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SingleItem: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Download PDF" })).toBeDisabled();
    await expect(canvas.getByPlaceholderText("e.g. $7800")).toHaveValue("$250");
    await userEvent.type(canvas.getByPlaceholderText("Full name"), "Alex");
    await userEvent.type(canvas.getByPlaceholderText("e.g. Director of Technology"), "Director");
    await expect(canvas.getByRole("button", { name: "Download PDF" })).toBeEnabled();
  },
};
export const MultipleItems: Story = {
  args: {
    items: [
      { id: 42, label: "ThinkPad", year: 2022, value: 250 },
      { id: 43, label: "Latitude", value: null },
    ],
  },
};
export const NoValue: Story = { args: { items: [{ id: 42, label: "ThinkPad", value: null }] } };
export const Empty: Story = { args: { items: [] } };
export const Cancel: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
export const Download: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByPlaceholderText("Full name"), "Alex");
    await userEvent.type(canvas.getByPlaceholderText("e.g. Director of Technology"), "Director");
    await userEvent.click(canvas.getByRole("button", { name: "Download PDF" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
