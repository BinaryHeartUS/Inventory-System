import { useState } from "react";
import { generateDonationReceipt, buildDescription } from "../utils/generateDonationReceipt";
import { inputCls, labelCls } from "../utils/formStyles";

export interface ReceiptItem {
  id: number;
  label: string;
  year?: number | string | null;
  value: number | null;
}

export function DonationReceiptModal({
  donorName,
  items,
  onClose,
}: {
  donorName: string;
  items: ReceiptItem[];
  onClose: () => void;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
  const autoValue = items.reduce((sum, i) => sum + (i.value ?? 0), 0);
  const [donationDate, setDonationDate] = useState("");
  const [value, setValue] = useState(autoValue > 0 ? `$${autoValue}` : "");
  const [repName, setRepName] = useState("");
  const [repTitle, setRepTitle] = useState("");
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    const description = buildDescription(items.map((i) => ({ label: i.label, year: i.year })));
    await generateDonationReceipt({
      donorName,
      donationDate: donationDate || today,
      value: value || "—",
      description,
      repName,
      repTitle,
    });
    setGenerating(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Generate Donation Receipt</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {items.length} item{items.length !== 1 ? "s" : ""} selected · donor: {donorName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <div>
            <p className={labelCls}>Donation Description (auto-generated)</p>
            <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 leading-relaxed">
              {buildDescription(items.map((i) => ({ label: i.label, year: i.year })))}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Donation Date</label>
              <input
                type="text"
                value={donationDate}
                onChange={(e) => setDonationDate(e.target.value)}
                placeholder={today}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Donation Value</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. $7800"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>
              Representative Name <span className="text-red-400">*</span>
            </label>
            <input
              value={repName}
              onChange={(e) => setRepName(e.target.value)}
              placeholder="Full name"
              maxLength={80}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>
              Representative Title <span className="text-red-400">*</span>
            </label>
            <input
              value={repTitle}
              onChange={(e) => setRepTitle(e.target.value)}
              placeholder="e.g. Director of Technology"
              maxLength={80}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Date of Receipt</label>
            <p className="text-sm text-slate-600 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              {today} (today)
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!repName.trim() || !repTitle.trim() || generating}
            className="flex items-center gap-2 text-sm font-medium text-white bg-heart-blue hover:bg-heart-blue/90 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 rounded-lg transition-colors"
          >
            {generating ? (
              <svg
                className="animate-spin"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            {generating ? "Generating…" : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
