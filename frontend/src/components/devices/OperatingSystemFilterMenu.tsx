import { FilterChecklistMenu } from "./FilterChecklistMenu";
import {
  hasDefaultOperatingSystems,
  UNSPECIFIED_OPERATING_SYSTEM,
} from "./operatingSystemFilters";

interface OperatingSystemFilterMenuProps {
  options: string[];
  selected: string[];
  onChange: (operatingSystems: string[]) => void;
}

export function OperatingSystemFilterMenu({
  options,
  selected,
  onChange,
}: OperatingSystemFilterMenuProps) {
  const allOptions = [...options, UNSPECIFIED_OPERATING_SYSTEM];

  return (
    <FilterChecklistMenu
      label="Operating Systems"
      options={allOptions}
      selected={selected}
      onChange={onChange}
      isDefault={hasDefaultOperatingSystems(selected, options)}
      optionLabel={(operatingSystem) =>
        operatingSystem === UNSPECIFIED_OPERATING_SYSTEM ? "Not specified" : operatingSystem
      }
    />
  );
}