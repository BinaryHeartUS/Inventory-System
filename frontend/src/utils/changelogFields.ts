// Maps a raw changelog entry into the ordered list of before/after fields the
// generic ModificationModal renders. This is entity-specific display logic that
// intentionally lives outside the component so it can be reused and tested.

import type {
  ChangelogFieldDef,
  DeviceChangelogEntry,
  PartChangelogEntry,
  ToolChangelogEntry,
} from "../types/changelog";
import {
  formatBool,
  formatDate,
  formatId,
  formatMoney,
  formatNumber,
  formatPercent,
  formatText,
} from "./format";

export function buildDeviceFields(entry: DeviceChangelogEntry): ChangelogFieldDef[] {
  return [
    {
      label: "Manufacturer",
      old: formatText(entry.oldManufacturer),
      new: formatText(entry.newManufacturer),
    },
    { label: "Model", old: formatText(entry.oldModel), new: formatText(entry.newModel) },
    { label: "Year", old: formatNumber(entry.oldYear), new: formatNumber(entry.newYear) },
    { label: "Status", old: formatText(entry.oldStatus), new: formatText(entry.newStatus) },
    { label: "Chapter ID", old: formatId(entry.oldChapterID), new: formatId(entry.newChapterID) },
    {
      label: "Acquisition Date",
      old: formatDate(entry.oldAcquisitionDate),
      new: formatDate(entry.newAcquisitionDate),
    },
    {
      label: "Donated Date",
      old: formatDate(entry.oldDonatedDate),
      new: formatDate(entry.newDonatedDate),
    },
    { label: "Value", old: formatMoney(entry.oldValue), new: formatMoney(entry.newValue) },
    { label: "Donor ID", old: formatId(entry.oldDonorID), new: formatId(entry.newDonorID) },
    {
      label: "Recipient ID",
      old: formatId(entry.oldRecipientID),
      new: formatId(entry.newRecipientID),
    },
    { label: "CPU", old: formatText(entry.oldCPU), new: formatText(entry.newCPU) },
    { label: "RAM (GB)", old: formatNumber(entry.oldRam), new: formatNumber(entry.newRam) },
    {
      label: "RAM Generation",
      old: formatText(entry.oldRamGeneration),
      new: formatText(entry.newRamGeneration),
    },
    {
      label: "Storage (GB)",
      old: formatNumber(entry.oldStorageAmount),
      new: formatNumber(entry.newStorageAmount),
    },
    {
      label: "Storage Type",
      old: formatText(entry.oldStorageType),
      new: formatText(entry.newStorageType),
    },
    {
      label: "Operating System",
      old: formatText(entry.oldOperatingSystem),
      new: formatText(entry.newOperatingSystem),
    },
    { label: "Has Wi-Fi", old: formatBool(entry.oldHasWifi), new: formatBool(entry.newHasWifi) },
    {
      label: "Includes Charger",
      old: formatText(entry.oldIncludesCharger),
      new: formatText(entry.newIncludesCharger),
    },
    {
      label: "Design Capacity",
      old: formatNumber(entry.oldDesignCapacity),
      new: formatNumber(entry.newDesignCapacity),
    },
    {
      label: "Actual Capacity",
      old: formatNumber(entry.oldActualCapacity),
      new: formatNumber(entry.newActualCapacity),
    },
    {
      label: "Battery Health",
      old: formatPercent(entry.oldBatteryHealth),
      new: formatPercent(entry.newBatteryHealth),
    },
    {
      label: "Working Battery",
      old: formatText(entry.oldWorkingBattery),
      new: formatText(entry.newWorkingBattery),
    },
  ];
}

export function buildPartFields(entry: PartChangelogEntry): ChangelogFieldDef[] {
  return [
    { label: "Type", old: formatText(entry.oldType), new: formatText(entry.newType) },
    {
      label: "Description",
      old: formatText(entry.oldDescription),
      new: formatText(entry.newDescription),
    },
    {
      label: "Was Purchased",
      old: formatBool(entry.oldWasPurchased),
      new: formatBool(entry.newWasPurchased),
    },
    {
      label: "Contained In",
      old: formatId(entry.oldContainedIn),
      new: formatId(entry.newContainedIn),
    },
    {
      label: "Acquisition Date",
      old: formatDate(entry.oldAcquisitionDate),
      new: formatDate(entry.newAcquisitionDate),
    },
    { label: "Value", old: formatMoney(entry.oldValue), new: formatMoney(entry.newValue) },
    {
      label: "Chapter ID",
      old: formatId(entry.oldChapterID ?? undefined),
      new: formatId(entry.newChapterID ?? undefined),
    },
    {
      label: "Donor ID",
      old: formatId(entry.oldDonorID ?? undefined),
      new: formatId(entry.newDonorID ?? undefined),
    },
  ];
}

export function buildToolFields(entry: ToolChangelogEntry): ChangelogFieldDef[] {
  return [
    {
      label: "Description",
      old: formatText(entry.oldDescription),
      new: formatText(entry.newDescription),
    },
    {
      label: "Acquisition Date",
      old: formatDate(entry.oldAcquisitionDate),
      new: formatDate(entry.newAcquisitionDate),
    },
    { label: "Value", old: formatMoney(entry.oldValue), new: formatMoney(entry.newValue) },
    { label: "Chapter ID", old: formatId(entry.oldChapterID), new: formatId(entry.newChapterID) },
    { label: "Donor ID", old: formatId(entry.oldDonorID), new: formatId(entry.newDonorID) },
  ];
}
