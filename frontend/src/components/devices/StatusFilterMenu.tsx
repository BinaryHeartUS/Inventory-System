import type { DeviceStatus } from "../../types/inventory";
import { DEFAULT_DEVICE_STATUSES, DEVICE_STATUS_OPTIONS } from "./deviceFilters";
import { FilterChecklistMenu } from "./FilterChecklistMenu";

interface StatusFilterMenuProps {
  selected: DeviceStatus[];
  onChange: (statuses: DeviceStatus[]) => void;
  showStuck: boolean;
  onShowStuckChange: (value: boolean) => void;
}

export function StatusFilterMenu({
  selected,
  onChange,
  showStuck,
  onShowStuckChange,
}: StatusFilterMenuProps) {
  const isDefault =
    !showStuck &&
    selected.length === DEFAULT_DEVICE_STATUSES.length &&
    DEFAULT_DEVICE_STATUSES.every((status) => selected.includes(status));

  return (
    <FilterChecklistMenu
      label="Statuses"
      options={DEVICE_STATUS_OPTIONS}
      selected={selected}
      onChange={onChange}
      isDefault={isDefault}
      footer={
        <label className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
          <input
            type="checkbox"
            checked={showStuck}
            onChange={(event) => onShowStuckChange(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-amber-500"
          />
          Stuck only
        </label>
      }
    />
  );
}
