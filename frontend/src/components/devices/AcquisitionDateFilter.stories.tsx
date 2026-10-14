import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, fn, userEvent } from "storybook/test";
import { AcquisitionDateFilter } from "./AcquisitionDateFilter";

const meta = {
  component: AcquisitionDateFilter,
  args: { from: "2026-01-01", to: "2026-01-15", error: null, onChange: fn() },
} satisfies Meta<typeof AcquisitionDateFilter>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DateInputs: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Acquisition date" }));
    fireEvent.change(canvas.getByLabelText("Acquired from"), { target: { value: "2026-01-03" } });
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-01-03", "2026-01-15");
    fireEvent.change(canvas.getByLabelText("Acquired to"), { target: { value: "2026-01-20" } });
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-01-01", "2026-01-20");
    fireEvent.change(canvas.getByLabelText("Acquired from"), { target: { value: "" } });
    fireEvent.change(canvas.getByLabelText("Acquired to"), { target: { value: "" } });
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-01-01", "");
  },
};
export const CalendarSelection: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Acquisition date" }));
    const day = canvas.getAllByRole("button").find((button) => button.textContent === "20");
    await expect(day).toBeVisible();
    await userEvent.click(day!);
    await expect(args.onChange).toHaveBeenCalledWith("2026-01-01", "2026-01-20");
  },
};
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
