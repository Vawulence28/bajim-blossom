export default function ContributionCycleStatus() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Active Cycle
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Current Contribution Cycle
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Your current cycle payment information will be displayed here
            after your account is connected to the contribution records.
          </p>
        </div>

        <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Awaiting data
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        <div className="rounded-xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Payment Status
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            Not available
          </p>
        </div>

        <div className="rounded-xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Outstanding
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            Not available
          </p>
        </div>
      </div>
    </section>
  );
}