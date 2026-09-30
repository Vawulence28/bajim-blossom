export default function MemberStatCard({
  label,
  value,
  description,
  status,
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">
          {label}
        </p>

        {status && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            {status}
          </span>
        )}
      </div>

      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}