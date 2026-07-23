/**
 * ChapterFilterContainer — feeds the visible-chapter list from context into the
 * presentational ChapterTabs and translates chapter names to IDs for callers.
 */

import { useVisibleChapters } from "../context/ChapterContext";
import ChapterTabs from "../components/ChapterTabs";

interface Props {
  selected: number | "All";
  onChange: (chapterId: number | "All") => void;
}

export default function ChapterFilterContainer({ selected, onChange }: Props) {
  const chapters = useVisibleChapters();
  const names = chapters.map((c) => c.name);
  const selectedName =
    selected === "All" ? "All" : (chapters.find((c) => c.id === selected)?.name ?? "All");

  function handleChange(name: string) {
    if (name === "All") {
      onChange("All");
      return;
    }
    const match = chapters.find((c) => c.name === name);
    onChange(match ? match.id : "All");
  }

  return <ChapterTabs chapters={names} selected={selectedName} onChange={handleChange} />;
}
