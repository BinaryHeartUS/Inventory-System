import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { AcquisitionDateFilter } from "./AcquisitionDateFilter";

const meta = {
  component: AcquisitionDateFilter,
  args: { from: "2026-01-01", to: "2026-01-15", error: null, onChange: fn() },
} satisfies Meta<typeof AcquisitionDateFilter>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Selected: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Acquisition date" }));
    await expect(canvas.getByLabelText("Acquired from")).toHaveValue("2026-01-01");
    await userEvent.click(canvas.getByRole("button", { name: "Reset range" }));
    await expect(args.onChange).toHaveBeenCalledWith("", "");
  },
};
export const Empty: Story = {
  args: { from: "", to: "" },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Acquisition date" }));
    await expect(canvas.getByRole("button", { name: "Reset range" })).toBeDisabled();
  },
};
export const EndOnly: Story = {
  args: { from: "" },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Acquisition date" }));
    await expect(canvas.getByLabelText("Acquired to")).toHaveValue("2026-01-15");
  },
};
export const Invalid: Story = {
  args: { error: "From date must not be after to date." },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Acquisition date" }));
    await expect(canvas.getByRole("alert")).toBeVisible();
  },
};
