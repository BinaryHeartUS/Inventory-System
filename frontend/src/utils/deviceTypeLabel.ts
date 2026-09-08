export function deviceTypeLabel(type?: string | null): string {
  return type === "Tablet" ? "Mobile Device" : (type ?? "");
}

export function deviceTypePluralLabel(type: string): string {
  return type === "Tablet" ? "Mobile Devices" : `${type}s`;
}
