import { useNavigate } from "react-router-dom";
import type { Tool } from "../types/inventory";
import { useChapters } from "../context/ChapterContext";
import { formatDate } from "../utils/dateUtils";

export function ToolRow({ tool }: { tool: Tool }) {
  const navigate = useNavigate();
  const { chapterName } = useChapters();

  return (
    <tr
      key={tool.id}
      onClick={() => navigate(`/tools/${tool.id}`)}
      className="hover:bg-slate-50 transition-colors cursor-pointer"
    >
      <td className="px-5 py-5 font-mono text-xs text-slate-400">{tool.id}</td>
      <td className="px-5 py-5 text-slate-600 max-w-xs truncate">{tool.description}</td>
      <td className="px-5 py-5 text-slate-500">{chapterName(tool.chapterId)}</td>
      <td className="px-5 py-5 text-slate-700">
        {tool.value != null ? (
          `$${tool.value.toFixed(2)}`
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="px-5 py-5 text-slate-400 whitespace-nowrap">
        {formatDate(tool.acquisitionDate) ?? "—"}
      </td>
    </tr>
  );
}
