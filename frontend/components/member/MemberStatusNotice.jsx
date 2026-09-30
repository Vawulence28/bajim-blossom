export default function MemberStatusNotice() {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <p className="text-sm font-semibold text-emerald-900">
        Member status information
      </p>

      <p className="mt-1 text-sm leading-6 text-emerald-800">
        This page only displays information that your member account is
        permitted to view. Individual payment details belonging to other
        members are not exposed here.
      </p>
    </section>
  );
}