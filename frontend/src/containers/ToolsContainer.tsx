import { useState, useEffect, useMemo, useCallback } from "react";
import { getTools } from "../services/toolService";
import { getChapterInventorySummary } from "../services/deviceService";
import type { ChapterInventorySummary, Tool } from "../types/inventory";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import ToolsView from "../components/tools/ToolsView";

/**
 * ToolsContainer — owns the tools pagination, chapter filter state, and the
 * per-chapter tool-count summary used for the true total.
 */
export default function ToolsContainer() {
  const [chapterFilter, setChapterFilter] = useState<number | "All">("All");
  const [summary, setSummary] = useState<ChapterInventorySummary[]>([]);
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getChapterInventorySummary().then((s) => {
      if (!cancelled) {
        setSummary(s);
        setSummaryLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchPage = useCallback(
    (pageKey: number, pageSize: number) =>
      getTools({
        pageKey,
        pageSize,
        chapter: chapterFilter === "All" ? undefined : chapterFilter,
      }),
    [chapterFilter]
  );
  const {
    items: tools,
    loading,
    sentinelRef,
  } = useInfiniteScroll<Tool>(fetchPage, [chapterFilter]);

  const toolTotal = useMemo(() => {
    const rows =
      chapterFilter === "All" ? summary : summary.filter((s) => s.chapterId === chapterFilter);
    return rows.reduce((sum, r) => sum + r.toolsCount, 0);
  }, [summary, chapterFilter]);

  const hasFilters = chapterFilter !== "All";

  return (
    <ToolsView
      tools={tools}
      loading={loading}
      sentinelRef={sentinelRef}
      summaryLoaded={summaryLoaded}
      toolTotal={toolTotal}
      chapterFilter={chapterFilter}
      onChapterChange={setChapterFilter}
      hasFilters={hasFilters}
      onClearFilters={() => setChapterFilter("All")}
    />
  );
}
