import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { FilterChecklistMenu } from "./FilterChecklistMenu";

const meta = {
  component: FilterChecklistMenu,
  args: {
    label: "Types",
    options: ["Laptop", "Desktop"],
    selected: ["Laptop", "Desktop"],
    onChange: fn(),
    isDefault: true,
  },
} satisfies Meta<typeof FilterChecklistMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Selection: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button"));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Desktop" }));
    await expect(args.onChange).toHaveBeenLastCalledWith(["Laptop"]);
    await expect(canvas.getByRole("checkbox", { name: "Laptop" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Desktop" }));
    await expect(args.onChange).toHaveBeenLastCalledWith(["Laptop", "Desktop"]);
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument();
  },
};
export const SingleSelection: Story = {
  args: { selected: ["Laptop"], isDefault: false },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button"));
    await expect(canvas.getByRole("checkbox", { name: "Laptop" })).toBeDisabled();
  },
};
export const LabelsAndFooter: Story = {
  args: { optionLabel: (option) => `${option} devices`, footer: <span>Selected inventory</span> },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button"));
    await expect(canvas.getByText("Selected inventory")).toBeVisible();
  },
};
export const OutsideClick: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button"));
    await userEvent.click(document.body);
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument();
  },
};
