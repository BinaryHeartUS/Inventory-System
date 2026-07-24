import { useState, useEffect } from "react";
import type { Note } from "../types/inventory";
import { getNotesByAsset, createNote, updateNote } from "../services/noteService";
import { useToast } from "../context/ToastContext";
import NotesPane from "../components/NotesPane";

export default function NotesPaneContainer({
  assetId,
  readOnly = false,
  readOnlyReason = "donated",
}: {
  assetId: number;
  readOnly?: boolean;
  readOnlyReason?: "donated" | "viewer";
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    getNotesByAsset(assetId).then(setNotes);
  }, [assetId]);

  function handleAddNote(text: string) {
    // Optimistic update — give the note a temporary client-side ID
    const optimistic: Note = { id: Date.now(), assetId, date: new Date().toISOString(), text };
    setNotes((prev) => [optimistic, ...prev]);
    createNote(assetId, text)
      .then((saved) => {
        // Replace the optimistic entry with the server-returned note (real ID)
        setNotes((prev) => prev.map((n) => (n.id === optimistic.id ? saved : n)));
      })
      .catch((err) => {
        // Revert optimistic update and show error
        setNotes((prev) => prev.filter((n) => n.id !== optimistic.id));
        showToast(err instanceof Error ? err.message : "Failed to add note", false);
      });
  }

  function handleEditNote(id: number, text: string) {
    const prevText = notes.find((n) => n.id === id)?.text ?? "";
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
    updateNote(assetId, id, text).catch((err) => {
      // Revert optimistic update and show error
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text: prevText } : n)));
      showToast(err instanceof Error ? err.message : "Failed to update note", false);
    });
  }

  return (
    <NotesPane
      notes={notes}
      readOnly={readOnly}
      readOnlyReason={readOnlyReason}
      onAddNote={handleAddNote}
      onEditNote={handleEditNote}
    />
  );
}
