import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import NotesPane from "./NotesPane";

const meta = {
  component: NotesPane,
  args: {
    notes: [
      { id: 1, assetId: 42, date: "2026-01-15T12:00:00Z", text: "Battery replaced" },
      { id: 2, assetId: 42, date: "2026-01-14T12:00:00Z", text: "Received device" },
    ],
    onAddNote: fn(),
    onEditNote: fn(),
  },
} satisfies Meta<typeof NotesPane>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {
  args: { notes: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No notes yet")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Add note" })).toBeDisabled();
  },
};
export const AddNote: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByRole("textbox"), "  Tested  ");
    await userEvent.click(canvas.getByRole("button", { name: "Add note" }));
    await expect(args.onAddNote).toHaveBeenCalledWith("Tested");
    await expect(canvas.getByRole("textbox")).toHaveValue("");
  },
};
export const KeyboardSubmit: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByRole("textbox"), "Tested");
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    await expect(args.onAddNote).toHaveBeenCalledWith("Tested");
  },
};
export const EditNote: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getAllByRole("button", { name: "Edit" })[0]);
    await userEvent.clear(canvas.getByRole("textbox", { name: "Edit note" }));
    await expect(canvas.getByRole("button", { name: "Save" })).toBeDisabled();
    await userEvent.type(canvas.getByRole("textbox", { name: "Edit note" }), "  Updated  ");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(args.onEditNote).toHaveBeenCalledWith(1, "Updated");
  },
};
export const CancelEdit: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getAllByRole("button", { name: "Edit" })[0]);
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.queryByRole("textbox", { name: "Edit note" })).not.toBeInTheDocument();
    await expect(args.onEditNote).not.toHaveBeenCalled();
  },
};
export const DonatedReadOnly: Story = {
  args: { readOnly: true },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(canvas.getByText(/has been donated/)).toBeVisible();
  },
};
export const ViewerReadOnly: Story = {
  args: { readOnly: true, readOnlyReason: "viewer" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Viewer accounts cannot edit notes.")).toBeVisible();
  },
};
