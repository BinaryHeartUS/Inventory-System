import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { SectionCard } from "./SectionCard";

const meta = {
  component: SectionCard,
  args: { title: "Donations", icon: null, children: <p>Donation records</p> },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Donations" })).toBeVisible();
  },
} satisfies Meta<typeof SectionCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Count: Story = { args: { count: 42 } };
export const Zero: Story = { args: { count: 0 } };
