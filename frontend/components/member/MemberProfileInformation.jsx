function ProfileField({ label, value = "Not available" }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-medium text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function MemberProfileInformation() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-emerald-700">
          Personal Information
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Your Details
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Your registered member information will appear here when your
          account data is connected.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ProfileField label="Full Name" />
        <ProfileField label="Member ID" />
        <ProfileField label="Phone Number" />
        <ProfileField label="Email Address" />
        <ProfileField label="Date Joined" />
        <ProfileField label="Account Status" />
      </div>
    </section>
  );
}