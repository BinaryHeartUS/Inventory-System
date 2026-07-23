import { useEffect, useMemo, useState } from "react";
import { getChapterInventorySummary } from "../services/deviceService";
import type { ChapterInventorySummary } from "../types/inventory";
import { useVisibleChapters, useIsNationalAdmin, useChapters } from "../context/ChapterContext";
import { createChapter, deleteChapter } from "../services/chapterService";
import ChaptersView from "../components/chapters/ChaptersView";

/**
 * ChaptersContainer — owns the per-chapter inventory summary plus chapter
 * create/delete actions (national admins only).
 */
export default function ChaptersContainer() {
  const visibleChapters = useVisibleChapters();
  const { refreshChapters } = useChapters();
  const isNationalAdmin = useIsNationalAdmin();
  const [summary, setSummary] = useState<ChapterInventorySummary[]>([]);
  const [summaryLoaded, setSummaryLoaded] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    getChapterInventorySummary().then((s) => {
      setSummary(s);
      setSummaryLoaded(true);
    });
  }, []);

  const summaryByChapter = useMemo(() => new Map(summary.map((s) => [s.chapterId, s])), [summary]);

  async function handleCreate(name: string): Promise<string | null> {
    try {
      await createChapter(name);
      refreshChapters();
      return null;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return msg || "Failed to create chapter. Please try again.";
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
    <ChaptersView
      chapters={visibleChapters}
      summaryByChapter={summaryByChapter}
      summaryLoaded={summaryLoaded}
      isNationalAdmin={isNationalAdmin}
      deletingId={deletingId}
      onCreate={handleCreate}
      onDelete={handleDelete}
    />
  );
}
