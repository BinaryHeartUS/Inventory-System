/**
 * NotesPane — presentational notes panel for device, part, and tool detail pages.
 *
 * Receives the note list and add/edit callbacks via props. Owns only local
 * view-state for the compose box and inline edit (draft text, which note is being
 * edited). Data loading and optimistic persistence live in NotesPaneContainer.
 */

import { useState } from "react";
import type { Note } from "../types/inventory";

function formatNoteDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NotesPane({
  notes,
  readOnly = false,
  readOnlyReason = "donated",
  onAddNote,
  onEditNote,
}: {
  notes: Note[];
  readOnly?: boolean;
  readOnlyReason?: "donated" | "viewer";
  onAddNote: (text: string) => void;
  onEditNote: (id: number, text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  function submitNote() {
    const text = draft.trim();
    if (!text) return;
    onAddNote(text);
    setDraft("");
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setEditText(note.text);
  }

  function saveEdit(id: number) {
    const text = editText.trim();
    if (!text) return;
    onEditNote(id, text);
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  const inputCls =
    "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white";

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
      style={{ minHeight: "480px" }}
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center shrink-0">
        <h2 className="text-sm font-semibold text-slate-700">Notes</h2>
      </div>

      {/* Compose */}
      {readOnly ? (
        <div className="px-5 py-3 border-b border-slate-100 bg-amber-50 shrink-0">
          <p className="text-xs text-amber-700 font-medium">
            {readOnlyReason === "viewer"
              ? "Viewer accounts cannot edit notes."
              : "This device has been donated. Notes are read-only."}
          </p>
        </div>
      ) : (
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitNote();
            }}
            placeholder="Add a note… (Ctrl+Enter to submit)"
            rows={3}
            maxLength={500}
            className={`${inputCls} resize-none`}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-400">{draft.length}/500</span>
            <button
              onClick={submitNote}
              disabled={!draft.trim()}
              className="text-xs font-medium text-white bg-heart-blue hover:bg-heart-blue-dark disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors"
            >
              Add note
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-400"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">No notes yet</p>
            <p className="text-xs text-slate-400 mt-1">Add the first note above.</p>
          </div>
        ) : (
          <div className="relative py-2">
            {/* Timeline spine — starts below first dot, ends above last dot */}
            <div className="absolute left-8 top-[37px] bottom-[19px] w-px bg-slate-200" />

            {notes.map((note, idx) => (
              <div key={note.id} className="relative flex items-stretch gap-0 px-4 py-3 group">
                {/* Timeline dot column — aligned to date row */}
                <div className="relative z-10 flex-shrink-0 w-8 flex items-start justify-center pt-[7px]">
                  <div
                    className={`w-2.5 h-2.5 rounded-full border-2 transition-colors bg-white ${
                      idx === 0
                        ? "border-heart-blue"
                        : "border-slate-300 group-hover:border-slate-400"
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pl-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-medium text-slate-400">
                      {formatNoteDate(note.date)}
                    </p>
                    {!readOnly && editingId !== note.id && (
                      <button
                        onClick={() => startEdit(note)}
                        className="opacity-0 group-hover:opacity-100 text-[11px] text-slate-400 hover:text-slate-700 transition-all shrink-0"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {editingId === note.id ? (
                    <div>
                      <textarea
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        maxLength={500}
                        rows={3}
                        className={`${inputCls} border-slate-300 resize-none`}
                      />
                      <div className="flex gap-2 mt-2 justify-end">
                        <button
                          onClick={cancelEdit}
                          className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(note.id)}
                          disabled={!editText.trim()}
                          className="text-xs font-medium text-white bg-heart-blue hover:bg-heart-blue-dark disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1 rounded-lg transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed">{note.text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
