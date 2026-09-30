export default function MemberAccountInformation() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-emerald-700">
          Account Information
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Account Details
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          System-managed account information will be displayed here.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex flex-col gap-1 rounded-xl border border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Member ID
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Your unique Bajim Blossom member identifier.
            </p>
          </div>

          <span className="text-sm font-medium text-slate-500">
            Not available
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-xl border border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Account Status
            </p>

            <p className="mt-1 text-xs text-slate-500">
              The current status of your membership account.
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Not available
          </span>
        </div>
      </div>
    </section>
  );
}