export default function FineSummary() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-emerald-700">
          Fines
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Contribution Fines
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Applicable fines associated with your contribution records will be
          shown here.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-stone-300 px-5 py-8 text-center">
        <p className="text-sm font-medium text-slate-700">
          No fine records available.
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Fine information will be displayed when applicable records exist.
        </p>
      </div>
    </section>
  );
}