import { useState, useEffect, useMemo, useCallback } from "react";
import type { AnyDevice } from "../types/inventory";
import { getDevices } from "../services/deviceService";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useWritableChapters } from "../context/ChapterContext";
import { DevicePickerModal } from "../components/devices/DevicePickerModal";

export function DevicePickerModalContainer({
  onSelect,
  onCancel,
  chapterName,
}: {
  onSelect: (device: AnyDevice) => void;
  onCancel: () => void;
  chapterName?: string;
}) {
  const writableChapters = useWritableChapters();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const chapterId = useMemo(
    () => (chapterName ? writableChapters.find((c) => c.name === chapterName)?.id : undefined),
    [chapterName, writableChapters]
  );

  const fetchPage = useCallback(
    (pageKey: number, pageSize: number) =>
      getDevices({ pageKey, pageSize, search: debouncedSearch || undefined, chapter: chapterId }),
    [debouncedSearch, chapterId]
  );
  const { items, loading, sentinelRef } = useInfiniteScroll<AnyDevice>(fetchPage, [
    debouncedSearch,
    chapterId,
  ]);

  const writableChapterNames = useMemo(
    () => new Set(writableChapters.map((c) => c.name)),
    [writableChapters]
  );

  // Backend scopes to readable chapters; the picker only offers writable ones.
  const filtered = useMemo(
    () => items.filter((d) => d.chapter != null && writableChapterNames.has(d.chapter)),
    [items, writableChapterNames]
  );

  return (
    <DevicePickerModal
      devices={filtered}
      loading={loading}
      initialLoading={loading && items.length === 0}
      search={search}
      onSearchChange={setSearch}
      sentinelRef={sentinelRef}
      onSelect={onSelect}
      onCancel={onCancel}
      chapterName={chapterName}
    />
  );
}
