import type { DeviceStatus } from "../../types/inventory";
import { DEVICE_STATUS_OPTIONS } from "./deviceFilters";
import { FilterChecklistMenu } from "./FilterChecklistMenu";

interface StatusFilterMenuProps {
  selected: DeviceStatus[];
  onChange: (statuses: DeviceStatus[]) => void;
}

export function StatusFilterMenu({ selected, onChange }: StatusFilterMenuProps) {
  return (
    <FilterChecklistMenu
      label="Statuses"
      options={DEVICE_STATUS_OPTIONS}
      selected={selected}
      onChange={onChange}
    />
  );
}
