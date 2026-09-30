"use client";

import { useEffect, useState } from "react";

import {
    getMemberAnnouncements
} from "../../../services/memberApi.js";

import MemberLoadingState from "../../../components/member/MemberLoadingState";
import MemberEmptyState from "../../../components/member/MemberEmptyState";
import MemberErrorState from "../../../components/member/MemberErrorState";

function formatDate(value) {
    if (!value) {
        return "";
    }

    return new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium"
    }).format(new Date(value));
}

function categoryLabel(category) {
    return (category || "GENERAL")
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function MemberAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadAnnouncements() {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getMemberAnnouncements();

                if (active) {
                    setAnnouncements(
                        response.data?.announcements || []
                    );
                }
            } catch (requestError) {
                if (active) {
                    setError(
                        requestError.message ||
                            "Unable to load announcements."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadAnnouncements();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return <MemberLoadingState />;
    }

    if (error) {
        return (
            <MemberErrorState
                message={error}
            />
        );
    }

    return (
        <div className="min-w-0 space-y-5 sm:space-y-6">
            {/* Page Header */}
            <div className="min-w-0">
                <h1 className="text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                    Announcements
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-1">
                    Stay informed about updates and important information.
                </p>
            </div>

            {/* Empty State */}
            {announcements.length === 0 ? (
                <MemberEmptyState
                    title="No announcements"
                    message="There are no published announcements available right now."
                />
            ) : (
                <div className="min-w-0 space-y-3 sm:space-y-4">
                    {announcements.map((announcement) => (
                        <article
                            key={announcement.id}
                            className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
                        >
                            {/* Announcement Header */}
                            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                                <div className="min-w-0 flex-1">
                                    <h2 className="break-words text-base font-semibold leading-6 text-slate-900 sm:text-lg">
                                        {announcement.title}
                                    </h2>

                                    <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                                        {formatDate(
                                            announcement.publishedAt
                                        )}
                                    </p>
                                </div>

                                <span className="w-fit max-w-full shrink-0 break-words rounded-full bg-slate-100 px-3 py-1 text-xs font-medium leading-5 text-slate-700">
                                    {categoryLabel(
                                        announcement.category
                                    )}
                                </span>
                            </div>

                            {/* Announcement Content */}
                            <div className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 sm:mt-5">
                                {announcement.content}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
