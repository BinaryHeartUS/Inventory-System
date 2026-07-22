import { useNavigate } from "react-router-dom";
import type { Part } from "../types/inventory";
import { useChapters } from "../context/ChapterContext";

export function PartRow({
  part,
  onUnlink,
  hideTypeCol = false,
}: {
  part: Part;
  onUnlink?: (e: React.MouseEvent) => void;
  hideTypeCol?: boolean;
}) {
  const navigate = useNavigate();
  const { chapterName } = useChapters();

  return (
    <tr
      key={part.id}
      onClick={() => navigate(`/parts/${part.id}`)}
      className="hover:bg-slate-50 transition-colors cursor-pointer"
    >
      <td className="px-5 py-5 font-mono text-xs text-slate-400" data-label="ID">
        {part.id}
      </td>
      {!hideTypeCol && (
        <td className="px-5 py-5" data-label="Type">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {part.type}
          </span>
        </td>
      )}
      <td className="px-5 py-5 text-slate-700" data-label="Description">
        {part.description}
      </td>
      <td className="px-5 py-5 text-slate-500" data-label="Chapter">
        {chapterName(part.chapterId)}
      </td>
      <td className="px-5 py-5" data-label="Source">
        <span
          className={`text-sm font-medium ${part.wasPurchased ? "text-slate-500" : "text-green-600"}`}
        >
          {part.wasPurchased ? "Purchased" : "Donated"}
        </span>
      </td>
      <td className="px-5 py-5" data-label="Contained In">
        {part.containedIn != null ? (
          <span className="font-mono text-xs text-heart-blue">#{part.containedIn}</span>
        ) : (
          <span className="text-slate-300 text-xs">Loose</span>
        )}
      </td>
      <td className="px-5 py-5 text-slate-400 whitespace-nowrap" data-label="Acquired">
        {part.acquisitionDate ?? "—"}
      </td>
      {onUnlink !== undefined && (
        <td className="px-5 py-5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onUnlink}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
            title="Unlink from this device"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" />
              <path d="M5.17 11.75l-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" />
              <line x1="8" y1="2" x2="8" y2="5" />
              <line x1="2" y1="8" x2="5" y2="8" />
              <line x1="16" y1="19" x2="16" y2="22" />
              <line x1="19" y1="16" x2="22" y2="16" />
            </svg>
            Unlink
          </button>
        </td>
      )}
    </tr>
  );
}
