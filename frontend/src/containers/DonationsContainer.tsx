import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { AnyDevice, ChapterInventorySummary } from "../types/inventory";
import { getDevices, getChapterInventorySummary } from "../services/deviceService";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useVisibleChapters } from "../context/ChapterContext";
import DonationsView from "../components/donations/DonationsView";

/**
 * DonationsContainer — owns the donated-device pagination, per-chapter donation
 * summary, chapter filter state, and device navigation.
 */
export default function DonationsContainer() {
  const navigate = useNavigate();
  const [chapterFilter, setChapterFilter] = useState<number | "All">("All");
  const chapters = useVisibleChapters();
  const [summary, setSummary] = useState<ChapterInventorySummary[]>([]);

  useEffect(() => {
    getChapterInventorySummary().then(setSummary);
  }, []);

  const fetchPage = useCallback(
    (pageKey: number, pageSize: number) =>
      getDevices({
        pageKey,
        pageSize,
        status: "Donated",
        includeDonated: true,
        chapter: chapterFilter === "All" ? undefined : chapterFilter,
      }),
    [chapterFilter]
  );
  const {
    items: donated,
    loading,
    sentinelRef,
  } = useInfiniteScroll<AnyDevice>(fetchPage, [chapterFilter]);

  const totalDonated = summary.reduce((sum, s) => sum + s.donated, 0);

  return (
    <DonationsView
      chapters={chapters}
      summary={summary}
      totalDonated={totalDonated}
      donated={donated}
      loading={loading}
      sentinelRef={sentinelRef}
      chapterFilter={chapterFilter}
      onChapterChange={setChapterFilter}
      onOpenDevice={(id) => navigate(`/devices/${id}`)}
    />
  );
}
