import { deviceTypeLabel } from "../../utils/deviceTypeLabel";
import { DEVICE_TYPES, type DeviceType } from "./deviceFilters";
import { FilterChecklistMenu } from "./FilterChecklistMenu";

interface DeviceTypeFilterMenuProps {
  selected: DeviceType[];
  onChange: (types: DeviceType[]) => void;
}

export function DeviceTypeFilterMenu({ selected, onChange }: DeviceTypeFilterMenuProps) {
  return (
    <FilterChecklistMenu
      label="Device Types"
      options={DEVICE_TYPES}
      selected={selected}
      onChange={onChange}
      optionLabel={deviceTypeLabel}
    />
  );
}
