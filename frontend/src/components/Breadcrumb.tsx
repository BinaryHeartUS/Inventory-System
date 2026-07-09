import { Link } from "react-router-dom";

export function Breadcrumb({
  backHref,
  backLabel,
  current,
}: {
  backHref: string;
  backLabel: string;
  current: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <Link to={backHref} className="hover:text-slate-600 transition-colors">
        {backLabel}
      </Link>
      <span>/</span>
      <span className="text-slate-600 font-medium">{current}</span>
    </div>
  );
}
