const trashIcon = (
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
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export function DeleteConfirmButton({
  noun,
  showing,
  onShowConfirm,
  onConfirm,
  onCancel,
  disabled,
  disabledTitle,
}: {
  noun: string;
  showing: boolean;
  onShowConfirm: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
  disabledTitle?: string;
}) {
  if (showing) {
    return (
      <>
        <span className="text-xs text-slate-500">Delete this {noun}?</span>
        <button
          onClick={onConfirm}
          className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-lg transition-colors"
        >
          Confirm
        </button>
        <button
          onClick={onCancel}
          className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </>
    );
  }
  return (
    <button
      onClick={onShowConfirm}
      disabled={disabled}
      title={disabledTitle}
      className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg transition-colors"
    >
      {trashIcon}
      Delete
    </button>
  );
}
