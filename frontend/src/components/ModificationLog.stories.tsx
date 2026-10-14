import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { ModificationLog } from "./ModificationLog";
import { ModificationModal } from "./ModificationModal";

const meta = {
  component: ModificationLog,
  args: {
    entries: [
      { assetId: 1 },
      { assetId: 2, changeType: "Insert", modifiedAt: "2026-01-14T12:00:00Z" },
      { assetId: 3, changeType: "Update", modifiedAt: "2026-01-15T12:00:00Z" },
      { assetId: 4 },
    ],
    detailRenderer: (entry, onClose) => (
      <ModificationModal entry={entry} fields={[]} onClose={onClose} />
    ),
  },
} satisfies Meta<typeof ModificationLog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const History: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("row")[1]).toHaveTextContent("#3");
    await userEvent.click(canvas.getAllByRole("button", { name: "View more" })[0]);
    await expect(canvas.getByRole("heading", { name: "Change Details" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await expect(canvas.queryByRole("heading", { name: "Change Details" })).not.toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { entries: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No modification history yet.")).toBeVisible();
  },
};
