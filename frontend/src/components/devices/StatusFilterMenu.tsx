import type { DeviceStatus } from "../../types/inventory";
import { DEFAULT_DEVICE_STATUSES, DEVICE_STATUS_OPTIONS } from "./deviceFilters";
import { FilterChecklistMenu } from "./FilterChecklistMenu";

interface StatusFilterMenuProps {
  selected: DeviceStatus[];
  onChange: (statuses: DeviceStatus[]) => void;
}

export function StatusFilterMenu({ selected, onChange }: StatusFilterMenuProps) {
  const isDefault =
    selected.length === DEFAULT_DEVICE_STATUSES.length &&
    DEFAULT_DEVICE_STATUSES.every((status) => selected.includes(status));

  return (
    <FilterChecklistMenu
      label="Statuses"
      options={DEVICE_STATUS_OPTIONS}
      selected={selected}
      onChange={onChange}
      isDefault={isDefault}
    />
  );
}
