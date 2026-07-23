/**
 * AddAssetButton — presentational "Add Asset" button. UI only; the click
 * behavior (opening the add-asset modal) is injected via onClick by
 * AddAssetButtonContainer.
 */
export default function AddAssetButton({
  className = "",
  onClick,
}: {
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-brand-red hover:bg-brand-red-dark shadow-sm px-5 py-2.5 rounded-lg transition-colors ${className}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Add Asset
    </button>
  );
}
