"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
    const params = useParams();
    const router = useRouter();

    const token =
        params?.token || "";

    const [formData, setFormData] =
        useState({
            password: "",
            confirmPassword: ""
        });

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const handleChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value
        }));

        setErrorMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        if (!token) {
            setErrorMessage(
                "This password reset link is invalid."
            );
            return;
        }

        if (
            formData.password.length <
            8
        ) {
            setErrorMessage(
                "Your new password must be at least 8 characters long."
            );
            return;
        }

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setErrorMessage(
                "The passwords do not match."
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
                    `${apiBaseUrl}/api/auth/reset-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials:
                            "include",

                        body: JSON.stringify({
                            token,
                            password:
                                formData.password,
                            confirmPassword:
                                formData.confirmPassword
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
                        "Unable to reset your password."
                );
            }

            setSuccessMessage(
                data?.message ||
                    "Your password has been reset successfully."
            );

            setFormData({
                password: "",
                confirmPassword: ""
            });

            setTimeout(() => {
                router.push(
                    "/login"
                );
            }, 1800);
        } catch (error) {
            setErrorMessage(
                error.message ||
                    "Unable to reset your password. Please try again."
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
                            Create a new password
                        </h1>

                        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#687069]">
                            Enter a new password for your
                            BAJIM account.
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
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-semibold text-[#405047]"
                                >
                                    New Password
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
                                        required
                                        minLength={8}
                                        placeholder="Enter your new password"
                                        className="min-h-11 w-full rounded-xl border border-[#d9ded5] bg-white px-4 py-3 pr-20 text-sm text-[#26332b] outline-none transition placeholder:text-[#9ca49e] focus:border-[#30483a] focus:ring-2 focus:ring-[#30483a]/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (current) =>
                                                    !current
                                            )
                                        }
                                        className="absolute right-2 top-1/2 min-h-9 -translate-y-1/2 rounded-lg px-2.5 text-xs font-semibold text-[#30483a] hover:bg-[#f2f6ef]"
                                    >
                                        {showPassword
                                            ? "Hide"
                                            : "Show"}
                                    </button>
                                </div>

                                <p className="mt-2 text-xs leading-5 text-[#687069]">
                                    Use at least 8 characters.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-2 block text-sm font-semibold text-[#405047]"
                                >
                                    Confirm New Password
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
                                        required
                                        minLength={8}
                                        placeholder="Enter your new password again"
                                        className="min-h-11 w-full rounded-xl border border-[#d9ded5] bg-white px-4 py-3 pr-20 text-sm text-[#26332b] outline-none transition placeholder:text-[#9ca49e] focus:border-[#30483a] focus:ring-2 focus:ring-[#30483a]/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (current) =>
                                                    !current
                                            )
                                        }
                                        className="absolute right-2 top-1/2 min-h-9 -translate-y-1/2 rounded-lg px-2.5 text-xs font-semibold text-[#30483a] hover:bg-[#f2f6ef]"
                                    >
                                        {showConfirmPassword
                                            ? "Hide"
                                            : "Show"}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    isSubmitting ||
                                    Boolean(
                                        successMessage
                                    )
                                }
                                className="min-h-11 w-full rounded-full bg-[#30483a] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263a2f] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting
                                    ? "Resetting Password..."
                                    : "Reset Password"}
                            </button>
                        </form>

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
