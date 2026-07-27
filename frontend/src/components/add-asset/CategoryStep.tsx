import type { ReactNode } from "react";
import type { AssetCategory } from "./types";

const CATEGORY_CARDS: {
  cat: AssetCategory;
  color: string;
  title: string;
  desc: string;
  icon: ReactNode;
}[] = [
  {
    cat: "Device",
    color: "border-heart-blue/25 bg-heart-blue/5 hover:bg-heart-blue/10 text-heart-blue",
    title: "Device",
    desc: "Desktop, laptop, or tablet computer",
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
    cat: "Part",
    color: "border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600",
    title: "Part",
    desc: "RAM, SSD, charger, or other component",
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
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="2" x2="9" y2="4" />
        <line x1="15" y1="2" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="22" />
        <line x1="15" y1="20" x2="15" y2="22" />
        <line x1="20" y1="9" x2="22" y2="9" />
        <line x1="20" y1="14" x2="22" y2="14" />
        <line x1="2" y1="9" x2="4" y2="9" />
        <line x1="2" y1="14" x2="4" y2="14" />
      </svg>
    ),
  },
  {
    cat: "Tool",
    color: "border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600",
    title: "Tool",
    desc: "Screwdriver, thermal paste, USB drive, etc.",
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
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
];

export function CategoryStep({ onSelect }: { onSelect: (cat: AssetCategory) => void }) {
  return (
    <div>
      <p className="text-sm text-slate-500 mb-5">What type of asset is this?</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CATEGORY_CARDS.map(({ cat, color, title, desc, icon }) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center ${color}`}
          >
            <div className="opacity-75">{icon}</div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs opacity-70 mt-0.5 leading-snug">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
