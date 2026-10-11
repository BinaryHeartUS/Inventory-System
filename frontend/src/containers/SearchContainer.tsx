import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { AnyDevice, Part, Tool } from "../types/inventory";
import { getDevices } from "../services/deviceService";
import { getParts } from "../services/partService";
import { getTools } from "../services/toolService";
import { fetchAllPages } from "../services/api";
import { useChapters } from "../context/ChapterContext";
import { getAssetPath } from "../services/assetService";
import SearchView from "../components/SearchView";

// Cap each category's results so a broad/short query can't pull an unbounded number of rows.
// The server-side search already filters; this bounds a match-everything query to a top-N.
const SEARCH_RESULT_CAP = 100;

export default function SearchContainer() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [assetId, setAssetId] = useState("");
  const [assetIdError, setAssetIdError] = useState<string | null>(null);
  const [findingAsset, setFindingAsset] = useState(false);
  const [deviceResults, setDeviceResults] = useState<AnyDevice[]>([]);
  const [partResults, setPartResults] = useState<Part[]>([]);
  const [toolResults, setToolResults] = useState<Tool[]>([]);
  const [searching, setSearching] = useState(false);
  const { chapterName } = useChapters();

  const q = query.trim();

  // Server-side search across devices, parts and tools (debounced). Empty query clears results.
  useEffect(() => {
    let cancelled = false;
    // Reflect the pending search immediately so the UI shows "Searching…" while the
    // debounce timer and the request are in flight (instead of flashing "No results").
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setSearching(!!q);
    const timer = setTimeout(() => {
      if (!q) {
        setDeviceResults([]);
        setPartResults([]);
        setToolResults([]);
        return;
      }
      Promise.all([
        fetchAllPages(
          (pageKey, pageSize) =>
            getDevices({
              pageKey,
              pageSize,
              search: q,
              includeDonated: true,
              includeScrapped: true,
            }),
          SEARCH_RESULT_CAP,
          SEARCH_RESULT_CAP
        ),
        fetchAllPages(
          (pageKey, pageSize) => getParts({ pageKey, pageSize, search: q }),
          SEARCH_RESULT_CAP,
          SEARCH_RESULT_CAP
        ),
        fetchAllPages(
          (pageKey, pageSize) => getTools({ pageKey, pageSize, search: q }),
          SEARCH_RESULT_CAP,
          SEARCH_RESULT_CAP
        ),
      ]).then(([d, p, t]) => {
        if (cancelled) return;
        setDeviceResults(d);
        setPartResults(p);
        setToolResults(t);
        setSearching(false);
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q]);

  async function handleAssetIdSearch() {
    const id = Number(assetId.trim());
    if (!assetId.trim() || !Number.isInteger(id) || id <= 0) {
      setAssetIdError("Enter a positive whole-number asset ID.");
      return;
    }
    setFindingAsset(true);
    setAssetIdError(null);
    try {
      const path = await getAssetPath(id);
      if (path) {
        navigate(path);
      } else {
        setAssetIdError(`No asset with ID ${id} was found.`);
      }
    } catch {
      setAssetIdError("Unable to look up that asset.");
    } finally {
      setFindingAsset(false);
    }
  }

  return (
    <SearchView
      assetId={assetId}
      assetIdError={assetIdError}
      findingAsset={findingAsset}
      onAssetIdChange={(value) => {
        setAssetId(value);
        setAssetIdError(null);
      }}
      onAssetIdSearch={handleAssetIdSearch}
      query={query}
      onQueryChange={setQuery}
      searching={searching}
      deviceResults={deviceResults}
      partResults={partResults}
      toolResults={toolResults}
      resultCap={SEARCH_RESULT_CAP}
      chapterName={chapterName}
    />
  );
}
