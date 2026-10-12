import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { organization, person } from "../../stories/fixtures";
import { DonorField } from "./DonorField";

const meta = {
  component: DonorField,
  args: { selectedParty: null, onOpen: fn(), onClear: fn() },
} satisfies Meta<typeof DonorField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button"));
    await expect(args.onOpen).toHaveBeenCalledOnce();
  },
};
export const Required: Story = { args: { required: true } };
export const Individual: Story = {
  args: { selectedParty: person },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText("Individual")).toBeVisible();
    await userEvent.click(canvas.getByTitle("Remove donor"));
    await expect(args.onClear).toHaveBeenCalledOnce();
  },
};
export const Organization: Story = { args: { selectedParty: organization, colSpan: false } };
