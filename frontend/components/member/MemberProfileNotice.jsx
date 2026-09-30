export default function MemberProfileNotice() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <p className="text-sm font-semibold text-amber-900">
        Profile information
      </p>

      <p className="mt-1 text-sm leading-6 text-amber-800">
        Some account details are managed by Bajim Blossom administrators.
        Profile editing will be made available according to the permissions
        and account rules configured by the system.
      </p>
    </section>
  );
}