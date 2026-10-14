import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import PageHeading from "./PageHeading";

const meta = {
  component: PageHeading,
  args: { title: "Devices", subtitle: "Chapter inventory" },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole("heading", { name: args.title })).toBeVisible();
  },
} satisfies Meta<typeof PageHeading>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Compact: Story = { args: { compact: true } };
export const RichSubtitle: Story = {
  args: {
    subtitle: (
      <>
        <strong>42</strong> devices
      </>
    ),
  },
};
