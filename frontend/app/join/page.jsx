"use client";

import Link from "next/link";
import { useState } from "react";

import PublicNavbar from "../../components/public/PublicNavbar";
import PublicFooter from "../../components/public/PublicFooter";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

const INITIAL_FORM = {
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    emergencyContact: ""
};

export default function JoinPage() {
    const [formData, setFormData] =
        useState(INITIAL_FORM);

    const [showPassword, setShowPassword] =
        useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword
    ] = useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [errors, setErrors] =
        useState({});

    const [generalError, setGeneralError] =
        useState("");

    const [
        applicationSubmitted,
        setApplicationSubmitted
    ] = useState(false);

    const [
        applicationDetails,
        setApplicationDetails
    ] = useState(null);

    function handleChange(event) {
        const {
            name,
            value
        } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value
        }));

        setErrors((current) => {
            if (!current[name]) {
                return current;
            }

            const updated = {
                ...current
            };

            delete updated[name];

            return updated;
        });

        if (generalError) {
            setGeneralError("");
        }
    }

    function validateClientSide() {
        const nextErrors = {};

        const fullName =
            formData.fullName.trim();

        const phone =
            formData.phone.trim();

        const email =
            formData.email.trim();

        const password =
            formData.password;

        const confirmPassword =
            formData.confirmPassword;

        if (!fullName) {
            nextErrors.fullName =
                "Full name is required.";
        } else if (fullName.length < 2) {
            nextErrors.fullName =
                "Full name must contain at least 2 characters.";
        }

        if (!phone) {
            nextErrors.phone =
                "Phone number is required.";
        } else if (
            phone.length < 7 ||
            phone.length > 30
        ) {
            nextErrors.phone =
                "Please provide a valid phone number.";
        }

        if (!email) {
            nextErrors.email =
                "Email address is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email
            )
        ) {
            nextErrors.email =
                "Please provide a valid email address.";
        }

        if (!password) {
            nextErrors.password =
                "Password is required.";
        } else if (password.length < 8) {
            nextErrors.password =
                "Password must contain at least 8 characters.";
        }

        if (!confirmPassword) {
            nextErrors.confirmPassword =
                "Please confirm your password.";
        } else if (
            password !== confirmPassword
        ) {
            nextErrors.confirmPassword =
                "Passwords do not match.";
        }

        setErrors(nextErrors);

        return (
            Object.keys(nextErrors).length === 0
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setGeneralError("");

        if (!validateClientSide()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/register`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        fullName:
                            formData.fullName.trim(),
                        phone:
                            formData.phone.trim(),
                        email:
                            formData.email.trim(),
                        password:
                            formData.password,
                        confirmPassword:
                            formData.confirmPassword,
                        address:
                            formData.address.trim(),
                        emergencyContact:
                            formData.emergencyContact.trim()
                    })
                }
            );

            let data = null;

            try {
                data =
                    await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                if (
                    data?.errors &&
                    typeof data.errors ===
                        "object"
                ) {
                    setErrors(data.errors);
                }

                setGeneralError(
                    data?.message ||
                        "We could not submit your membership application. Please check your information and try again."
                );

                return;
            }

            setApplicationDetails(
                data?.data || null
            );

            setApplicationSubmitted(true);
            setFormData(INITIAL_FORM);
            setErrors({});
        } catch (error) {
            console.error(
                "Membership registration error:",
                error
            );

            setGeneralError(
                "Unable to connect to the server. Please make sure the BAJIM BLOSSOM backend is running and try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (applicationSubmitted) {
        return (
            <>
                <PublicNavbar />

                <main className="overflow-x-hidden bg-[#faf8f2]">
                    <section className="flex min-h-[calc(100vh-76px)] items-center py-12 sm:py-16 md:py-20 lg:py-24">
                        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
                            <div className="mx-auto max-w-2xl">
                                <div className="rounded-[1.5rem] border border-[#dce5d8] bg-white p-5 text-center shadow-[0_20px_60px_rgba(38,51,43,0.06)] sm:rounded-[2rem] sm:p-8 md:p-12">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f2f6ef] sm:h-16 sm:w-16">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-7 w-7 text-[#30483a] sm:h-8 sm:w-8"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>

                                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#7b8066] sm:mt-7 sm:text-sm sm:tracking-[0.2em]">
                                        Application Submitted
                                    </p>

                                    <h1 className="mt-3 break-words text-2xl font-bold leading-tight text-[#26332b] sm:mt-4 sm:text-3xl md:text-4xl">
                                        Thank you for applying.
                                    </h1>

                                    <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#687069] sm:mt-5 sm:text-base">
                                        Your Bajim Blossom membership
                                        application has been submitted
                                        successfully and is now awaiting
                                        administrative review.
                                    </p>

                                    {applicationDetails?.profile && (
                                        <div className="mt-6 rounded-2xl border border-[#e7e2d5] bg-[#faf8f2] p-4 text-left sm:mt-8 sm:p-5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7b8066]">
                                                Application Details
                                            </p>

                                            <div className="mt-4 space-y-3">
                                                <div className="flex flex-col gap-1 border-b border-[#e7e2d5] pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                                    <span className="text-sm text-[#687069]">
                                                        Name
                                                    </span>

                                                    <span className="break-words text-sm font-semibold text-[#30483a] sm:text-right">
                                                        {
                                                            applicationDetails
                                                                .profile
                                                                .fullName
                                                        }
                                                    </span>
                                                </div>

                                                <div className="flex flex-col gap-1 border-b border-[#e7e2d5] pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                                    <span className="text-sm text-[#687069]">
                                                        Email
                                                    </span>

                                                    <span className="break-all text-sm font-semibold text-[#30483a] sm:text-right">
                                                        {
                                                            applicationDetails
                                                                .profile
                                                                .email
                                                        }
                                                    </span>
                                                </div>

                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                                    <span className="text-sm text-[#687069]">
                                                        Status
                                                    </span>

                                                    <span className="w-fit rounded-full bg-[#f2f6ef] px-3 py-1 text-xs font-bold text-[#30483a]">
                                                        Pending Approval
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6 rounded-2xl border border-[#eadfca] bg-[#fffaf0] p-4 text-left sm:mt-8 sm:p-5">
                                        <p className="text-sm font-semibold text-[#6b6255]">
                                            What happens next?
                                        </p>

                                        <ol className="mt-4 space-y-3">
                                            <li className="flex items-start gap-3">
                                                <span className="shrink-0 font-bold text-[#6a5130]">
                                                    01
                                                </span>

                                                <span className="min-w-0 text-sm leading-6 text-[#687069]">
                                                    An administrator will
                                                    review your membership
                                                    application.
                                                </span>
                                            </li>

                                            <li className="flex items-start gap-3">
                                                <span className="shrink-0 font-bold text-[#6a5130]">
                                                    02
                                                </span>

                                                <span className="min-w-0 text-sm leading-6 text-[#687069]">
                                                    Your membership will
                                                    remain pending until it
                                                    is approved.
                                                </span>
                                            </li>

                                            <li className="flex items-start gap-3">
                                                <span className="shrink-0 font-bold text-[#6a5130]">
                                                    03
                                                </span>

                                                <span className="min-w-0 text-sm leading-6 text-[#687069]">
                                                    Once approved, you can
                                                    sign in using your
                                                    registered email and
                                                    password.
                                                </span>
                                            </li>
                                        </ol>
                                    </div>

                                    <div className="mt-7 sm:mt-8">
                                        <Link
                                            href="/login"
                                            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#30483a] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263c31] sm:w-auto"
                                        >
                                            Go to Member Login
                                            <span className="ml-2">
                                                →
                                            </span>
                                        </Link>
                                    </div>

                                    <p className="mt-5 text-xs leading-6 text-[#7a817b] sm:mt-6">
                                        You will not be able to access the
                                        member portal until your application
                                        has been approved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <PublicFooter />
            </>
        );
    }

    return (
        <>
            <PublicNavbar />

            <main className="overflow-x-hidden bg-[#faf8f2]">
                <section className="py-12 sm:py-16 md:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="grid gap-8 md:gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-12">
                            <div className="lg:sticky lg:top-28">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b8066] sm:text-sm sm:tracking-[0.2em]">
                                    Join the Thrift
                                </p>

                                <h1 className="mt-4 break-words text-3xl font-bold leading-tight text-[#26332b] sm:text-4xl md:text-5xl">
                                    Become part of Bajim Blossom.
                                </h1>

                                <p className="mt-5 text-sm leading-7 text-[#687069] sm:mt-6 sm:text-base sm:leading-8">
                                    Complete the application below to request
                                    membership. Your application will be
                                    reviewed by an administrator before your
                                    account is approved.
                                </p>

                                <div className="mt-6 rounded-2xl border border-[#dce5d8] bg-[#f2f6ef] p-5 sm:mt-8 sm:p-6">
                                    <p className="text-sm font-semibold text-[#30483a]">
                                        What happens next?
                                    </p>

                                    <ol className="mt-4 space-y-4 sm:mt-5">
                                        <li className="flex items-start gap-3">
                                            <span className="shrink-0 font-bold text-[#30483a]">
                                                01
                                            </span>

                                            <span className="min-w-0 text-sm leading-6 text-[#526057]">
                                                Submit your membership
                                                application.
                                            </span>
                                        </li>

                                        <li className="flex items-start gap-3">
                                            <span className="shrink-0 font-bold text-[#30483a]">
                                                02
                                            </span>

                                            <span className="min-w-0 text-sm leading-6 text-[#526057]">
                                                An administrator reviews your
                                                application.
                                            </span>
                                        </li>

                                        <li className="flex items-start gap-3">
                                            <span className="shrink-0 font-bold text-[#30483a]">
                                                03
                                            </span>

                                            <span className="min-w-0 text-sm leading-6 text-[#526057]">
                                                Once approved, you can access
                                                your member account.
                                            </span>
                                        </li>
                                    </ol>
                                </div>

                                <p className="mt-5 text-xs leading-6 text-[#7a817b] sm:mt-6">
                                    Only the information required for
                                    membership should be provided. Additional
                                    administrative information may be
                                    requested where genuinely necessary.
                                </p>
                            </div>

                            <div className="rounded-[1.5rem] border border-[#e7e2d5] bg-white p-5 shadow-[0_20px_60px_rgba(38,51,43,0.06)] sm:rounded-[2rem] sm:p-7 md:p-9">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#30483a]">
                                        Membership Application
                                    </h2>

                                    <p className="mt-2 text-sm text-[#687069]">
                                        Fields marked with * are required.
                                    </p>
                                </div>

                                {generalError && (
                                    <div
                                        role="alert"
                                        className="mt-5 rounded-xl border border-[#ead0cc] bg-[#fff5f3] px-4 py-3 sm:mt-6"
                                    >
                                        <p className="break-words text-sm leading-6 text-[#8a4036]">
                                            {generalError}
                                        </p>
                                    </div>
                                )}

                                <form
                                    onSubmit={handleSubmit}
                                    noValidate
                                    className="mt-6 space-y-5 sm:mt-8"
                                >
                                    <div>
                                        <label
                                            htmlFor="fullName"
                                            className="mb-2 block text-sm font-semibold text-[#405047]"
                                        >
                                            Full Name *
                                        </label>

                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            autoComplete="name"
                                            value={
                                                formData.fullName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            disabled={
                                                isSubmitting
                                            }
                                            placeholder="Enter your full name"
                                            aria-invalid={Boolean(
                                                errors.fullName
                                            )}
                                            className={`min-h-11 w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#26332b] outline-none transition placeholder:text-[#9ca49e] focus:border-[#30483a] disabled:cursor-not-allowed disabled:bg-[#f7f6f1] ${
                                                errors.fullName
                                                    ? "border-[#c9857d]"
                                                    : "border-[#d9ded5]"
                                            }`}
                                        />

                                        {errors.fullName && (
                                            <p className="mt-2 break-words text-xs text-[#9a463d]">
                                                {
                                                    errors.fullName
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="phone"
                                                className="mb-2 block text-sm font-semibold text-[#405047]"
                                            >
                                                Phone Number *
                                            </label>

                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                autoComplete="tel"
                                                value={
                                                    formData.phone
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    isSubmitting
                                                }
                                                placeholder="080..."
                                                aria-invalid={Boolean(
                                                    errors.phone
                                                )}
                                                className={`min-h-11 w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#26332b] outline-none transition placeholder:text-[#9ca49e] focus:border-[#30483a] disabled:cursor-not-allowed disabled:bg-[#f7f6f1] ${
                                                    errors.phone
                                                        ? "border-[#c9857d]"
                                                        : "border-[#d9ded5]"
                                                }`}
                                            />

                                            {errors.phone && (
                                                <p className="mt-2 break-words text-xs text-[#9a463d]">
                                                    {
                                                        errors.phone
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="mb-2 block text-sm font-semibold text-[#405047]"
                                            >
                                                Email *
                                            </label>

                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                value={
                                                    formData.email
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    isSubmitting
                                                }
                                                placeholder="you@example.com"
                                                aria-invalid={Boolean(
                                                    errors.email
                                                )}
                                                className={`min-h-11 w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#26332b] outline-none transition placeholder:text-[#9ca49e] focus:border-[#30483a] disabled:cursor-not-allowed disabled:bg-[#f7f6f1] ${
                                                    errors.email
                                                        ? "border-[#c9857d]"
                                                        : "border-[#d9ded5]"
                                                }`}
                                            />

                                            {errors.email && (
                                                <p className="mt-2 break-words text-xs text-[#9a463d]">
                                                    {
                                                        errors.email
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="mb-2 block text-sm font-semibold text-[#405047]"
                                        >
                                            Password *
                                        </label>

                                        <div className="relative">
                                            <input
                                                id="password"
                                                name="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                autoComplete="new-password"
                                                value={
                                                    formData.password
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    isSubmitting
                                                }
                                                placeholder="Create a secure password"
                                                aria-invalid={Boolean(
                                                    errors.password
                                                )}
                                                className={`min-h-11 w-full rounded-xl border bg-white px-4 py-3 pr-20 text-sm text-[#26332b] outline-none transition placeholder:text-[#9ca49e] focus:border-[#30483a] disabled:cursor-not-allowed disabled:bg-[#f7f6f1] sm:pr-24 ${
                                                    errors.password
                                                        ? "border-[#c9857d]"
                                                        : "border-[#d9ded5]"
                                                }`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        (current) =>
                                                            !current
                                                    )
                                                }
                                                disabled={
                                                    isSubmitting
                                                }
                                                className="absolute right-2.5 top-1/2 min-h-9 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#30483a] hover:bg-[#f2f6ef] disabled:cursor-not-allowed disabled:opacity-50 sm:right-3"
                                            >
                                                {showPassword
                                                    ? "Hide"
                                                    : "Show"}
                                            </button>
                                        </div>

                                        {errors.password && (
                                            <p className="mt-2 break-words text-xs text-[#9a463d]">
                                                {
                                                    errors.password
                                                }
                                            </p>
                                        )}

                                        <p className="mt-2 text-xs leading-5 text-[#8a918b]">
                                            Your password must contain at
                                            least 8 characters.
                                        </p>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="confirmPassword"
                                            className="mb-2 block text-sm font-semibold text-[#405047]"
                                        >
                                            Confirm Password *
                                        </label>

                                        <div className="relative">
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                autoComplete="new-password"
                                                value={
                                                    formData.confirmPassword
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    isSubmitting
                                                }
                                                placeholder="Repeat your password"
                                                aria-invalid={Boolean(
                                                    errors.confirmPassword
                                                )}
                                                className={`min-h-11 w-full rounded-xl border bg-white px-4 py-3 pr-20 text-sm text-[#26332b] outline-none transition placeholder:text-[#9ca49e] focus:border-[#30483a] disabled:cursor-not-allowed disabled:bg-[#f7f6f1] sm:pr-24 ${
                                                    errors.confirmPassword
                                                        ? "border-[#c9857d]"
                                                        : "border-[#d9ded5]"
                                                }`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (current) =>
                                                            !current
                                                    )
                                                }
                                                disabled={
                                                    isSubmitting
                                                }
                                                className="absolute right-2.5 top-1/2 min-h-9 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#30483a] hover:bg-[#f2f6ef] disabled:cursor-not-allowed disabled:opacity-50 sm:right-3"
                                            >
                                                {showConfirmPassword
                                                    ? "Hide"
                                                    : "Show"}
                                            </button>
                                        </div>

                                        {errors.confirmPassword && (
                                            <p className="mt-2 break-words text-xs text-[#9a463d]">
                                                {
                                                    errors.confirmPassword
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="address"
                                            className="mb-2 block text-sm font-semibold text-[#405047]"
                                        >
                                            Address
                                            <span className="ml-1 font-normal text-[#8a918b]">
                                                (Optional)
                                            </span>
                                        </label>

                                        <textarea
                                            id="address"
                                            name="address"
                                            rows={3}
                                            autoComplete="street-address"
                                            value={
                                                formData.address
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            disabled={
                                                isSubmitting
                                            }
                                            placeholder="Your address"
                                            className="min-h-24 w-full resize-y rounded-xl border border-[#d9ded5] bg-white px-4 py-3 text-sm text-[#26332b] outline-none transition placeholder:text-[#9ca49e] focus:border-[#30483a] disabled:cursor-not-allowed disabled:bg-[#f7f6f1]"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="emergencyContact"
                                            className="mb-2 block text-sm font-semibold text-[#405047]"
                                        >
                                            Emergency Contact
                                            <span className="ml-1 font-normal text-[#8a918b]">
                                                (Optional)
                                            </span>
                                        </label>

                                        <input
                                            id="emergencyContact"
                                            name="emergencyContact"
                                            type="text"
                                            value={
                                                formData.emergencyContact
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            disabled={
                                                isSubmitting
                                            }
                                            placeholder="Name and phone number"
                                            className="min-h-11 w-full rounded-xl border border-[#d9ded5] bg-white px-4 py-3 text-sm text-[#26332b] outline-none transition placeholder:text-[#9ca49e] focus:border-[#30483a] disabled:cursor-not-allowed disabled:bg-[#f7f6f1]"
                                        />
                                    </div>

                                    <div className="rounded-xl bg-[#f8f6ef] p-4">
                                        <p className="text-xs leading-6 text-[#687069]">
                                            By submitting this application,
                                            you understand that membership is
                                            subject to administrative
                                            approval. Creating an application
                                            does not immediately grant access
                                            to the member portal.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="min-h-12 w-full rounded-full bg-[#30483a] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263c31] disabled:cursor-not-allowed disabled:bg-[#30483a]/60"
                                    >
                                        {isSubmitting
                                            ? "Submitting Application..."
                                            : "Submit Membership Application"}
                                    </button>
                                </form>

                                <div className="mt-6 border-t border-[#e7e2d5] pt-5 text-center sm:mt-7 sm:pt-6">
                                    <p className="text-sm text-[#687069]">
                                        Already have an account?
                                    </p>

                                    <Link
                                        href="/login"
                                        className="mt-2 inline-block text-sm font-semibold text-[#30483a] hover:text-[#6a5130]"
                                    >
                                        Go to Member Login →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </>
    );
}