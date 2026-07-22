interface Props {
  chapters: string[];
  selected: string;
  onChange: (chapter: string) => void;
}

export default function ChapterTabs({ chapters, selected, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full overflow-x-auto sm:w-fit sm:flex-wrap sm:overflow-visible">
      {(["All", ...chapters] as string[]).map((ch) => (
        <button
          key={ch}
          onClick={() => onChange(ch)}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            selected === ch
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {ch === "All" ? "All Chapters" : ch}
        </button>
      ))}
    </div>
  );
}
