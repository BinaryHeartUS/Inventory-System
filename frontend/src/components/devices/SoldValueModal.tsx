import { useState, type FormEvent } from "react";
import { inputCls, labelCls } from "../../utils/formStyles";

export function SoldValueModal({
  initialValue,
  onConfirm,
  onCancel,
}: {
  initialValue: number | string | null;
  onConfirm: (value: number) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue === null ? "" : String(initialValue));
  const amount = Number(value);
  const isValid = value.trim() !== "" && Number.isFinite(amount) && amount >= 0;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isValid) onConfirm(amount);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="sold-value-title"
        onSubmit={handleSubmit}
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm"
      >
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 id="sold-value-title" className="text-base font-semibold text-slate-900">
            Sold Device
          </h2>
          <p className="text-xs text-slate-500 mt-1">Enter the amount the device sold for.</p>
        </div>
        <div className="px-6 py-5">
          <label htmlFor="sold-device-value" className={labelCls}>
            Sale value ($)
          </label>
          <input
            id="sold-device-value"
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="e.g. 150.00"
            autoFocus
            required
            className={inputCls}
          />
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="text-sm font-medium text-white bg-brand-red hover:bg-brand-red-dark disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg transition-colors"
          >
            Confirm sale
          </button>
        </div>
      </form>
    </div>
  );
}
