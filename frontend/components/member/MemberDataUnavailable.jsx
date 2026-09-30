export default function MemberDataUnavailable({
  label = "Information unavailable",
  message = "This information is not available at the moment.",
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-stone-200"
          aria-hidden="true"
        >
          i
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">
            {label}
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}