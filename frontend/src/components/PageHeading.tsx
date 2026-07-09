interface Props {
  title: string;
  subtitle: React.ReactNode;
  /** Use compact for smaller pages (e.g. Dashboard, Donations) */
  compact?: boolean;
}

export default function PageHeading({ title, subtitle, compact = false }: Props) {
  return (
    <div className="border-l-4 border-brand-red pl-3">
      <h1 className={`${compact ? "text-xl" : "text-2xl"} font-bold text-slate-900 tracking-tight`}>
        {title}
      </h1>
      <p className={`${compact ? "text-sm" : "text-base"} text-slate-400 mt-1`}>{subtitle}</p>
    </div>
  );
}
