import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { UNSPECIFIED_OPERATING_SYSTEM } from "./operatingSystemFilters";
import { OperatingSystemFilterMenu } from "./OperatingSystemFilterMenu";

const meta = {
  component: OperatingSystemFilterMenu,
  args: {
    options: ["Windows", "Linux"],
    selected: ["Windows", "Linux", UNSPECIFIED_OPERATING_SYSTEM],
    onChange: fn(),
  },
} satisfies Meta<typeof OperatingSystemFilterMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button"));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Not specified" }));
    await expect(args.onChange).toHaveBeenCalledWith(["Windows", "Linux"]);
  },
};
export const Filtered: Story = { args: { selected: ["Linux"] } };
export const NoNamedSystems: Story = {
  args: { options: [], selected: [UNSPECIFIED_OPERATING_SYSTEM] },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button"));
    await expect(canvas.getByRole("checkbox")).toBeDisabled();
  },
};
