import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { detailContent, withRouter } from "../../stories/decorators";
import { person, tool } from "../../stories/fixtures";
import ToolDetailView from "./ToolDetailView";
import { changeFormControls } from "../../stories/interactions";

const meta = {
  component: ToolDetailView,
  decorators: [withRouter],
  args: {
    content: detailContent,
    tool,
    editing: false,
    form: null,
    saved: false,
    isDirty: false,
    canDelete: true,
    canPrint: true,
    printId: null,
    showDeleteConfirm: false,
    editParty: null,
    partyPickerOpen: false,
    linkedParty: person,
    changelog: [],
    chapterName: () => "Central",
    visibleChapters: [{ id: 1, name: "Central" }],
    onStartEdit: fn(),
    onCancelEdit: fn(),
    onSaveEdit: fn(),
    onDelete: fn(),
    onFieldChange: fn(),
    onOpenPrint: fn(),
    onClosePrint: fn(),
    onShowDeleteConfirm: fn(),
    onCancelDelete: fn(),
    onOpenPartyPicker: fn(),
    onSelectParty: fn(),
    onCancelPartyPicker: fn(),
    onRemoveDonor: fn(),
  },
} satisfies Meta<typeof ToolDetailView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const History: Story = {
  args: { changelog: [{ assetId: 44, changeType: "Insert", newDescription: "Screwdriver" }] },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "View more" }));
    await expect(canvas.getByRole("heading", { name: "Change Details" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  },
};
export const Details: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Print Label" }));
    await expect(args.onOpenPrint).toHaveBeenCalledWith(44);
  },
};
export const Editing: Story = {
  args: { editing: true, form: tool },
  play: async ({ canvas, canvasElement, args }) => {
    await changeFormControls(canvasElement);
    await expect(args.onFieldChange).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(args.onSaveEdit).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(args.onCancelEdit).toHaveBeenCalledOnce();
  },
};
export const EditingDonor: Story = { args: { editing: true, form: tool, editParty: person } };
export const MissingValues: Story = {
  args: {
    tool: { ...tool, value: null, acquisitionDate: null },
    linkedParty: null,
    canPrint: false,
    canDelete: false,
  },
};
export const DeleteConfirmation: Story = { args: { showDeleteConfirm: true } };
export const Saved: Story = { args: { saved: true } };
export const Print: Story = { args: { printId: 44 } };
export const DonorPicker: Story = { args: { partyPickerOpen: true } };
