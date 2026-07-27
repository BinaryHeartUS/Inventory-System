import type { ReactNode } from "react";
import type { DeviceSubtype } from "./types";

const SUBTYPE_CARDS: { sub: DeviceSubtype; title: string; desc: string; icon: ReactNode }[] = [
  {
    sub: "Desktop",
    title: "Desktop",
    desc: "Tower or all-in-one",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    sub: "Laptop",
    title: "Laptop",
    desc: "Portable laptop computer",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55A1 1 0 0 1 20.37 20H3.62a1 1 0 0 1-.9-1.45L4 16" />
      </svg>
    ),
  },
  {
    sub: "Tablet",
    title: "Tablet",
    desc: "Touch-screen tablet",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
];

export function SubtypeStep({ onSelect }: { onSelect: (sub: DeviceSubtype) => void }) {
  return (
    <div>
      <p className="text-sm text-slate-500 mb-5">What kind of device is this?</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SUBTYPE_CARDS.map(({ sub, title, desc, icon }) => (
          <button
            key={sub}
            onClick={() => onSelect(sub)}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-heart-blue/25 bg-heart-blue/5 hover:bg-heart-blue/10 text-heart-blue transition-all text-center"
          >
            <div className="opacity-75">{icon}</div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs opacity-70 mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
