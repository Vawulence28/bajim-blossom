export default function RecentContributions() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-stone-200 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Payment History
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Recent Contributions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your latest recorded contribution payments will appear here.
          </p>
        </div>

        <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-slate-600">
          No records
        </span>
      </div>

      <div className="p-6">
        <div className="rounded-xl border border-dashed border-stone-300 px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">
            No contribution records are available yet.
          </p>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Once contribution payments are recorded and verified, your recent
            payment history will appear here.
          </p>
        </div>
      </div>
    </section>
  );
}