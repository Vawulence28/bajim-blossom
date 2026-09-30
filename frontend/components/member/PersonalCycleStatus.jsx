import MemberStatusBadge from "./MemberStatusBadge";

export default function PersonalCycleStatus() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Your Status
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Current Contribution Status
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Your payment status for the active contribution cycle will be
            loaded from your authenticated member account.
          </p>
        </div>

        <MemberStatusBadge />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            Expected
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            Not available
          </p>
        </div>

        <div className="rounded-xl bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Paid
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