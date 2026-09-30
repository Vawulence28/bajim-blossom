import PaymentStatusBadge from "./PaymentStatusBadge";

export default function ContributionHistory() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 p-6">
        <p className="text-sm font-medium text-emerald-700">
          Records
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Contribution History
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Your verified contribution payment records will appear here.
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cycle
              </th>

              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Expected
              </th>

              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Paid
              </th>

              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Method
              </th>

              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center">
                <div className="mx-auto max-w-md">
                  <p className="text-sm font-medium text-slate-700">
                    No contribution records yet.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Verified payments will appear here once contribution
                    records are available.
                  </p>

                  <div className="mt-4">
                    <PaymentStatusBadge />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 p-4 md:hidden">
        <div className="rounded-xl border border-dashed border-stone-300 p-5 text-center">
          <p className="text-sm font-medium text-slate-700">
            No contribution records yet.
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Verified payments will appear here once contribution records are
            available.
          </p>

          <div className="mt-4">
            <PaymentStatusBadge />
          </div>
        </div>
      </div>
    </section>
  );
}