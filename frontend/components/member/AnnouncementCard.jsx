import AnnouncementCategoryBadge from "./AnnouncementCategoryBadge";

export default function AnnouncementCard() {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Publication date unavailable
          </p>

          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            Announcement information will appear here
          </h2>
        </div>

        <AnnouncementCategoryBadge />
      </div>

      <div className="mt-5 rounded-xl bg-stone-50 p-4">
        <p className="text-sm leading-6 text-slate-600">
          Published announcement content will be displayed here once
          announcements are available for your member account.
        </p>
      </div>

      <div className="mt-5">
        <button
          type="button"
          disabled
          className="rounded-lg border border-stone-200 bg-stone-100 px-4 py-2 text-sm font-medium text-slate-400"
        >
          View announcement
        </button>
      </div>
    </article>
  );
}