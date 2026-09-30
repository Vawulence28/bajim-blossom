export default function ItemStatusBadge({ status = "Awaiting data" }) {
  const styles = {
    Available: "bg-emerald-50 text-emerald-700",
    Collected: "bg-blue-50 text-blue-700",
    Pending: "bg-amber-50 text-amber-700",
    Cancelled: "bg-red-50 text-red-700",
    "Awaiting data": "bg-stone-100 text-slate-600",
  };

  const style = styles[status] || styles["Awaiting data"];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}