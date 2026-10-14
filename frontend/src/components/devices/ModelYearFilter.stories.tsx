import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { ModelYearFilter } from "./ModelYearFilter";

const meta = {
  component: ModelYearFilter,
  args: { from: "", to: "", error: null, onChange: fn() },
} satisfies Meta<typeof ModelYearFilter>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Year" }));
    await expect(canvas.getByRole("button", { name: "Reset range" })).toBeDisabled();
    await userEvent.type(canvas.getByLabelText("Model year from"), "2");
    await expect(args.onChange).toHaveBeenCalledWith("2", "");
    await userEvent.type(canvas.getByLabelText("Model year to"), "3");
    await expect(args.onChange).toHaveBeenCalledWith("", "3");
  },
};
export const Selected: Story = {
  args: { from: "2020", to: "2024" },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Year" }));
    await userEvent.click(canvas.getByRole("button", { name: "Reset range" }));
    await expect(args.onChange).toHaveBeenCalledWith("", "");
  },
};
export const Invalid: Story = {
  args: { from: "2024", to: "2020", error: "From year must not be after to year." },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Year" }));
    await expect(canvas.getByRole("alert")).toBeVisible();
    await expect(canvas.getByLabelText("Model year from")).toHaveAttribute("aria-invalid", "true");
  },
};
