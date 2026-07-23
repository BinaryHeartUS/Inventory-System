import { useNavigate } from "react-router-dom";
import type { Tool } from "../types/inventory";
import { useChapters } from "../context/ChapterContext";
import { ToolRow } from "../components/ToolRow";

/**
 * Wraps the presentational {@link ToolRow}, resolving the chapter name and
 * supplying row-click navigation to the tool detail page.
 */
export function ToolRowContainer({ tool }: { tool: Tool }) {
  const navigate = useNavigate();
  const { chapterName } = useChapters();
  return (
    <ToolRow
      tool={tool}
      chapter={chapterName(tool.chapterId)}
      onSelect={(id) => navigate(`/tools/${id}`)}
    />
  );
}
