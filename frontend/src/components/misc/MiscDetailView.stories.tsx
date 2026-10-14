import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { detailContent, withRouter } from "../../stories/decorators";
import { misc, person } from "../../stories/fixtures";
import MiscDetailView from "./MiscDetailView";
import { changeFormControls } from "../../stories/interactions";

const meta = {
  component: MiscDetailView,
  decorators: [withRouter],
  args: {
    content: detailContent,
    asset: misc,
    editing: false,
    form: null,
    saved: false,
    isDirty: false,
    canEdit: true,
    canDelete: true,
    linkedParty: person,
    editParty: null,
    partyPickerOpen: false,
    showDeleteConfirm: false,
    changelog: [],
    onStartEdit: fn(),
    onCancelEdit: fn(),
    onSaveEdit: fn(),
    onDelete: fn(),
    onFieldChange: fn(),
    onOpenPartyPicker: fn(),
    onSelectParty: fn(),
    onCancelPartyPicker: fn(),
    onShowDeleteConfirm: fn(),
    onCancelDelete: fn(),
  },
} satisfies Meta<typeof MiscDetailView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const History: Story = {
  args: { changelog: [{ assetId: 45, changeType: "Insert", newDescription: "Cables" }] },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "View more" }));
    await expect(canvas.getByRole("heading", { name: "Change Details" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  },
};
export const Details: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Edit" }));
    await expect(args.onStartEdit).toHaveBeenCalledOnce();
  },
};
export const Editing: Story = {
  args: { editing: true, form: misc },
  play: async ({ canvas, canvasElement, args }) => {
    await changeFormControls(canvasElement);
    await expect(args.onFieldChange).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Select donor" }));
    await expect(args.onOpenPartyPicker).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(args.onSaveEdit).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(args.onCancelEdit).toHaveBeenCalledOnce();
  },
};
export const EditingDonor: Story = { args: { editing: true, form: misc, editParty: person } };
export const Viewer: Story = { args: { canEdit: false, canDelete: false, linkedParty: null } };
export const DeleteConfirmation: Story = { args: { showDeleteConfirm: true } };
export const Saved: Story = { args: { saved: true } };
export const DonorPicker: Story = { args: { partyPickerOpen: true } };
