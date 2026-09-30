"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import PublicNavbar from "../../components/public/PublicNavbar";
import PublicFooter from "../../components/public/PublicFooter";

const API_BASE_URL = "";

export default function LoginPage() {
    const router = useRouter();

    const [showPassword, setShowPassword] =
        useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value
        }));

        if (errorMessage) {
            setErrorMessage("");
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        email:
                            formData.email.trim(),
                        password:
                            formData.password
                    })
                }
            );

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                setErrorMessage(
                    data?.message ||
                        "We could not sign you in. Please check your details and try again."
                );

                return;
            }

            /*
             * The Express backend creates the
             * HTTP-only session cookie.
             *
             * The authenticated user may be returned
             * directly or inside the response wrapper.
             */
            const user =
                data?.user ||
                data?.data?.user ||
                data?.data?.member ||
                data?.member ||
                null;

            /*
             * If the backend does not return the user,
             * retrieve it using the authenticated session.
             */
            if (!user) {
                try {
                    const meResponse =
                        await fetch(
                            `${API_BASE_URL}/api/auth/me`,
                            {
                                method: "GET",
                                credentials:
                                    "include",
                                headers: {
                                    "Content-Type":
                                        "application/json"
                                }
                            }
                        );

                    let meData = null;

                    try {
                        meData =
                            await meResponse.json();
                    } catch {
                        meData = null;
                    }

                    if (!meResponse.ok) {
                        setErrorMessage(
                            meData?.message ||
                                "Login succeeded, but we could not load your account information."
                        );

                        return;
                    }

                    const authenticatedUser =
                        meData?.user ||
                        meData?.data?.user ||
                        meData?.data?.member ||
                        meData?.member ||
                        null;

                    if (!authenticatedUser) {
                        setErrorMessage(
                            "Login succeeded, but your account information could not be loaded."
                        );

                        return;
                    }

                    redirectByRole(
                        authenticatedUser
                    );

                    return;
                } catch (error) {
                    console.error(
                        "Authenticated user lookup error:",
                        error
                    );

                    setErrorMessage(
                        "Login succeeded, but we could not load your account information."
                    );

                    return;
                }
            }

            redirectByRole(user);
        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            setErrorMessage(
                "Unable to connect to the server. Please make sure the BAJIM BLOSSOM backend is running and try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    function redirectByRole(user) {
        const role = String(
            user?.role || ""
        ).toUpperCase();

        if (
            role === "ADMIN" ||
            role === "SUPER_ADMIN"
        ) {
            router.replace("/admin");
            return;
        }

        router.replace("/member");
    }

    return (
        <>
            <PublicNavbar />

            <main className="min-h-screen overflow-x-hidden bg-[#faf8f2]">
                <section className="flex min-h-[calc(100vh-76px)] items-center py-12 sm:py-16 md:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="mx-auto w-full max-w-md">
                            {/* Header */}
                            <div className="text-center">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8066] sm:text-sm sm:tracking-[0.2em]">
                                    Member Login
                                </p>

                                <h1 className="mt-3 break-words text-3xl font-bold leading-tight text-[#26332b] sm:mt-4 sm:text-4xl">
                                    Welcome back.
                                </h1>

                                <p className="mx-auto mt-4 max-w-sm break-words text-sm leading-7 text-[#687069] sm:mt-5 sm:text-base sm:leading-8">
                                    Sign in to view your
                                    contributions, items,
                                    announcements and member
                                    information.
                                </p>
                            </div>

                            {/* Login Card */}
                            <div className="mt-7 rounded-[1.5rem] border border-[#e7e2d5] bg-white p-5 shadow-[0_20px_60px_rgba(38,51,43,0.06)] sm:mt-8 sm:rounded-[2rem] sm:p-8 md:p-9">
                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                    className="space-y-5"
                                >
                                    {/* Error */}
                                    {errorMessage && (
                                        <div
                                            role="alert"
                                            className="rounded-xl border border-[#ead0cc] bg-[#fff5f3] px-4 py-3"
                                        >
                                            <p className="break-words text-sm leading-6 text-[#8a4036]">
                                                {
                                                    errorMessage
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {/* Email */}
                                    <div className="min-w-0">
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
                                            required
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
                                            className="min-h-11 w-full min-w-0 rounded-xl border border-[#d9ded5] bg-white px-4 py-3 text-sm text-[#26332b] outline-none transition placeholder:text-[#9ca49e] focus:border-[#30483a] focus:ring-2 focus:ring-[#30483a]/10 disabled:cursor-not-allowed disabled:bg-[#f7f6f1]"
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="min-w-0">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <label
                                                htmlFor="password"
                                                className="block min-w-0 text-sm font-semibold text-[#405047]"
                                            >
                                                Password
                                            </label>

                                            <Link
                                                href="/forgot-password"
                                                className="shrink-0 rounded-md px-1 py-1 text-xs font-semibold text-[#30483a] transition hover:text-[#6a5130] focus-visible:outline-none"
                                            >
                                                Forgot
                                                password?
                                            </Link>
                                        </div>

                                        <div className="relative">
                                            <input
                                                id="password"
                                                name="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                autoComplete="current-password"
                                                required
                                                value={
                                                    formData.password
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    isSubmitting
                                                }
                                                placeholder="Enter your password"
                                                className="min-h-11 w-full min-w-0 rounded-xl border border-[#d9ded5] bg-white px-4 py-3 pr-20 text-sm text-[#26332b] outline-none transition placeholder:text-[#9ca49e] focus:border-[#30483a] focus:ring-2 focus:ring-[#30483a]/10 disabled:cursor-not-allowed disabled:bg-[#f7f6f1] sm:pr-24"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        (
                                                            current
                                                        ) =>
                                                            !current
                                                    )
                                                }
                                                disabled={
                                                    isSubmitting
                                                }
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                className="absolute right-2.5 top-1/2 min-h-9 min-w-9 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-[#30483a] transition hover:bg-[#f2f6ef] disabled:cursor-not-allowed disabled:opacity-50 sm:right-3"
                                            >
                                                {showPassword
                                                    ? "Hide"
                                                    : "Show"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={
                                            isSubmitting
                                        }
                                        className="min-h-11 w-full rounded-full bg-[#30483a] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263c31] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#30483a]/60"
                                    >
                                        {isSubmitting
                                            ? "Signing in..."
                                            : "Login"}
                                    </button>
                                </form>

                                {/* Register link */}
                                <div className="mt-7 border-t border-[#e7e2d5] pt-6 text-center">
                                    <p className="break-words text-sm text-[#687069]">
                                        Don&apos;t have a
                                        member account?
                                    </p>

                                    <Link
                                        href="/join"
                                        className="mt-2 inline-flex min-h-10 items-center justify-center rounded-lg px-2 text-sm font-semibold text-[#30483a] transition hover:text-[#6a5130]"
                                    >
                                        Apply to Join →
                                    </Link>
                                </div>
                            </div>

                            {/* Approval Notice */}
                            <div className="mt-5 rounded-xl border border-[#eadfca] bg-[#fffaf0] p-4 text-center sm:mt-6 sm:p-5">
                                <p className="break-words text-xs leading-6 text-[#6b6255] sm:text-sm">
                                    Access to the member
                                    portal is available
                                    only after your
                                    membership application
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