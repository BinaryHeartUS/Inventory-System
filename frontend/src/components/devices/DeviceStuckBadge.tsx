export function DeviceStuckBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span
      aria-label="Device stuck"
      title="This device has had no recent activity"
      className={`inline-flex items-center gap-1 rounded-full bg-amber-100 font-semibold text-amber-800 ring-1 ring-inset ring-amber-200 ${
        size === "lg" ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-[11px]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
      Stuck
    </span>
  );
}
