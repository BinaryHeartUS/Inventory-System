import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Generic infinite-scroll data loader for server-paginated + server-filtered list endpoints.
 *
 * `fetchPage(pageKey, pageSize)` should already encode the current filters/sort (via a closure).
 * Pass those same filter/sort values in `deps`; whenever they change the accumulated list is
 * reset and page 0 is re-fetched. A ref-based sentinel (attach `sentinelRef` to an element at
 * the bottom of the list) is observed with an IntersectionObserver and loads the next page as it
 * scrolls into view.
 *
 * In-flight requests from a previous filter state are discarded via a generation counter so a
 * slow response can never append stale rows after the filters change.
 */
export function useInfiniteScroll<T, E extends HTMLElement = HTMLDivElement>(
  fetchPage: (pageKey: number, pageSize: number) => Promise<T[]>,
  deps: unknown[],
  pageSize = 50
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const pageKeyRef = useRef(0);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const genRef = useRef(0);
  const fetchRef = useRef(fetchPage);
  const sentinelRef = useRef<E | null>(null);

  // Keep the latest fetcher without making loadMore change identity on every render.
  useEffect(() => {
    fetchRef.current = fetchPage;
  });

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    const gen = genRef.current;
    loadingRef.current = true;
    setLoading(true);
    try {
      const batch = await fetchRef.current(pageKeyRef.current, pageSize);
      if (gen !== genRef.current) return; // filters changed mid-flight; discard
      pageKeyRef.current += 1;
      const more = batch.length === pageSize;
      hasMoreRef.current = more;
      setHasMore(more);
      setItems((prev) => [...prev, ...batch]);
    } catch (e) {
      if (gen !== genRef.current) return;
      hasMoreRef.current = false;
      setHasMore(false);
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      if (gen === genRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [pageSize]);

  // Reset and reload page 0 whenever the filter/sort deps change (and on mount).
  useEffect(() => {
    genRef.current += 1;
    pageKeyRef.current = 0;
    hasMoreRef.current = true;
    loadingRef.current = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setItems([]);
    setHasMore(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */
    void loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Observe the sentinel. Re-created whenever the item count changes so that, if the
  // sentinel is still in view after a load (e.g. under a restrictive filter), the next
  // page is fetched immediately.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, items.length]);

  return { items, loading, hasMore, error, sentinelRef };
}
