export default function MemberErrorState({
  title = "Something went wrong",
  message = "We could not load this information right now. Please try again later.",
  onRetry,
}) {
  return (
    <div
      className="flex min-h-48 items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6"
      role="alert"
    >
      <div className="max-w-md text-center">
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl font-semibold text-red-600 shadow-sm ring-1 ring-red-100"
          aria-hidden="true"
        >
          !
        </div>

        <h3 className="mt-4 text-sm font-semibold text-red-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-red-800">
          {message}
        </p>

        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}