import ItemStatusBadge from "./ItemStatusBadge";

function formatDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);
}

function getStatusLabel(status) {
    switch (status) {
        case "ASSIGNED":
            return "Assigned";

        case "COLLECTED":
            return "Collected";

        case "CANCELLED":
            return "Cancelled";

        default:
            return status || "Unknown";
    }
}

function getStatusClasses(status) {
    switch (status) {
        case "ASSIGNED":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";

        case "COLLECTED":
            return "bg-blue-50 text-blue-700 border-blue-200";

        case "CANCELLED":
            return "bg-red-50 text-red-700 border-red-200";

        default:
            return "bg-stone-50 text-stone-700 border-stone-200";
    }
}

export default function MemberItemHistory({ items = [] }) {
    return (
        <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 p-6">
                <p className="text-sm font-medium text-emerald-700">
                    Item Records
                </p>

                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    My Household Items
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                    Household items associated with your member account will
                    appear here.
                </p>
            </div>

            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
                {items.length > 0 ? (
                    <table className="w-full text-left">
                        <thead className="border-b border-stone-200 bg-stone-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Item
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Description
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Quantity
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Date Recorded
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-stone-100">
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="transition hover:bg-stone-50"
                                >
                                    <td className="px-6 py-5">
                                        <p className="font-medium text-slate-900">
                                            {item.itemName || "Unnamed item"}
                                        </p>
                                    </td>

                                    <td className="max-w-sm px-6 py-5">
                                        <p className="text-sm leading-6 text-slate-600">
                                            {item.itemDescription || "—"}
                                        </p>
                                    </td>

                                    <td className="px-6 py-5">
                                        <span className="text-sm font-medium text-slate-900">
                                            {item.quantity ?? 0}
                                        </span>
                                    </td>

                                    <td className="px-6 py-5">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                                                item.status
                                            )}`}
                                        >
                                            {getStatusLabel(item.status)}
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-600">
                                        {formatDate(item.assignedAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm font-medium text-slate-700">
                            No household items have been recorded.
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Items associated with your account will appear here
                            when records are available.
                        </p>

                        <div className="mt-4 flex justify-center">
                            <ItemStatusBadge />
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile */}
            <div className="space-y-4 p-4 md:hidden">
                {items.length > 0 ? (
                    items.map((item) => (
                        <article
                            key={item.id}
                            className="rounded-xl border border-stone-200 p-5"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-emerald-700">
                                        Household Item
                                    </p>

                                    <h3 className="mt-1 text-base font-semibold text-slate-900">
                                        {item.itemName || "Unnamed item"}
                                    </h3>
                                </div>

                                <span
                                    className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                                        item.status
                                    )}`}
                                >
                                    {getStatusLabel(item.status)}
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Quantity
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                        {item.quantity ?? 0}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Date Recorded
                                    </p>

                                    <p className="mt-1 text-sm text-slate-700">
                                        {formatDate(item.assignedAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Description
                                </p>

                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                    {item.itemDescription || "No description provided."}
                                </p>
                            </div>

                            {item.collectedAt && (
                                <div className="mt-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Collected Date
                                    </p>

                                    <p className="mt-1 text-sm text-slate-700">
                                        {formatDate(item.collectedAt)}
                                    </p>
                                </div>
                            )}

                            {item.notes && (
                                <div className="mt-4 rounded-lg bg-stone-50 p-3">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Notes
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        {item.notes}
                                    </p>
                                </div>
                            )}
                        </article>
                    ))
                ) : (
                    <div className="rounded-xl border border-dashed border-stone-300 p-5 text-center">
                        <p className="text-sm font-medium text-slate-700">
                            No household items have been recorded.
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Items associated with your account will appear here
                            when records are available.
                        </p>

                        <div className="mt-4 flex justify-center">
                            <ItemStatusBadge />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}