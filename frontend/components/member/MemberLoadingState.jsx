export default function MemberLoadingState({
  message = "Loading your information...",
}) {
  return (
    <div
      className="flex min-h-48 items-center justify-center rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-emerald-600"
          aria-hidden="true"
        />

        <p className="mt-4 text-sm font-medium text-slate-700">
          {message}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Please wait a moment.
        </p>
      </div>
    </div>
  );
}