"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] =
        useState("");

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const [developmentResetUrl, setDevelopmentResetUrl] =
        useState("");

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");
        setDevelopmentResetUrl("");

        if (!email.trim()) {
            setErrorMessage(
                "Please enter your email address."
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const apiBaseUrl =
                process.env
                    .NEXT_PUBLIC_API_URL ||
                "";

            const response =
                await fetch(
                    `${apiBaseUrl}/api/auth/forgot-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials:
                            "include",

                        body: JSON.stringify({
                            email:
                                email.trim()
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

            if (
                !response.ok ||
                data?.success === false
            ) {
                throw new Error(
                    data?.message ||
                        "Unable to start password recovery."
                );
            }

            setSuccessMessage(
                data?.message ||
                    "If an account exists with that email address, password reset instructions will be provided."
            );

            /*
             * Development-only helper.
             * The backend never returns this in production.
             */
            if (
                process.env.NODE_ENV ===
                    "development" &&
                data?.development?.resetUrl
            ) {
                setDevelopmentResetUrl(
                    data.development.resetUrl
                );
            }

            setEmail("");
        } catch (error) {
            setErrorMessage(
                error.message ||
                    "Unable to start password recovery. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#faf8f2]">
            <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 sm:py-16 md:px-8 lg:px-12">
                <div className="w-full max-w-md min-w-0">
                    <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#30483a] text-sm font-bold text-white sm:h-14 sm:w-14">
                            BB
                        </div>

                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8066] sm:mt-6 sm:text-sm sm:tracking-[0.2em]">
                            Account Recovery
                        </p>

                        <h1 className="mt-3 text-2xl font-bold leading-tight text-[#26332b] sm:text-3xl">
                            Forgot your password?
                        </h1>

                        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#687069]">
                            Enter your email address and
                            we&apos;ll use the account recovery
                            process to help you reset your
                            password.
                        </p>
                    </div>

                    <div className="mt-7 rounded-[1.5rem] border border-[#e7e2d5] bg-white p-4 shadow-[0_20px_60px_rgba(38,51,43,0.06)] sm:mt-8 sm:rounded-[2rem] sm:p-7 md:p-9">
                        {errorMessage && (
                            <div
                                role="alert"
                                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                            >
                                {errorMessage}
                            </div>
                        )}

                        {successMessage && (
                            <div
                                role="status"
                                className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700"
                            >
                                {successMessage}
                            </div>
                        )}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-[#405047]"
                                >
                                    Email Address
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(
                                            event.target.value
                                        );
                                        setErrorMessage("");
                                    }}
                                    required
                                    placeholder="you@example.com"
                                    className="min-h-11 w-full min-w-0 rounded-xl border border-[#d9ded5] bg-white px-4 py-3 text-sm text-[#26332b] outline-none transition placeholder:text-[#9ca49e] focus:border-[#30483a] focus:ring-2 focus:ring-[#30483a]/10"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    isSubmitting
                                }
                                className="min-h-11 w-full rounded-full bg-[#30483a] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263a2f] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting
                                    ? "Sending..."
                                    : "Send Password Reset Link"}
                            </button>
                        </form>

                        {developmentResetUrl && (
                            <div className="mt-6 rounded-xl border border-[#e7e2d5] bg-[#f2f6ef] p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#7b8066]">
                                    Development Testing Link
                                </p>

                                <p className="mt-2 break-all text-xs leading-5 text-[#405047]">
                                    {developmentResetUrl}
                                </p>

                                <a
                                    href={
                                        developmentResetUrl
                                    }
                                    className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full bg-[#30483a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#263a2f]"
                                >
                                    Open Reset Page
                                </a>
                            </div>
                        )}

                        <div className="mt-6 border-t border-[#e7e2d5] pt-5 text-center sm:mt-7 sm:pt-6">
                            <Link
                                href="/login"
                                className="inline-flex min-h-11 items-center justify-center px-2 text-sm font-semibold text-[#30483a] transition hover:text-[#6a5130]"
                            >
                                ← Back to Member Login
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
