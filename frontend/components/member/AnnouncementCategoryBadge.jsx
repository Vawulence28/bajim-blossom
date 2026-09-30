const categoryStyles = {
  General: "bg-stone-100 text-slate-600",
  Contribution: "bg-emerald-50 text-emerald-700",
  Reminder: "bg-amber-50 text-amber-700",
  Important: "bg-red-50 text-red-700",
  "Awaiting data": "bg-stone-100 text-slate-600",
};

export default function AnnouncementCategoryBadge({
  category = "Awaiting data",
}) {
  const style =
    categoryStyles[category] || categoryStyles["Awaiting data"];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {category}
    </span>
  );
}