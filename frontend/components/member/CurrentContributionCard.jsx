export default function CurrentContributionCard() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Current Cycle
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Current Contribution
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Your current contribution cycle details will appear here.
          </p>
        </div>

        <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Awaiting data
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Cycle
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            Not available
          </p>
        </div>

        <div className="rounded-xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Expected Amount
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            Not available
          </p>
        </div>

        <div className="rounded-xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Due Date
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            Not available
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-stone-300 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Payment Status
        </p>

        <p className="mt-2 text-sm font-medium text-slate-700">
          Payment information will be loaded from your authenticated member
          account.
        </p>
      </div>
    </section>
  );
}