import Link from "next/link";

import PublicNavbar from "../../components/public/PublicNavbar";
import PublicFooter from "../../components/public/PublicFooter";
import SectionHeading from "../../components/public/SectionHeading";

const steps = [
    {
        number: "01",
        title: "Join",
        description:
            "Complete the membership application with the required information. Your application starts in a pending state until an administrator reviews it.",
    },
    {
        number: "02",
        title: "Contribute",
        description:
            "Once approved, participate according to the active contribution cycle and its configured contribution amount and deadline.",
    },
    {
        number: "03",
        title: "Stay Consistent",
        description:
            "Keep up with your contributions and use your member account to monitor your contribution history and current status.",
    },
    {
        number: "04",
        title: "Get Your Items",
        description:
            "Receive useful kitchen and household items according to the arrangement made by Bajim Blossom.",
    },
];

export const metadata = {
    title: "How It Works | Bajim Blossom Kitchen & Household Items",
    description:
        "Learn how the Bajim Blossom Kitchen & Household Items thrift contribution process works.",
};

export default function HowItWorksPage() {
    return (
        <>
            <PublicNavbar />

            <main className="overflow-x-hidden">
                {/* Header */}
                <section className="bg-[#30483a] py-14 text-white sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d9c58b] sm:text-sm sm:tracking-[0.2em]">
                                How It Works
                            </p>

                            <h1 className="mt-4 break-words text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                                Four simple steps from joining to receiving your items.
                            </h1>

                            <p className="mt-5 max-w-2xl break-words text-sm leading-7 text-[#d5ded7] sm:mt-6 sm:text-base sm:leading-8 md:text-lg">
                                Bajim Blossom is designed to keep the contribution
                                process straightforward, organized and easy for members
                                to follow.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Steps */}
                <section className="bg-white py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                            {steps.map((step) => (
                                <div
                                    key={step.number}
                                    className="rounded-[1.5rem] border border-[#e7e2d5] bg-[#faf8f2] p-5 sm:rounded-[1.75rem] sm:p-8 md:p-10"
                                >
                                    <span className="text-xs font-bold tracking-[0.18em] text-[#9b906c] sm:text-sm sm:tracking-[0.2em]">
                                        STEP {step.number}
                                    </span>

                                    <h2 className="mt-4 break-words text-xl font-bold text-[#30483a] sm:mt-5 sm:text-2xl">
                                        {step.title}
                                    </h2>

                                    <p className="mt-3 break-words text-sm leading-7 text-[#687069] sm:mt-4 sm:text-base sm:leading-8">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contribution */}
                <section className="bg-[#faf8f2] py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <SectionHeading
                            eyebrow="Weekly Contribution"
                            title="The standard contribution is ₦3,000 per week."
                            description="Contribution details belong to the active cycle. The organization can configure future cycles without changing historical contribution records."
                            centered
                        />

                        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-5 md:mt-12">
                            <div className="rounded-2xl border border-[#e7e2d5] bg-white p-5 text-center sm:p-7">
                                <p className="text-sm text-[#687069]">
                                    Contribution
                                </p>

                                <p className="mt-2 text-2xl font-bold text-[#30483a] sm:mt-3 sm:text-3xl">
                                    ₦3,000
                                </p>

                                <p className="mt-2 text-xs text-[#7a817b]">
                                    Per week
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[#e7e2d5] bg-white p-5 text-center sm:p-7">
                                <p className="text-sm text-[#687069]">
                                    Due
                                </p>

                                <p className="mt-2 text-2xl font-bold text-[#30483a] sm:mt-3 sm:text-3xl">
                                    Friday
                                </p>

                                <p className="mt-2 text-xs text-[#7a817b]">
                                    Standard deadline
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[#e7e2d5] bg-white p-5 text-center sm:p-7">
                                <p className="text-sm text-[#687069]">
                                    Grace
                                </p>

                                <p className="mt-2 break-words text-xl font-bold text-[#30483a] sm:mt-3 sm:text-2xl">
                                    Sat. 10:00 AM
                                </p>

                                <p className="mt-2 text-xs text-[#7a817b]">
                                    Standard grace deadline
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* No allocation formula */}
                <section className="bg-white py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="rounded-[1.5rem] border border-[#eadfca] bg-[#fffaf0] p-5 sm:rounded-[2rem] sm:p-8 md:p-10">
                            <h2 className="break-words text-xl font-bold text-[#6a5130] sm:text-2xl">
                                About item allocation
                            </h2>

                            <p className="mt-4 break-words text-sm leading-7 text-[#6b6255] sm:text-base sm:leading-8">
                                Bajim Blossom has not specified a fixed public
                                allocation formula. Items are provided according to
                                the organization&apos;s arrangement, so the website
                                will not invent or promise an allocation method that
                                has not been defined.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-[#f2f6ef] py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 md:px-8 lg:px-12">
                        <h2 className="break-words text-2xl font-bold text-[#26332b] sm:text-3xl md:text-4xl">
                            Ready to take the next step?
                        </h2>

                        <p className="mx-auto mt-4 max-w-2xl break-words text-sm leading-7 text-[#687069] sm:mt-5 sm:text-base sm:leading-8">
                            Read the guidelines or apply to become a Bajim Blossom
                            member.
                        </p>

                        <div className="mt-6 grid gap-3 sm:mt-8 sm:flex sm:flex-row sm:justify-center">
                            <Link
                                href="/guidelines"
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#cbd4c7] bg-white px-7 py-3.5 text-sm font-semibold text-[#30483a] transition hover:bg-[#f3f5f0] active:scale-[0.99] sm:w-auto"
                            >
                                Read Guidelines
                            </Link>

                            <Link
                                href="/join"
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#30483a] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263a2f] active:scale-[0.99] sm:w-auto"
                            >
                                Join the Thrift
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </>
    );
}