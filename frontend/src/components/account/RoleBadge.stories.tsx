import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { RoleBadge } from "./RoleBadge";

const meta = {
  component: RoleBadge,
  tags: ["autodocs"],
  args: { role: "Admin" },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText(args.role)).toBeVisible();
  },
} satisfies Meta<typeof RoleBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Admin: Story = {};
export const ChapterAdmin: Story = { args: { role: "Chapter Admin" } };
export const Editor: Story = { args: { role: "Editor" } };
export const Viewer: Story = { args: { role: "Viewer" } };
export const UnknownRole: Story = { args: { role: "Custom role" } };
