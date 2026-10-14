import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Field } from "./Field";
import { Section } from "./Section";

const meta = {
  component: Section,
  args: { title: "Specifications", children: <Field label="Model" value="ThinkPad" /> },
} satisfies Meta<typeof Section>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Specifications" })).toBeVisible();
  },
};
export const Empty: Story = { args: { children: null } };
