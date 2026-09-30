export default function StatusCycleInformation() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-emerald-700">
          Cycle Information
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Contribution Deadline
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          The active cycles is configured payment and grace-period information
          will appear here.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Due Date
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            Not available
          </p>
        </div>

        <div className="rounded-xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Grace Period
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            Not available
          </p>
        </div>

        <div className="rounded-xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Fine Status
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            Not available
          </p>
        </div>
      </div>
    </section>
  );
}