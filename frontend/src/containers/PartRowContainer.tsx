import { useNavigate } from "react-router-dom";
import type { Part } from "../types/inventory";
import { useChapters } from "../context/ChapterContext";
import { PartRow } from "../components/PartRow";

/**
 * Wraps the presentational {@link PartRow}, resolving the chapter name and
 * supplying row-click navigation to the part detail page.
 */
export function PartRowContainer({
  part,
  onUnlink,
  hideTypeCol,
}: {
  part: Part;
  onUnlink?: (e: React.MouseEvent) => void;
  hideTypeCol?: boolean;
}) {
  const navigate = useNavigate();
  const { chapterName } = useChapters();
  return (
    <PartRow
      part={part}
      chapter={chapterName(part.chapterId)}
      onSelect={(id) => navigate(`/parts/${id}`)}
      onUnlink={onUnlink}
      hideTypeCol={hideTypeCol}
    />
  );
}
