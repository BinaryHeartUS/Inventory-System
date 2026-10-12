export const UNSPECIFIED_OPERATING_SYSTEM = "__UNSPECIFIED_OPERATING_SYSTEM__";

export function getSelectedOperatingSystems(
  operatingSystems: string | null,
  includeUnspecified: boolean,
  options: string[]
): string[] {
  const allOptions = [...options, UNSPECIFIED_OPERATING_SYSTEM];
  if (operatingSystems === null && !includeUnspecified) return allOptions;

  const requested = new Set(operatingSystems?.split(",").map((value) => value.trim()) ?? []);
  const selected = options.filter((option) => requested.has(option));
  if (includeUnspecified) selected.push(UNSPECIFIED_OPERATING_SYSTEM);
  return selected.length > 0 ? selected : allOptions;
}

export function hasDefaultOperatingSystems(selected: string[], options: string[]): boolean {
  const allOptions = [...options, UNSPECIFIED_OPERATING_SYSTEM];
  return (
    selected.length === allOptions.length && allOptions.every((option) => selected.includes(option))
  );
}

export function getOperatingSystemFilterParams(selected: string[], options: string[]) {
  if (hasDefaultOperatingSystems(selected, options)) {
    return { operatingSystems: undefined, includeUnspecifiedOperatingSystem: undefined };
  }

  const namedOperatingSystems = selected.filter(
    (operatingSystem) => operatingSystem !== UNSPECIFIED_OPERATING_SYSTEM
  );
  return {
    operatingSystems:
      namedOperatingSystems.length > 0 ? namedOperatingSystems.join(",") : undefined,
    includeUnspecifiedOperatingSystem: selected.includes(UNSPECIFIED_OPERATING_SYSTEM)
      ? true
      : undefined,
  };
}