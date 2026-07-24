interface ExportCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  count: number;
  colorText: string;
  colorBg: string;
  onExport: () => void;
  busy: boolean;
  loading: boolean;
}

export function ExportCard({
  title,
  icon,
  description,
  count,
  colorText,
  colorBg,
  onExport,
  busy,
  loading,
}: ExportCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col h-full">
      <div
        className={`w-9 h-9 ${colorBg} ${colorText} rounded-lg flex items-center justify-center mb-4 shrink-0`}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-800">{title} Export</p>
      <p className="text-xs text-slate-400 mt-2 flex-1 leading-relaxed">{description}</p>
      <button
        onClick={onExport}
        disabled={loading || count === 0 || busy}
        className={`mt-4 w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
          !loading && count > 0 && !busy
            ? `${colorBg} ${colorText} hover:opacity-80`
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        {loading
          ? "Loading…"
          : busy
            ? "Preparing…"
            : count > 0
              ? `Download CSV (${count} rows)`
              : "No data to export"}
      </button>
    </div>
  );
}
