import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import SettingsView from "./SettingsView";
import { LookupEditor } from "./LookupEditor";

const meta = {
  component: SettingsView,
  args: {
    sections: [
      {
        title: "Manufacturers",
        description: "Device manufacturers",
        key: "manufacturers",
        add: fn(async () => {}),
        remove: fn(async () => {}),
      },
    ],
    renderEditor: (section) => (
      <LookupEditor
        title={section.title}
        description={section.description}
        values={["Dell", "Lenovo"]}
        loaded
        error={null}
        onAdd={section.add}
        onRemove={section.remove}
      />
    ),
  },
} satisfies Meta<typeof SettingsView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Options: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Manage Options" })).toBeVisible();
    await expect(canvas.getByText("Dell")).toBeVisible();
  },
};
export const Empty: Story = { args: { sections: [] } };
