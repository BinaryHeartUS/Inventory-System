/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { ChapterSummary } from "../types/inventory";
import { getChapters } from "../services/chapterService";
import { WRITE_ROLES } from "../utils/roles";
import { useAuth } from "./AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChapterContextValue {
  /** All chapters from the database — use for ID→name resolution. */
  chapters: ChapterSummary[];
  /** Returns the chapter name for a given ID, or a fallback string. */
  chapterName: (id: number) => string;
  /** Triggers a re-fetch of the chapter list. */
  refreshChapters: () => void;
}

/**
 * Returns only the chapters this user is allowed to see, excluding National
 * (which is a meta-chapter meaning "all chapters", not a real selectable one):
 * - Admins and users affiliated with National see every non-National chapter.
 * - Everyone else sees only their JWT chapterIds, minus National.
 */
export function useVisibleChapters(): ChapterSummary[] {
  const { chapters } = useChapters();
  const { auth } = useAuth();

  const real = chapters.filter((c) => c.name !== "National");

  if (!auth) return [];
  if (auth.role === "Admin") return real;

  // Check if the user is affiliated with the National chapter
  const nationalChapter = chapters.find((c) => c.name === "National");
  if (nationalChapter && auth.chapterIds.includes(nationalChapter.id)) return real;

  return real.filter((c) => auth.chapterIds.includes(c.id));
}

/**
 * Returns only the chapters this user can write to (Editor, Chapter Admin, or
 * Admin role). A National Viewer does NOT get write access to all chapters.
 */
export function useWritableChapters(): ChapterSummary[] {
  const { chapters } = useChapters();
  const { auth } = useAuth();

  const real = chapters.filter((c) => c.name !== "National" && c.active);

  if (!auth) return [];

  const nationalChapter = chapters.find((c) => c.name === "National");
  const hasNationalWrite =
    !!nationalChapter &&
    auth.chapterRoles.some((cr) => cr.chapterId === nationalChapter.id && WRITE_ROLES.has(cr.role));

  if (hasNationalWrite) return real;

  const writableIds = new Set(
    auth.chapterRoles.filter((cr) => WRITE_ROLES.has(cr.role)).map((cr) => cr.chapterId)
  );
  return real.filter((c) => writableIds.has(c.id));
}

/**
 * Returns true if the current user is a national admin:
 * has the Admin role AND is affiliated with the National chapter.
 */
export function useIsNationalAdmin(): boolean {
  const { chapters } = useChapters();
  const { auth } = useAuth();
  if (!auth || auth.role !== "Admin") return false;
  const national = chapters.find((c) => c.name === "National");
  return !!national && auth.chapterIds.includes(national.id);
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const ChapterContext = createContext<ChapterContextValue | null>(null);

export function useChapters(): ChapterContextValue {
  const ctx = useContext(ChapterContext);
  if (!ctx) throw new Error("useChapters must be used inside ChapterProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ChapterProvider({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let refreshing = false;
    const load = async () => {
      if (refreshing) return;
      if (!auth) {
        setChapters([]);
        setRefreshFailed(false);
        return;
      }
      refreshing = true;
      try {
        const data = await getChapters();
        if (!cancelled) {
          setChapters(data);
          setRefreshFailed(false);
        }
      } catch (error) {
        console.error("Could not refresh the synchronized chapter directory", error);
        if (!cancelled) setRefreshFailed(true);
      } finally {
        refreshing = false;
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 15000);
    const refresh = () => {
      if (document.visibilityState === "visible") void load();
    };
    window.addEventListener("focus", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [auth, refreshToken]);

  const refreshChapters = useCallback(() => setRefreshToken((t) => t + 1), []);

  function chapterName(id: number): string {
    const chapter = chapters.find((c) => c.id === id);
    return chapter ? chapter.name + (chapter.active ? "" : " (inactive)") : `Chapter ${id}`;
  }

  return (
    <ChapterContext.Provider value={{ chapters, chapterName, refreshChapters }}>
      {refreshFailed && (
        <div role="alert" className="bg-red-50 p-3 text-center text-sm text-red-700">
          Could not refresh chapters. Showing the last loaded directory; retrying automatically.
        </div>
      )}
      {children}
    </ChapterContext.Provider>
  );
}
