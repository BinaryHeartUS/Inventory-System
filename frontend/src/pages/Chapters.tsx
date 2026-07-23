import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getChapterInventorySummary } from "../services/deviceService";
import type { ChapterInventorySummary } from "../types/inventory";
import { useVisibleChapters, useIsNationalAdmin, useChapters } from "../context/ChapterContext";
import { createChapter, deleteChapter } from "../services/chapterService";
import PageHeading from "../components/PageHeading";

export default function Chapters() {
  const visibleChapters = useVisibleChapters();
  const { refreshChapters } = useChapters();
  const isNationalAdmin = useIsNationalAdmin();
  const [summary, setSummary] = useState<ChapterInventorySummary[]>([]);
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    getChapterInventorySummary().then((s) => {
      setSummary(s);
      setSummaryLoaded(true);
    });
  }, []);

  const summaryByChapter = useMemo(() => new Map(summary.map((s) => [s.chapterId, s])), [summary]);

  function openModal() {
    setNewName("");
    setCreateError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setNewName("");
    setCreateError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setCreateError("Chapter name must not be blank.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      await createChapter(trimmed);
      refreshChapters();
      closeModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCreateError(msg || "Failed to create chapter. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete chapter "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteChapter(id);
      refreshChapters();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete chapter.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeading
          title="Chapters"
          subtitle={`Inventory summary across all ${visibleChapters.length} chapters`}
        />
        {isNationalAdmin && (
          <button
            onClick={openModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-red text-white text-sm font-semibold hover:bg-brand-red-dark transition-colors w-full sm:w-auto"
          >
            <span className="text-lg leading-none">+</span> New Chapter
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="responsive-cards w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Chapter
              </th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total
              </th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pipeline
              </th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ready
              </th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Donated
              </th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Scrapped
              </th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Parts
              </th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Tools
              </th>
              <th className="px-4 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleChapters.map((ch) => {
              const s = summaryByChapter.get(ch.id);
              const desktop = s?.desktopCount ?? 0;
              const laptop = s?.laptopCount ?? 0;
              const tablet = s?.tabletCount ?? 0;
              const total = s?.totalDevices ?? 0;
              const pipeline = (s?.notStarted ?? 0) + (s?.inProgress ?? 0);
              const ready = s?.readyToDonate ?? 0;
              const donated = s?.donated ?? 0;
              const scrapped = s?.scrapped ?? 0;
              const partsCount = s?.partsCount ?? 0;
              const toolsCount = s?.toolsCount ?? 0;
              const isEmpty = total === 0 && partsCount === 0 && toolsCount === 0;
              const isNational = ch.name === "National";
              const blockers: string[] = [];
              if (total > 0) blockers.push(`${total} device${total !== 1 ? "s" : ""}`);
              if (partsCount > 0) blockers.push(`${partsCount} part${partsCount !== 1 ? "s" : ""}`);
              if (toolsCount > 0) blockers.push(`${toolsCount} tool${toolsCount !== 1 ? "s" : ""}`);
              const deleteTitle = isEmpty
                ? "Delete chapter"
                : `Cannot delete — chapter still has ${blockers.join(", ")}`;
              return (
                <tr key={ch.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-900 text-base">{ch.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {summaryLoaded ? `${desktop}D · ${laptop}L · ${tablet}T` : "—"}
                    </p>
                  </td>
                  <td className="px-4 py-5 text-right" data-label="Total">
                    <span className="text-base font-bold text-slate-900">
                      {summaryLoaded ? total : <span className="text-slate-300">—</span>}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-right" data-label="Pipeline">
                    <span
                      className={`text-base font-semibold ${pipeline > 0 ? "text-amber-600" : "text-slate-300"}`}
                    >
                      {summaryLoaded ? pipeline : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-right" data-label="Ready">
                    <span
                      className={`text-base font-semibold ${ready > 0 ? "text-green-600" : "text-slate-300"}`}
                    >
                      {summaryLoaded ? ready : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-right" data-label="Donated">
                    <span
                      className={`text-base font-semibold ${donated > 0 ? "text-sky-600" : "text-slate-300"}`}
                    >
                      {summaryLoaded ? donated : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-right" data-label="Scrapped">
                    <span
                      className={`text-base font-semibold ${scrapped > 0 ? "text-red-500" : "text-slate-300"}`}
                    >
                      {summaryLoaded ? scrapped : "—"}
                    </span>
                  </td>
                  <td
                    className="px-4 py-5 text-right text-slate-500 font-medium"
                    data-label="Parts"
                  >
                    {summaryLoaded ? partsCount : <span className="text-slate-300">—</span>}
                  </td>
                  <td
                    className="px-4 py-5 text-right text-slate-500 font-medium"
                    data-label="Tools"
                  >
                    {summaryLoaded ? toolsCount : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-5 text-right" data-label="">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        to={`/devices?chapter=${encodeURIComponent(ch.name)}`}
                        className="text-sm font-semibold text-brand-red hover:text-brand-red-dark transition-colors"
                      >
                        View →
                      </Link>
                      {isNationalAdmin && !isNational && (
                        <button
                          onClick={() => handleDelete(ch.id, ch.name)}
                          disabled={!summaryLoaded || !isEmpty || deletingId === ch.id}
                          title={deleteTitle}
                          className="text-slate-300 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          {deletingId === ch.id ? (
                            <span className="text-xs">Deleting…</span>
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
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">New Chapter</h2>
            <p className="text-sm text-slate-400 mb-5">Enter the name for the new chapter.</p>
            <form onSubmit={handleCreate} noValidate>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Chapter Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Purdue University"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                autoFocus
              />
              {createError && <p className="mt-2 text-sm text-red-600">{createError}</p>}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-brand-red text-white text-sm font-semibold hover:bg-brand-red-dark transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Create Chapter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
