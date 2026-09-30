export default function MemberProfileSummary() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-2xl font-bold text-emerald-700">
          M
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Member Profile
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Member information unavailable
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Member ID: Not available
          </p>
        </div>

        <div className="self-start sm:self-center">
          <span className="inline-flex rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            Status unavailable
          </span>
        </div>
      </div>
    </section>
  );
}