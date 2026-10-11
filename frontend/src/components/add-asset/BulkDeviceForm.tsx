import type { Dispatch, SetStateAction } from "react";
import type { LookupData } from "../../hooks/useLookups";
import type { PartySummary } from "../../types/inventory";
import { inputCls, labelCls } from "../../utils/formStyles";
import { DonorField } from "./DonorField";
import { FCombo, FSelect, FText } from "./FormFields";
import type { BulkDeviceFormState, DeviceSubtype } from "./types";

const DEVICE_TYPES: DeviceSubtype[] = ["Desktop", "Laptop", "Tablet"];

export function BulkDeviceForm({
  form,
  setForm,
  lookups,
  selectedParty,
  onOpenPartyPicker,
  onClearParty,
}: {
  form: BulkDeviceFormState;
  setForm: Dispatch<SetStateAction<BulkDeviceFormState>>;
  lookups: LookupData;
  selectedParty: PartySummary | null;
  onOpenPartyPicker: () => void;
  onClearParty: () => void;
}) {
  function set<K extends keyof BulkDeviceFormState>(key: K) {
    return (value: BulkDeviceFormState[K]) =>
      setForm((previous) => ({ ...previous, [key]: value }));
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <FText
        label="Number of Devices"
        value={form.count}
        onChange={set("count")}
        req
        type="number"
        placeholder="e.g. 24"
        min={1}
        max={100}
      />
      <FSelect
        label="Device Type"
        value={form.type}
        options={DEVICE_TYPES}
        onChange={set("type")}
        req
      />
      <FCombo
        label="Manufacturer"
        value={form.manufacturer}
        options={lookups.manufacturers}
        onChange={set("manufacturer")}
        req
        placeholder="e.g. Dell"
        maxLength={50}
      />
      <FText
        label="Model"
        value={form.model}
        onChange={set("model")}
        req
        placeholder="e.g. Latitude 5420"
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
        label="Chapter"
        value={form.chapter}
        options={lookups.chapters}
        onChange={set("chapter")}
        req
      />
      <DonorField
        selectedParty={selectedParty}
        onOpen={onOpenPartyPicker}
        onClear={onClearParty}
        colSpan={false}
      />
      <div>
        <label className={labelCls}>Acquisition Date</label>
        <input
          type="date"
          data-testid="field-acquisition-date"
          value={form.acquisitionDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(event) => set("acquisitionDate")(event.target.value)}
          className={inputCls}
        />
      </div>
    </div>
  );
}
