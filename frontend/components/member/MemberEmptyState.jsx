export default function MemberEmptyState({
  title = "Nothing to display",
  message = "There is currently no information available here.",
}) {
  return (
    <div
      className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-md text-center">
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-slate-400 shadow-sm ring-1 ring-stone-200"
          aria-hidden="true"
        >
          —
        </div>

        <h3 className="mt-4 text-sm font-semibold text-slate-800">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {message}
        </p>
      </div>
    </div>
  );
}