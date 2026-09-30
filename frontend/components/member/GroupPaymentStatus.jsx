export default function GroupPaymentStatus() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-emerald-700">
          Group Overview
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Current Cycle Payment Status
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Aggregate payment information for the active contribution cycle.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-emerald-50 p-5">
          <p className="text-sm font-medium text-emerald-800">
            Members Paid
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-900">
            Not available
          </p>

          <p className="mt-2 text-xs leading-5 text-emerald-700">
            Aggregate count supplied by the backend.
          </p>
        </div>

        <div className="rounded-xl bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-800">
            Members Pending
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-900">
            Not available
          </p>

          <p className="mt-2 text-xs leading-5 text-amber-700">
            Aggregate count supplied by the backend.
          </p>
        </div>
      </div>
    </section>
  );
}