import type { ReactNode } from "react";

/**
 * Card-style section with an icon + title header and an optional count badge.
 * Renders children directly beneath the header (no inner grid), so it suits
 * tables and custom content. Distinct from the field-grid `Section` component.
 */
export function SectionCard({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: ReactNode;
  count?: number;
  children: ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <span className="text-slate-500">{icon}</span>
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        {count !== undefined && (
          <span className="ml-1 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
