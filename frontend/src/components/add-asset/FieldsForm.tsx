import { type Dispatch, type SetStateAction } from "react";
import type { AnyDevice, DeviceStatus, PartySummary } from "../../types/inventory";
import type { LookupData } from "../../hooks/useLookups";
import { inputCls, labelCls } from "../../utils/formStyles";
import { FText, FSelect, FCombo, Req } from "./FormFields";
import { DonorField } from "./DonorField";
import type { AssetCategory, DeviceSubtype, FormState } from "./types";

export function FieldsForm({
  category,
  subtype,
  form,
  setForm,
  lookups,
  selectedDevice,
  onOpenDevicePicker,
  onClearDevice,
  selectedParty,
  onOpenPartyPicker,
  onClearParty,
  selectedRecipient,
  onOpenRecipientPicker,
  onClearRecipient,
  onDeviceStatusChange,
}: {
  category: AssetCategory;
  subtype: DeviceSubtype | null;
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  lookups: LookupData;
  selectedDevice: AnyDevice | null;
  onOpenDevicePicker: () => void;
  onClearDevice: () => void;
  selectedParty: PartySummary | null;
  onOpenPartyPicker: () => void;
  onClearParty: () => void;
  selectedRecipient: PartySummary | null;
  onOpenRecipientPicker: () => void;
  onClearRecipient: () => void;
  onDeviceStatusChange: (status: DeviceStatus) => void;
}) {
  function set<K extends keyof FormState>(key: K) {
    return (value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (category === "Tool") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FSelect
          label="Chapter"
          value={form.chapter}
          options={lookups.chapters}
          onChange={set("chapter")}
          req
        />
        <FText
          label="Description"
          value={form.toolDescription}
          onChange={set("toolDescription")}
          req
          colSpan
          placeholder="e.g. Ventoy bootable 32GB drive"
          maxLength={500}
        />
        <FText
          label="Value ($)"
          value={form.value}
          onChange={set("value")}
          type="number"
          placeholder="e.g. 12.99"
        />
        <div>
          <label className={labelCls}>Acquisition Date</label>
          <input
            type="date"
            value={form.acquisitionDate}
            onChange={(e) => set("acquisitionDate")(e.target.value)}
            className={inputCls}
          />
        </div>
        <DonorField
          selectedParty={selectedParty}
          onOpen={onOpenPartyPicker}
          onClear={onClearParty}
        />
      </div>
    );
  }

  if (category === "Part") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FCombo
          label="Part Type"
          value={form.partType}
          options={lookups.partTypes}
          onChange={set("partType")}
          req
          placeholder="e.g. SODIMM, Charger"
          maxLength={50}
        />
        <FSelect
          label="Chapter"
          value={form.chapter}
          options={lookups.chapters}
          onChange={set("chapter")}
          req
        />
        <FText
          label="Description"
          value={form.description}
          onChange={set("description")}
          req
          colSpan
          placeholder="e.g. DDR4 8 GB stick, 256 GB NVMe drive"
        />
        <div>
          <label className={labelCls}>
            Acquisition Type <Req />
          </label>
          <div className="flex gap-3 mt-1">
            {[
              { val: false, label: "Donated" },
              { val: true, label: "Purchased" },
            ].map((opt) => (
              <label
                key={String(opt.val)}
                className={`flex-1 flex items-center gap-2.5 p-3 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium
                  ${
                    form.wasPurchased === opt.val
                      ? "border-heart-blue bg-heart-blue/5 text-heart-blue"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  checked={form.wasPurchased === opt.val}
                  onChange={() => setForm((p) => ({ ...p, wasPurchased: opt.val }))}
                />
                <span
                  className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center
                  ${form.wasPurchased === opt.val ? "border-heart-blue" : "border-slate-300"}`}
                >
                  {form.wasPurchased === opt.val && (
                    <span className="w-2 h-2 rounded-full bg-heart-blue" />
                  )}
                </span>
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Contained In</label>
          {selectedDevice ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-sm text-slate-700">
                #{selectedDevice.id} {selectedDevice.manufacturer} {selectedDevice.model}
              </span>
              <button
                type="button"
                onClick={onClearDevice}
                className="ml-auto text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                title="Remove device link"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenDevicePicker}
              className="flex items-center gap-2 w-full text-sm text-slate-500 border border-slate-200 border-dashed rounded-lg px-3 py-2 hover:border-heart-blue hover:text-heart-blue hover:bg-heart-blue/5 transition-all"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Select device (optional)
            </button>
          )}
        </div>
        <FText
          label="Value ($)"
          value={form.value}
          onChange={set("value")}
          type="number"
          placeholder="e.g. 29.99"
        />
        <div>
          <label className={labelCls}>Acquisition Date</label>
          <input
            type="date"
            value={form.acquisitionDate}
            onChange={(e) => set("acquisitionDate")(e.target.value)}
            className={inputCls}
          />
        </div>
        <DonorField
          selectedParty={selectedParty}
          onOpen={onOpenPartyPicker}
          onClear={onClearParty}
        />
      </div>
    );
  }

  // Device
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FCombo
          label="Manufacturer"
          value={form.manufacturer}
          options={lookups.manufacturers}
          onChange={set("manufacturer")}
          req
          placeholder="e.g. Asus"
          maxLength={50}
        />
        <FText
          label="Model"
          value={form.model}
          onChange={set("model")}
          req
          placeholder="e.g. ThinkPad X1"
          maxLength={50}
        />
        <FText
          label="Year"
          value={form.year}
          onChange={set("year")}
          req
          type="number"
          placeholder="e.g. 2021"
          min={1980}
          max={new Date().getFullYear()}
        />
        <FSelect
          label="Status"
          value={form.status}
          options={lookups.deviceStatuses}
          onChange={onDeviceStatusChange}
          req
        />
        <FText
          label="CPU"
          value={form.cpu}
          onChange={set("cpu")}
          placeholder="e.g. i5-1135G7"
          maxLength={50}
        />
        <FCombo
          label="Operating System"
          value={form.operatingSystem}
          options={lookups.operatingSystems}
          onChange={set("operatingSystem")}
          placeholder="e.g. Windows 11"
          maxLength={50}
        />
        <FSelect
          label="Chapter"
          value={form.chapter}
          options={lookups.chapters}
          onChange={set("chapter")}
          req
        />
        <FText
          label="RAM (GB)"
          value={form.ram}
          onChange={set("ram")}
          type="number"
          placeholder="e.g. 16"
          min={0}
        />
        <FCombo
          label="RAM Generation"
          value={form.ramGeneration}
          options={lookups.ramGenerations}
          onChange={set("ramGeneration")}
          placeholder="e.g. DDR4"
          maxLength={20}
        />
        <FText
          label="Storage (GB)"
          value={form.storage}
          onChange={set("storage")}
          type="number"
          placeholder="e.g. 256"
          min={0}
        />
        <FCombo
          label="Storage Type"
          value={form.storageType}
          options={lookups.storageTypes}
          onChange={set("storageType")}
          placeholder="e.g. SSD"
          maxLength={30}
        />
        <FText
          label="Value ($)"
          value={form.value}
          onChange={set("value")}
          type="number"
          placeholder="e.g. 150.00"
        />
        <div>
          <label className={labelCls}>Acquisition Date</label>
          <input
            type="date"
            value={form.acquisitionDate}
            onChange={(e) => set("acquisitionDate")(e.target.value)}
            className={inputCls}
          />
        </div>
        <DonorField
          selectedParty={selectedParty}
          onOpen={onOpenPartyPicker}
          onClear={onClearParty}
          colSpan={false}
        />
        <div>
          <label className={labelCls}>Recipient{form.status === "Donated" && <Req />}</label>
          {selectedRecipient ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-sm text-slate-700">{selectedRecipient.name}</span>
              <span
                className={`ml-1 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${selectedRecipient.type === "Person" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
              >
                {selectedRecipient.type === "Person" ? "Individual" : "Organization"}
              </span>
              <button
                type="button"
                onClick={onClearRecipient}
                className="ml-auto text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                title="Remove recipient"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenRecipientPicker}
              className={`flex items-center gap-2 w-full text-sm border border-dashed rounded-lg px-3 py-2 transition-all ${form.status === "Donated" ? "border-red-300 text-red-500 hover:border-red-400 hover:bg-red-50" : "border-slate-200 text-slate-500 hover:border-heart-blue hover:text-heart-blue hover:bg-heart-blue/5"}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {form.status === "Donated"
                ? "Select recipient (required)"
                : "Select recipient (optional)"}
            </button>
          )}
        </div>
      </div>

      {subtype === "Desktop" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100 mb-4">
            Desktop Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FSelect
              label="Has Wi-Fi"
              value={form.hasWifi}
              options={lookups.wifiOpts}
              onChange={set("hasWifi")}
            />
          </div>
        </div>
      )}

      {subtype === "Laptop" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100 mb-4">
            Laptop Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FSelect
              label="Charger"
              value={form.includesCharger}
              options={lookups.chargerStatuses}
              onChange={set("includesCharger")}
              req
            />
            <FText
              label="Design Capacity (mWh)"
              value={form.designBatteryCapacity}
              onChange={set("designBatteryCapacity")}
              type="number"
              placeholder="e.g. 56000"
              min={1}
            />
            <FText
              label="Actual Capacity (mWh)"
              value={form.actualBatteryCapacity}
              onChange={set("actualBatteryCapacity")}
              type="number"
              placeholder="e.g. 48000"
              min={1}
            />
            {form.actualBatteryCapacity &&
              form.designBatteryCapacity &&
              Number(form.actualBatteryCapacity) > Number(form.designBatteryCapacity) && (
                <p className="col-span-full text-xs text-red-500 -mt-3">
                  Actual capacity cannot exceed design capacity.
                </p>
              )}
          </div>
        </div>
      )}

      {subtype === "Tablet" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100 mb-4">
            Tablet Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FSelect
              label="Charger"
              value={form.includesCharger}
              options={lookups.chargerStatuses}
              onChange={set("includesCharger")}
              req
            />
            <FSelect
              label="Working Battery"
              value={form.workingBattery}
              options={lookups.workingBatteryOpts}
              onChange={set("workingBattery")}
              req
            />
          </div>
        </div>
      )}
    </div>
  );
}
