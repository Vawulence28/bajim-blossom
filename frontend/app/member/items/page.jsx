"use client";

import { useEffect, useState } from "react";

import {
    getMemberItems
} from "../../../services/memberApi.js";

import MemberItemSummary from "../../../components/member/MemberItemSummary";
import MemberItemHistory from "../../../components/member/MemberItemHistory";
import MemberItemsNotice from "../../../components/member/MemberItemsNotice";

import MemberLoadingState from "../../../components/member/MemberLoadingState";
import MemberEmptyState from "../../../components/member/MemberEmptyState";
import MemberErrorState from "../../../components/member/MemberErrorState";

export default function MemberItemsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadItems() {
            try {
                setLoading(true);
                setError("");

                const response = await getMemberItems();

                if (isMounted) {
                    setData(response.data);
                }
            } catch (requestError) {
                if (isMounted) {
                    setError(
                        requestError.message ||
                            "Unable to load your items."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadItems();

        return () => {
            isMounted = false;
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

    if (!data) {
        return (
            <MemberEmptyState
                title="No item information"
                message="Your assigned items are not currently available."
            />
        );
    }

    const {
        summary,
        items
    } = data;

    return (
        <div className="min-w-0 space-y-5 sm:space-y-6">
            {/* Page Header */}
            <div className="min-w-0">
                <h1 className="text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                    My Items
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-1">
                    View items assigned to you and their collection status.
                </p>
            </div>

            {/* Information Notice */}
            <div className="min-w-0">
                <MemberItemsNotice />
            </div>

            {/* Item Summary */}
            <div className="min-w-0">
                <MemberItemSummary
                    summary={summary}
                />
            </div>

            {/* Item History */}
            {items?.length > 0 ? (
                <div className="min-w-0">
                    <MemberItemHistory
                        items={items}
                    />
                </div>
            ) : (
                <MemberEmptyState
                    title="No items assigned"
                    message="Items assigned to your membership will appear here."
                />
            )}
        </div>
    );
}
