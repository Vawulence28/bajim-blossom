"use client";

import { useEffect, useState } from "react";

import {
    getMemberProfile,
    updateMemberProfile
} from "../../../services/memberApi.js";

import MemberLoadingState from "../../../components/member/MemberLoadingState";
import MemberErrorState from "../../../components/member/MemberErrorState";

function formatDate(value) {
    if (!value) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium"
    }).format(new Date(value));
}

export default function MemberProfilePage() {
    const [profile, setProfile] = useState(null);

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        address: "",
        emergencyContact: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let active = true;

        async function loadProfile() {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getMemberProfile();

                if (!active) {
                    return;
                }

                const memberProfile =
                    response.data?.profile;

                setProfile(memberProfile);

                setForm({
                    fullName:
                        memberProfile?.fullName || "",
                    phone:
                        memberProfile?.phone || "",
                    address:
                        memberProfile?.address || "",
                    emergencyContact:
                        memberProfile?.emergencyContact || ""
                });
            } catch (requestError) {
                if (active) {
                    setError(
                        requestError.message ||
                            "Unable to load your profile."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            active = false;
        };
    }, []);

    function handleChange(event) {
        const {
            name,
            value
        } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const response =
                await updateMemberProfile({
                    fullName: form.fullName,
                    phone: form.phone,
                    address: form.address || null,
                    emergencyContact:
                        form.emergencyContact || null
                });

            const updatedProfile =
                response.data?.profile;

            setProfile(updatedProfile);

            setForm({
                fullName:
                    updatedProfile?.fullName || "",
                phone:
                    updatedProfile?.phone || "",
                address:
                    updatedProfile?.address || "",
                emergencyContact:
                    updatedProfile?.emergencyContact || ""
            });

            setMessage(
                response.message ||
                    "Profile updated successfully."
            );
        } catch (requestError) {
            setError(
                requestError.message ||
                    "Unable to update your profile."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <MemberLoadingState />;
    }

    if (!profile && error) {
        return (
            <MemberErrorState
                message={error}
            />
        );
    }

    if (!profile) {
        return (
            <MemberErrorState
                message="Your member profile could not be loaded."
            />
        );
    }

    return (
        <div className="min-w-0 space-y-5 sm:space-y-6">
            {/* Page Header */}
            <div className="min-w-0">
                <h1 className="text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                    My Profile
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-1">
                    Review and update your personal information.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div
                    role="alert"
                    className="min-w-0 overflow-hidden rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                >
                    <p className="break-words">
                        {error}
                    </p>
                </div>
            )}

            {/* Success Message */}
            {message && (
                <div
                    role="status"
                    className="min-w-0 overflow-hidden rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700"
                >
                    <p className="break-words">
                        {message}
                    </p>
                </div>
            )}

            {/* Account Information */}
            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                    Account Information
                </h2>

                <div className="mt-5 grid min-w-0 gap-5 sm:grid-cols-2">
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Member ID
                        </p>

                        <p className="mt-1 break-words font-medium text-slate-900">
                            {profile.memberId ||
                                "Not assigned"}
                        </p>
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Email
                        </p>

                        <p className="mt-1 break-all font-medium text-slate-900">
                            {profile.email}
                        </p>
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Membership Status
                        </p>

                        <p className="mt-1 break-words font-medium text-slate-900">
                            {profile.status}
                        </p>
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Joined
                        </p>

                        <p className="mt-1 break-words font-medium text-slate-900">
                            {formatDate(
                                profile.joinedAt
                            )}
                        </p>
                    </div>
                </div>
            </section>

            {/* Personal Information */}
            <form
                onSubmit={handleSubmit}
                className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
            >
                <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                    Personal Information
                </h2>

                <div className="mt-5 grid min-w-0 gap-5 sm:mt-6 sm:grid-cols-2">
                    {/* Full Name */}
                    <label className="block min-w-0">
                        <span className="text-sm font-medium text-slate-700">
                            Full Name
                        </span>

                        <input
                            type="text"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                            minLength={2}
                            className="mt-2 min-h-11 w-full min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                        />
                    </label>

                    {/* Phone */}
                    <label className="block min-w-0">
                        <span className="text-sm font-medium text-slate-700">
                            Phone
                        </span>

                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            minLength={7}
                            maxLength={30}
                            className="mt-2 min-h-11 w-full min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                        />
                    </label>

                    {/* Address */}
                    <label className="block min-w-0 sm:col-span-2">
                        <span className="text-sm font-medium text-slate-700">
                            Address
                        </span>

                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            rows={4}
                            className="mt-2 w-full min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                        />
                    </label>

                    {/* Emergency Contact */}
                    <label className="block min-w-0 sm:col-span-2">
                        <span className="text-sm font-medium text-slate-700">
                            Emergency Contact
                        </span>

                        <input
                            type="text"
                            name="emergencyContact"
                            value={form.emergencyContact}
                            onChange={handleChange}
                            className="mt-2 min-h-11 w-full min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                        />
                    </label>
                </div>

                {/* Save Button */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="min-h-11 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
