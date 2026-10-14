import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { detailContent, withRouter } from "../../stories/decorators";
import { device, lookups, organization, part, person } from "../../stories/fixtures";
import { PartRow } from "../parts/PartRow";
import DeviceDetailView from "./DeviceDetailView";
import { changeFormControls } from "../../stories/interactions";

const meta = {
  component: DeviceDetailView,
  decorators: [withRouter],
  args: {
    content: detailContent,
    renderPartRow: (entry, onUnlink) => (
      <PartRow key={entry.id} part={entry} chapter="Central" onSelect={fn()} onUnlink={onUnlink} />
    ),
    device,
    backHref: "/devices",
    editing: false,
    form: null,
    saved: false,
    saveError: null,
    isDirty: false,
    canPrint: true,
    editLock: false,
    viewerLock: false,
    donatedLock: false,
    printId: null,
    partyPickerOpen: false,
    recipientPickerOpen: false,
    showDonateModal: false,
    showSoldValueModal: false,
    linkedParty: person,
    editParty: null,
    linkedRecipient: null,
    editRecipient: null,
    linkedParts: [part],
    changelog: [],
    lookups,
    onStartEdit: fn(),
    onCancelEdit: fn(),
    onSaveEdit: fn(),
    onFieldChange: fn(),
    onStatusChange: fn(),
    onOpenPrint: fn(),
    onClosePrint: fn(),
    onOpenPartyPicker: fn(),
    onSelectParty: fn(),
    onCancelPartyPicker: fn(),
    onRemoveDonor: fn(),
    onOpenRecipientPicker: fn(),
    onSelectRecipient: fn(),
    onCancelRecipientPicker: fn(),
    onRemoveRecipient: fn(),
    onConfirmDonate: fn(),
    onCancelDonate: fn(),
    onConfirmSold: fn(),
    onCancelSold: fn(),
    onUnlinkPart: fn(),
  },
} satisfies Meta<typeof DeviceDetailView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const History: Story = {
  args: {
    changelog: [{ assetId: 42, changeType: "Update", oldModel: "Latitude", newModel: "ThinkPad" }],
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "View more" }));
    await expect(canvas.getByRole("heading", { name: "Change Details" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  },
};
export const Laptop: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Unlink" }));
    await expect(args.onUnlinkPart).toHaveBeenCalledWith(part);
  },
};
export const Desktop: Story = {
  args: { device: { ...device, type: "Desktop", hasWifi: true }, linkedParts: [] },
};
export const Mobile: Story = {
  args: { device: { ...device, type: "Tablet", workingBattery: "Yes" } },
};
export const EditingLaptop: Story = {
  args: { editing: true, form: device },
  play: async ({ canvas, canvasElement, args }) => {
    await changeFormControls(canvasElement);
    await expect(args.onFieldChange).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(args.onSaveEdit).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(args.onCancelEdit).toHaveBeenCalledOnce();
  },
};
export const EditingDesktop: Story = {
  args: { editing: true, form: { ...device, type: "Desktop", hasWifi: null } },
  play: async ({ canvasElement, args }) => {
    await changeFormControls(canvasElement);
    await expect(args.onFieldChange).toHaveBeenCalled();
  },
};
export const EditingMobile: Story = {
  args: { editing: true, form: { ...device, type: "Tablet" } },
  play: async ({ canvasElement, args }) => {
    await changeFormControls(canvasElement);
    await expect(args.onFieldChange).toHaveBeenCalled();
  },
};
export const EditingLinks: Story = {
  args: { editing: true, form: device, editParty: person, editRecipient: organization },
};
export const InvalidBattery: Story = {
  args: {
    editing: true,
    form: { ...device, designBatteryCapacity: 50, actualBatteryCapacity: 60 },
  },
};
export const MissingValues: Story = {
  args: {
    device: {
      ...device,
      serialNumber: null,
      cpu: null,
      operatingSystem: null,
      acquisitionDate: null,
      value: null,
      batteryHealth: null,
      designBatteryCapacity: null,
      actualBatteryCapacity: null,
    },
    linkedParty: null,
  },
};
export const Stuck: Story = { args: { device: { ...device, deviceStuck: true } } };
export const Viewer: Story = {
  args: { editLock: true, viewerLock: true, canPrint: false },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Edit" })).toBeDisabled();
  },
};
export const Donated: Story = {
  args: {
    device: { ...device, status: "Donated", donatedDate: "2026-02-01" },
    editLock: true,
    donatedLock: true,
    linkedRecipient: organization,
  },
};
export const Saved: Story = { args: { saved: true } };
export const SaveError: Story = { args: { saveError: "Unable to save device" } };
export const Print: Story = { args: { printId: 42 } };
export const DonorPicker: Story = { args: { partyPickerOpen: true } };
export const RecipientPicker: Story = { args: { recipientPickerOpen: true } };
export const ReadinessChecklist: Story = { args: { showDonateModal: true } };
export const SaleValue: Story = { args: { showSoldValueModal: true } };
