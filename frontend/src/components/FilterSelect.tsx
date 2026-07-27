import React from "react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;

export default function FilterSelect({ className = "", children, ...props }: Props) {
  return (
    <div className="relative w-full sm:w-auto">
      <select
        {...props}
        className={`w-full sm:w-48 appearance-none truncate text-sm text-slate-700 bg-white border border-slate-200 rounded-lg pl-3 pr-9 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all cursor-pointer ${className}`}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}
