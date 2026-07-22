import { useNavigate } from "react-router-dom";
import type { Tool } from "../types/inventory";
import { useChapters } from "../context/ChapterContext";
import { formatDate } from "../utils/dateUtils";

export function ToolRow({ tool }: { tool: Tool }) {
  const navigate = useNavigate();
  const { chapterName } = useChapters();
  const chapter = chapterName(tool.chapterId);

  return (
    <tr
      key={tool.id}
      onClick={() => navigate(`/tools/${tool.id}`)}
      className="hover:bg-slate-50 transition-colors cursor-pointer"
    >
      <td className="px-5 py-5 font-mono text-xs text-slate-400" data-label="ID">
        {tool.id}
      </td>
      <td className="px-5 py-5 text-slate-600 max-w-xs" data-label="Description">
        <span className="block truncate" title={tool.description}>
          {tool.description}
        </span>
      </td>
      <td className="px-5 py-5 text-slate-500 max-w-[160px]" data-label="Chapter">
        <span className="block truncate" title={chapter}>
          {chapter}
        </span>
      </td>
      <td className="px-5 py-5 text-slate-700" data-label="Value">
        {tool.value != null ? (
          `$${tool.value.toFixed(2)}`
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="px-5 py-5 text-slate-400 whitespace-nowrap" data-label="Acquired">
        {formatDate(tool.acquisitionDate) ?? "—"}
      </td>
    </tr>
  );
}
