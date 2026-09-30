export default function LatestAnnouncement() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-emerald-700">
        Updates
      </p>

      <h2 className="mt-1 text-lg font-semibold text-slate-900">
        Latest Announcement
      </h2>

      <div className="mt-6 rounded-xl border border-dashed border-stone-300 p-5">
        <p className="text-sm font-medium text-slate-700">
          No announcements available.
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Published announcements will appear here when available.
        </p>
      </div>
    </section>
  );
}