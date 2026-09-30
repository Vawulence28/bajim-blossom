import AnnouncementCard from "./AnnouncementCard";

export default function AnnouncementsList() {
  return (
    <section>
      <div className="mb-5">
        <p className="text-sm font-medium text-emerald-700">
          Published Updates
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          All Announcements
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Published announcements available to members will appear below.
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="rounded-xl border border-dashed border-stone-300 px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">
            No announcements available.
          </p>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            When an announcement is published for members, it will appear
            here.
          </p>
        </div>
      </div>
    </section>
  );
}