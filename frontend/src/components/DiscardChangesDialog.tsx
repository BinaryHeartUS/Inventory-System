/**
 * DiscardChangesDialog — presentational confirmation shown when the user tries
 * to leave a page with unsaved changes. UI only; the navigation decision is
 * handled by UnsavedChangesGuard via the onKeepEditing / onDiscard callbacks.
 */
export default function DiscardChangesDialog({
  onKeepEditing,
  onDiscard,
}: {
  onKeepEditing: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onKeepEditing} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-slate-900">Discard unsaved changes?</h2>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
          You have unsaved changes on this page. If you leave now, your changes will be lost.
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onKeepEditing}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Keep editing
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-brand-red-dark transition-colors"
          >
            Discard changes
          </button>
        </div>
      </div>
    </div>
  );
}
