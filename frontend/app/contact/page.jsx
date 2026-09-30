"use client";

import { useEffect, useState } from "react";

import {
    getPublicContactInfo,
    submitContactEnquiry
} from "../../services/contactApi";

export default function ContactPage() {
    const [contactInfo, setContactInfo] =
        useState(null);

    const [loadingInfo, setLoadingInfo] =
        useState(true);

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        message: ""
    });

    const [submitting, setSubmitting] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    useEffect(() => {
        let mounted = true;

        async function loadContactInfo() {
            try {
                setLoadingInfo(true);

                const response =
                    await getPublicContactInfo();

                if (mounted) {
                    setContactInfo(
                        response?.data || null
                    );
                }
            } catch (error) {
                console.error(
                    "Contact information error:",
                    error
                );

                if (mounted) {
                    setErrorMessage(
                        error?.message ||
                            "Unable to load contact information."
                    );
                }
            } finally {
                if (mounted) {
                    setLoadingInfo(false);
                }
            }
        }

        loadContactInfo();

        return () => {
            mounted = false;
        };
    }, []);

    function handleChange(event) {
        const { name, value } =
            event.target;

        setForm((current) => ({
            ...current,
            [name]: value
        }));

        if (errorMessage) {
            setErrorMessage("");
        }

        if (successMessage) {
            setSuccessMessage("");
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response =
                await submitContactEnquiry(form);

            setSuccessMessage(
                response?.message ||
                    "Your message has been received. We will get back to you."
            );

            setForm({
                fullName: "",
                email: "",
                message: ""
            });
        } catch (error) {
            console.error(
                "Contact enquiry error:",
                error
            );

            setErrorMessage(
                error?.data?.message ||
                    error?.message ||
                    "Unable to send your message. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    const organizationName =
        contactInfo?.organization_name ||
        "BAJIM BLOSSOM KITCHEN & HOUSEHOLD ITEMS";

    const organizationDescription =
        contactInfo?.organization_description ||
        "";

    const phone =
        contactInfo?.organization_phone || "";

    const email =
        contactInfo?.organization_email || "";

    const address =
        contactInfo?.organization_address || "";

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#faf8f2]">
            <section className="px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:px-8 lg:py-20">
                <div className="mx-auto w-full max-w-6xl">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8066] sm:text-sm sm:tracking-[0.2em]">
                            Contact
                        </p>

                        <h1 className="mt-3 break-words text-3xl font-bold tracking-tight text-[#26332b] sm:text-4xl md:text-5xl">
                            We’re here to help.
                        </h1>

                        <p className="mt-4 max-w-2xl break-words text-sm leading-7 text-[#687069] sm:mt-5 sm:text-base sm:leading-8">
                            Have a question about Bajim Blossom,
                            membership or your contributions?
                            Send us a message and the appropriate
                            administrator can follow up with you.
                        </p>
                    </div>

                    {errorMessage && (
                        <div
                            role="alert"
                            className="mt-6 rounded-2xl border border-[#ead0cc] bg-[#fff5f3] p-4 sm:mt-8 sm:p-5"
                        >
                            <p className="break-words text-sm font-medium leading-6 text-[#8a4036]">
                                {errorMessage}
                            </p>
                        </div>
                    )}

                    <div className="mt-7 grid gap-5 sm:mt-8 sm:gap-6 lg:mt-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
                        {/* Contact Information */}
                        <section className="min-w-0 rounded-2xl border border-[#e7e2d5] bg-white p-5 shadow-[0_10px_30px_rgba(38,51,43,0.04)] sm:rounded-3xl sm:p-7 md:p-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#7b8066] sm:text-sm sm:tracking-[0.15em]">
                                Contact information
                            </p>

                            <h2 className="mt-3 break-words text-xl font-bold leading-7 text-[#26332b] sm:text-2xl sm:leading-8">
                                {organizationName}
                            </h2>

                            {organizationDescription && (
                                <p className="mt-3 break-words text-sm leading-7 text-[#687069] sm:mt-4">
                                    {organizationDescription}
                                </p>
                            )}

                            <div className="mt-7 space-y-5 sm:mt-8 sm:space-y-6">
                                <ContactDetail
                                    label="Phone"
                                    value={phone}
                                    loading={loadingInfo}
                                />

                                <ContactDetail
                                    label="Email"
                                    value={email}
                                    loading={loadingInfo}
                                />

                                <ContactDetail
                                    label="Address"
                                    value={address}
                                    loading={loadingInfo}
                                />
                            </div>

                            {!loadingInfo &&
                                !phone &&
                                !email &&
                                !address && (
                                    <div className="mt-7 rounded-2xl bg-[#faf8f2] p-4 sm:mt-8 sm:p-5">
                                        <p className="break-words text-sm leading-6 text-[#687069]">
                                            Contact details have not
                                            yet been provided by the
                                            administrator.
                                        </p>
                                    </div>
                                )}
                        </section>

                        {/* Contact Form */}
                        <section className="min-w-0 rounded-2xl border border-[#e7e2d5] bg-white p-5 shadow-[0_10px_30px_rgba(38,51,43,0.04)] sm:rounded-3xl sm:p-7 md:p-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#7b8066] sm:text-sm sm:tracking-[0.15em]">
                                Send a message
                            </p>

                            <h2 className="mt-3 break-words text-xl font-bold leading-7 text-[#26332b] sm:text-2xl sm:leading-8">
                                How can we help?
                            </h2>

                            <form
                                onSubmit={handleSubmit}
                                className="mt-6 space-y-5 sm:mt-8"
                            >
                                <div>
                                    <label
                                        htmlFor="fullName"
                                        className="mb-2 block text-sm font-medium text-[#26332b]"
                                    >
                                        Full Name
                                    </label>

                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        value={
                                            form.fullName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        maxLength={150}
                                        autoComplete="name"
                                        placeholder="Enter your full name"
                                        className="min-h-11 w-full min-w-0 rounded-xl border border-[#ddd8ca] bg-white px-4 py-3 text-sm text-[#26332b] outline-none transition focus:border-[#7b8066] focus:ring-2 focus:ring-[#7b8066]/10"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-medium text-[#26332b]"
                                    >
                                        Email Address
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={
                                            form.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        maxLength={255}
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        className="min-h-11 w-full min-w-0 rounded-xl border border-[#ddd8ca] bg-white px-4 py-3 text-sm text-[#26332b] outline-none transition focus:border-[#7b8066] focus:ring-2 focus:ring-[#7b8066]/10"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="message"
                                        className="mb-2 block text-sm font-medium text-[#26332b]"
                                    >
                                        Message
                                    </label>

                                    <textarea
                                        id="message"
                                        name="message"
                                        value={
                                            form.message
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        rows={7}
                                        maxLength={5000}
                                        placeholder="Tell us how we can help..."
                                        className="min-h-40 w-full min-w-0 resize-y rounded-xl border border-[#ddd8ca] bg-white px-4 py-3 text-sm leading-6 text-[#26332b] outline-none transition focus:border-[#7b8066] focus:ring-2 focus:ring-[#7b8066]/10 sm:min-h-44"
                                    />
                                </div>

                                {successMessage && (
                                    <div
                                        role="status"
                                        className="rounded-xl border border-[#cfe3d2] bg-[#f1f8f2] p-4"
                                    >
                                        <p className="break-words text-sm leading-6 text-[#356044]">
                                            {successMessage}
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="min-h-11 w-full rounded-xl bg-[#26332b] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#34453a] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting
                                        ? "Sending..."
                                        : "Send Message"}
                                </button>
                            </form>
                        </section>
                    </div>
                </div>
            </section>
        </main>
    );
}

function ContactDetail({
    label,
    value,
    loading
}) {
    return (
        <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a918c] sm:text-xs">
                {label}
            </p>

            {loading ? (
                <div className="mt-2 h-5 w-32 max-w-full animate-pulse rounded bg-[#f2eee5] sm:w-40" />
            ) : value ? (
                <p className="mt-2 break-words whitespace-pre-line text-sm leading-6 text-[#26332b]">
                    {value}
                </p>
            ) : (
                <p className="mt-2 text-sm text-[#9a9f9b]">
                    Not provided
                </p>
            )}
        </div>
    );
}