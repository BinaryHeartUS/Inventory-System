export function DeviceStuckBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span
      aria-label="Device stuck"
      title="This device has had no recent activity"
      className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-50 font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 ${
        size === "lg" ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-[11px]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" />
      Stuck
    </span>
  );
}
