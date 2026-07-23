import { ROLE_BADGE_CLASS } from "../utils/roles";

/** A small pill showing a single role, colour-coded by seniority. */
export function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
        ROLE_BADGE_CLASS[role] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {role}
    </span>
  );
}
