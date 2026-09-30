import Link from "next/link";

import PublicNavbar from "../../components/public/PublicNavbar";
import PublicFooter from "../../components/public/PublicFooter";

export const metadata = {
    title: "Guidelines | Bajim Blossom Kitchen & Household Items",
    description:
        "Read the contribution and participation guidelines for Bajim Blossom Kitchen & Household Items.",
};

export default function GuidelinesPage() {
    return (
        <>
            <PublicNavbar />

            <main className="overflow-x-hidden">
                {/* Page Header */}
                <section className="bg-[#30483a] py-14 text-white sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d9c58b] sm:text-sm sm:tracking-[0.2em]">
                                Guidelines
                            </p>

                            <h1 className="mt-4 break-words text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                                Simple guidelines for a smooth thrift experience.
                            </h1>

                            <p className="mt-5 max-w-2xl break-words text-sm leading-7 text-[#d5ded7] sm:mt-6 sm:text-base sm:leading-8 md:text-lg">
                                Consistent contributions, respectful communication and
                                clear records help everyone participate more easily.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Do / Don't */}
                <section className="bg-white py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
                            {/* Do */}
                            <div className="rounded-[1.5rem] border border-[#dce5d8] bg-[#f2f6ef] p-5 sm:rounded-[1.75rem] sm:p-8 md:p-10">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#30483a] text-lg font-bold text-white sm:h-12 sm:w-12 sm:text-xl">
                                    ✓
                                </div>

                                <h2 className="mt-5 text-xl font-bold text-[#30483a] sm:mt-6 sm:text-2xl">
                                    Do
                                </h2>

                                <ol className="mt-5 space-y-5 sm:mt-6">
                                    <li className="flex items-start gap-3 sm:gap-4">
                                        <span className="shrink-0 font-bold text-[#30483a]">
                                            01
                                        </span>

                                        <p className="min-w-0 break-words text-sm leading-7 text-[#526057]">
                                            Make your contribution on or before the due
                                            date — Friday, latest by 10:00 AM Saturday
                                            morning.
                                        </p>
                                    </li>

                                    <li className="flex items-start gap-3 sm:gap-4">
                                        <span className="shrink-0 font-bold text-[#30483a]">
                                            02
                                        </span>

                                        <p className="min-w-0 break-words text-sm leading-7 text-[#526057]">
                                            Keep all communication respectful and
                                            friendly.
                                        </p>
                                    </li>

                                    <li className="flex items-start gap-3 sm:gap-4">
                                        <span className="shrink-0 font-bold text-[#30483a]">
                                            03
                                        </span>

                                        <p className="min-w-0 break-words text-sm leading-7 text-[#526057]">
                                            Ask questions whenever clarification is
                                            needed.
                                        </p>
                                    </li>
                                </ol>
                            </div>

                            {/* Don't */}
                            <div className="rounded-[1.5rem] border border-[#eadfca] bg-[#fffaf0] p-5 sm:rounded-[1.75rem] sm:p-8 md:p-10">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6a5130] text-lg font-bold text-white sm:h-12 sm:w-12 sm:text-xl">
                                    !
                                </div>

                                <h2 className="mt-5 text-xl font-bold text-[#6a5130] sm:mt-6 sm:text-2xl">
                                    Don&apos;t
                                </h2>

                                <ol className="mt-5 space-y-5 sm:mt-6">
                                    <li className="flex items-start gap-3 sm:gap-4">
                                        <span className="shrink-0 font-bold text-[#6a5130]">
                                            01
                                        </span>

                                        <p className="min-w-0 break-words text-sm leading-7 text-[#6b6255]">
                                            Do not delay your contribution without prior
                                            notice.
                                        </p>
                                    </li>

                                    <li className="flex items-start gap-3 sm:gap-4">
                                        <span className="shrink-0 font-bold text-[#6a5130]">
                                            02
                                        </span>

                                        <p className="min-w-0 break-words text-sm leading-7 text-[#6b6255]">
                                            Do not assume payment has been recorded until
                                            it has been verified and reflected in your
                                            member account.
                                        </p>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Late Contributions */}
                <section className="bg-[#faf8f2] py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="rounded-[1.5rem] border border-[#eadfca] bg-white p-5 sm:rounded-[2rem] sm:p-8 md:p-10">
                            <h2 className="break-words text-xl font-bold text-[#30483a] sm:text-2xl">
                                Late contributions
                            </h2>

                            <p className="mt-4 break-words text-sm leading-7 text-[#687069] sm:text-base sm:leading-8">
                                A ₦500 late-payment fine applies after 10:00 AM
                                Saturday under the stated contribution arrangement.
                                The actual applicable amount and deadline for a
                                particular cycle should be determined from that
                                cycle&apos;s stored configuration.
                            </p>

                            <div className="mt-6 rounded-xl bg-[#fffaf0] p-4 sm:mt-7 sm:p-5">
                                <p className="break-words text-sm leading-7 text-[#6b6255]">
                                    Financial records are maintained by administrators.
                                    Members cannot directly modify payment or fine
                                    records.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-[#30483a] py-14 text-white sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 md:px-8 lg:px-12">
                        <h2 className="break-words text-2xl font-bold sm:text-3xl md:text-4xl">
                            Have a question about the guidelines?
                        </h2>

                        <p className="mx-auto mt-4 max-w-2xl break-words text-sm leading-7 text-[#d5ded7] sm:mt-5 sm:text-base sm:leading-8">
                            If something is unclear, please ask before making
                            assumptions about your contribution or account.
                        </p>

                        <div className="mt-6 grid gap-3 sm:mt-8 sm:flex sm:flex-row sm:justify-center">
                            <Link
                                href="/faq"
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#d9c58b] px-7 py-3.5 text-sm font-semibold text-[#263a2f] transition hover:bg-[#e4d39e] active:scale-[0.99] sm:w-auto"
                            >
                                Read FAQs
                            </Link>

                            <Link
                                href="/contact"
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#627168] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#30483a] active:scale-[0.99] sm:w-auto"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </>
    );
}