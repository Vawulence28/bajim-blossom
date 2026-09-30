const statusStyles = {
  Paid: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Overdue: "bg-red-50 text-red-700",
  "Not available": "bg-stone-100 text-slate-600",
};

export default function MemberStatusBadge({
  status = "Not available",
}) {
  const style =
    statusStyles[status] || statusStyles["Not available"];

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}