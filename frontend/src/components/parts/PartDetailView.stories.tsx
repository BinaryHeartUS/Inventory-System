import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { detailContent, withRouter } from "../../stories/decorators";
import { device, part, person } from "../../stories/fixtures";
import PartDetailView from "./PartDetailView";
import { changeFormControls } from "../../stories/interactions";

const meta = {
  component: PartDetailView,
  decorators: [withRouter],
  args: {
    content: detailContent,
    part,
    editing: false,
    form: null,
    saved: false,
    isDirty: false,
    canDelete: true,
    deleteBlocked: false,
    canPrint: true,
    printId: null,
    showDeleteConfirm: false,
    linkedDevice: null,
    editDevice: null,
    devicePickerOpen: false,
    linkedParty: null,
    editParty: null,
    partyPickerOpen: false,
    changelog: [],
    chapterName: () => "Central",
    chapters: [
      { id: 1, name: "Central" },
      { id: 0, name: "National" },
    ],
    partTypes: ["RAM", "Charger"],
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
    onOpenDevicePicker: fn(),
    onSelectDevice: fn(),
    onCancelDevicePicker: fn(),
    onRemoveDevice: fn(),
    onNavigateToDevice: fn(),
  },
} satisfies Meta<typeof PartDetailView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const History: Story = {
  args: { changelog: [{ assetId: 43, changeType: "Insert", newType: "RAM" }] },
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
  args: { editing: true, form: part },
  play: async ({ canvas, canvasElement, args }) => {
    await changeFormControls(canvasElement);
    await expect(args.onFieldChange).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(args.onSaveEdit).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(args.onCancelEdit).toHaveBeenCalledOnce();
  },
};
export const Linked: Story = {
  args: {
    part: { ...part, containedIn: 42 },
    linkedDevice: device,
    linkedParty: person,
    deleteBlocked: true,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Delete" })).toBeDisabled();
  },
};
export const EditingLinks: Story = {
  args: {
    editing: true,
    form: { ...part, containedIn: 42 },
    editDevice: device,
    editParty: person,
  },
};
export const DonatedMissingValues: Story = {
  args: {
    part: { ...part, wasPurchased: false, value: null, acquisitionDate: null },
    canPrint: false,
    canDelete: false,
  },
};
export const DeleteConfirmation: Story = { args: { showDeleteConfirm: true } };
export const Saved: Story = { args: { saved: true } };
export const Print: Story = { args: { printId: 43 } };
export const DonorPicker: Story = { args: { partyPickerOpen: true } };
export const DevicePicker: Story = { args: { devicePickerOpen: true } };
