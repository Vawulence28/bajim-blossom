import Link from "next/link";

import PublicNavbar from "../components/public/PublicNavbar";
import PublicFooter from "../components/public/PublicFooter";
import HeroSection from "../components/public/HeroSection";
import SectionHeading from "../components/public/SectionHeading";

const benefits = [
    {
        number: "01",
        title: "Affordable Weekly Contributions",
        description:
            "Contribute ₦3,000 weekly according to the active contribution cycle.",
    },
    {
        number: "02",
        title: "Useful Household Items",
        description:
            "Work toward useful kitchen and household items through an organized thrift arrangement.",
    },
    {
        number: "03",
        title: "Organized Contribution Tracking",
        description:
            "Keep track of your contribution history and participation through your member account.",
    },
    {
        number: "04",
        title: "Transparent Records",
        description:
            "Members can view their contribution records and relevant account information.",
    },
    {
        number: "05",
        title: "Community Participation",
        description:
            "Take part in a structured contribution community built around consistency and cooperation.",
    },
    {
        number: "06",
        title: "Easy History Access",
        description:
            "Access your contribution history and recorded household items from your member portal.",
    },
];

const steps = [
    {
        number: "01",
        title: "Join",
        description:
            "Apply to become a Bajim Blossom member and wait for administrative approval.",
    },
    {
        number: "02",
        title: "Contribute",
        description:
            "Contribute according to the active weekly contribution cycle.",
    },
    {
        number: "03",
        title: "Stay Consistent",
        description:
            "Keep up with your contributions and monitor your participation through your account.",
    },
    {
        number: "04",
        title: "Get Your Items",
        description:
            "Receive useful kitchen and household items according to the organization's arrangement.",
    },
];

const faqs = [
    {
        question: "How much do I contribute?",
        answer:
            "The standard contribution is ₦3,000 per week. The applicable amount is based on the active contribution cycle.",
    },
    {
        question: "When is my contribution due?",
        answer:
            "Contributions are due on Friday, with a grace period until 10:00 AM Saturday.",
    },
    {
        question: "What happens if I pay late?",
        answer:
            "A ₦500 late-payment fine applies after the configured grace period.",
    },
    {
        question: "Does the website process payments?",
        answer:
            "No. Payments are made manually using the payment instructions provided by Bajim Blossom. An administrator verifies and records payments.",
    },
];

export default function HomePage() {
    return (
        <>
            <PublicNavbar />

            <main className="overflow-x-hidden">
                {/* Hero */}
                <HeroSection />

                {/* Introduction */}
                <section className="bg-white py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="grid min-w-0 gap-8 sm:gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12">
                            <div className="min-w-0">
                                <SectionHeading
                                    eyebrow="Welcome to Bajim Blossom"
                                    title="A simpler way to contribute toward useful household items."
                                    description="Bajim Blossom Kitchen & Household Items is a community-based thrift initiative designed around manageable contributions and useful household needs."
                                />
                            </div>

                            <div className="min-w-0 rounded-[1.5rem] bg-[#f2f6ef] p-5 sm:rounded-[2rem] sm:p-7 md:p-9">
                                <p className="text-base leading-7 text-[#405047] sm:text-lg sm:leading-8">
                                    Here, we will be contributing ₦3,000 every
                                    week, to get useful and quality
                                    kitchen/household items without putting too
                                    much pressure on our pockets.
                                </p>

                                <p className="mt-5 text-base leading-7 text-[#405047] sm:text-lg sm:leading-8">
                                    Let&apos;s contribute consistently, shop
                                    wisely and enjoy our items.
                                </p>

                                <div className="mt-6 h-px bg-[#d6dfd2] sm:mt-7" />

                                <p className="mt-5 text-sm font-semibold leading-6 text-[#30483a] sm:mt-6">
                                    Let&apos;s make this a smooth and successful
                                    journey together.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contribution Information */}
                <section className="bg-[#faf8f2] py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <SectionHeading
                            eyebrow="Contribution Information"
                            title="Know the current contribution expectations."
                            description="The standard contribution structure is simple. Actual cycle details are managed by the organization and may be updated through the administrative system."
                            centered
                        />

                        <div className="mt-9 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                            <div className="min-w-0 rounded-2xl border border-[#e7e2d5] bg-white p-5 sm:p-6">
                                <p className="text-sm text-[#687069]">
                                    Weekly Contribution
                                </p>

                                <p className="mt-3 text-2xl font-bold text-[#30483a] sm:text-3xl">
                                    ₦3,000
                                </p>
                            </div>

                            <div className="min-w-0 rounded-2xl border border-[#e7e2d5] bg-white p-5 sm:p-6">
                                <p className="text-sm text-[#687069]">
                                    Due
                                </p>

                                <p className="mt-3 text-2xl font-bold text-[#30483a] sm:text-3xl">
                                    Friday
                                </p>
                            </div>

                            <div className="min-w-0 rounded-2xl border border-[#e7e2d5] bg-white p-5 sm:p-6">
                                <p className="text-sm text-[#687069]">
                                    Grace Period
                                </p>

                                <p className="mt-3 break-words text-2xl font-bold text-[#30483a]">
                                    Sat. 10:00 AM
                                </p>
                            </div>

                            <div className="min-w-0 rounded-2xl border border-[#e7e2d5] bg-white p-5 sm:p-6">
                                <p className="text-sm text-[#687069]">
                                    Late Fine
                                </p>

                                <p className="mt-3 text-2xl font-bold text-[#30483a] sm:text-3xl">
                                    ₦500
                                </p>
                            </div>
                        </div>

                        <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-6 text-[#7a817b] sm:mt-6">
                            Contribution amounts, deadlines and applicable
                            fines should ultimately be read from the active
                            system configuration and contribution cycle rather
                            than hard-coded business logic.
                        </p>
                    </div>
                </section>

                {/* How It Works */}
                <section className="bg-white py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <SectionHeading
                            eyebrow="How It Works"
                            title="Four simple steps."
                            description="The process is designed to keep participation straightforward and easy to understand."
                            centered
                        />

                        <div className="mt-9 grid gap-4 sm:mt-14 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
                            {steps.map((step) => (
                                <div
                                    key={step.number}
                                    className="min-w-0 rounded-2xl border border-[#e7e2d5] bg-[#faf8f2] p-5 sm:p-7"
                                >
                                    <span className="text-xs font-bold tracking-[0.15em] text-[#9b906c] sm:text-sm">
                                        {step.number}
                                    </span>

                                    <h3 className="mt-4 text-lg font-bold text-[#30483a] sm:mt-5 sm:text-xl">
                                        {step.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-[#687069]">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-center sm:mt-10">
                            <Link
                                href="/how-it-works"
                                className="inline-flex min-h-11 items-center justify-center px-2 py-2 text-sm font-semibold text-[#30483a] transition hover:text-[#6a5130] sm:text-base"
                            >
                                <span className="break-words">
                                    Learn more about how it works
                                </span>

                                <span
                                    className="ml-2 shrink-0"
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Why Join */}
                <section className="bg-[#30483a] py-14 text-white sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d9c58b] sm:text-sm sm:tracking-[0.2em]">
                                Why Join
                            </p>

                            <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
                                Built around consistency, usefulness and
                                organized records.
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-[#d5ded7] sm:mt-5 sm:text-base sm:leading-8">
                                Bajim Blossom is focused on making
                                household-item thrift participation easier to
                                understand and easier to track.
                            </p>
                        </div>

                        <div className="mt-9 grid gap-4 sm:mt-12 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {benefits.map((benefit) => (
                                <div
                                    key={benefit.number}
                                    className="min-w-0 rounded-2xl border border-[#4d5e53] bg-[#263a2f] p-5 sm:p-6"
                                >
                                    <span className="text-xs font-bold tracking-[0.2em] text-[#d9c58b]">
                                        {benefit.number}
                                    </span>

                                    <h3 className="mt-4 text-base font-bold leading-6 sm:mt-5 sm:text-lg">
                                        {benefit.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-[#c7d0c9]">
                                        {benefit.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Guidelines Preview */}
                <section className="bg-[#faf8f2] py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <SectionHeading
                            eyebrow="Guidelines"
                            title="A smooth journey starts with consistency."
                            description="Everyone has a role to play in keeping the thrift process organized and respectful."
                            centered
                        />

                        <div className="mt-9 grid gap-4 sm:mt-12 sm:gap-6 md:grid-cols-2">
                            <div className="min-w-0 rounded-[1.5rem] border border-[#dce5d8] bg-[#f2f6ef] p-5 sm:p-7">
                                <h3 className="text-xl font-bold text-[#30483a]">
                                    Do
                                </h3>

                                <ul className="mt-5 space-y-4">
                                    <li className="flex min-w-0 gap-3 text-sm leading-7 text-[#526057]">
                                        <span
                                            className="shrink-0 font-bold text-[#30483a]"
                                            aria-hidden="true"
                                        >
                                            ✓
                                        </span>

                                        <span className="min-w-0">
                                            Make your contribution on or before
                                            the due date.
                                        </span>
                                    </li>

                                    <li className="flex min-w-0 gap-3 text-sm leading-7 text-[#526057]">
                                        <span
                                            className="shrink-0 font-bold text-[#30483a]"
                                            aria-hidden="true"
                                        >
                                            ✓
                                        </span>

                                        <span className="min-w-0">
                                            Keep communication respectful and
                                            friendly.
                                        </span>
                                    </li>

                                    <li className="flex min-w-0 gap-3 text-sm leading-7 text-[#526057]">
                                        <span
                                            className="shrink-0 font-bold text-[#30483a]"
                                            aria-hidden="true"
                                        >
                                            ✓
                                        </span>

                                        <span className="min-w-0">
                                            Ask questions whenever clarification
                                            is needed.
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <div className="min-w-0 rounded-[1.5rem] border border-[#eadfca] bg-[#fffaf0] p-5 sm:p-7">
                                <h3 className="text-xl font-bold text-[#6a5130]">
                                    Don&apos;t
                                </h3>

                                <ul className="mt-5 space-y-4">
                                    <li className="flex min-w-0 gap-3 text-sm leading-7 text-[#6b6255]">
                                        <span
                                            className="shrink-0 font-bold text-[#6a5130]"
                                            aria-hidden="true"
                                        >
                                            !
                                        </span>

                                        <span className="min-w-0">
                                            Do not delay your contribution
                                            without prior notice.
                                        </span>
                                    </li>

                                    <li className="flex min-w-0 gap-3 text-sm leading-7 text-[#6b6255]">
                                        <span
                                            className="shrink-0 font-bold text-[#6a5130]"
                                            aria-hidden="true"
                                        >
                                            !
                                        </span>

                                        <span className="min-w-0">
                                            Late payment attracts the
                                            configured fine after the grace
                                            deadline.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-7 text-center sm:mt-8">
                            <Link
                                href="/guidelines"
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#cbd4c7] bg-white px-6 py-3 text-sm font-semibold text-[#30483a] transition hover:bg-[#f3f5f0] sm:w-auto"
                            >
                                View Full Guidelines
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="bg-white py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <SectionHeading
                            eyebrow="FAQ"
                            title="Questions members often ask."
                            description="Here are some of the basic things you may want to know before joining."
                            centered
                        />

                        <div className="mt-9 space-y-3 sm:mt-12 sm:space-y-4">
                            {faqs.map((faq) => (
                                <details
                                    key={faq.question}
                                    className="group min-w-0 rounded-2xl border border-[#e7e2d5] bg-[#faf8f2] p-4 sm:p-6"
                                >
                                    <summary className="flex min-w-0 cursor-pointer list-none items-start justify-between gap-4 text-sm font-semibold leading-6 text-[#30483a] sm:items-center sm:gap-6 sm:text-base">
                                        <span className="min-w-0 break-words">
                                            {faq.question}
                                        </span>

                                        <span
                                            className="shrink-0 text-xl leading-6 text-[#7b8066] transition group-open:rotate-45"
                                            aria-hidden="true"
                                        >
                                            +
                                        </span>
                                    </summary>

                                    <p className="mt-4 max-w-3xl text-sm leading-7 text-[#687069]">
                                        {faq.answer}
                                    </p>
                                </details>
                            ))}
                        </div>

                        <div className="mt-7 text-center sm:mt-8">
                            <Link
                                href="/faq"
                                className="inline-flex min-h-11 items-center justify-center px-2 py-2 text-sm font-semibold text-[#30483a] transition hover:text-[#6a5130] sm:text-base"
                            >
                                View all FAQs →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-[#f2f6ef] py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 md:px-8 lg:px-12">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8066] sm:text-sm sm:tracking-[0.2em]">
                            Ready to participate?
                        </p>

                        <h2 className="mt-3 text-2xl font-bold leading-tight text-[#26332b] sm:text-3xl md:text-4xl">
                            Let&apos;s make the journey smooth and successful
                            together.
                        </h2>

                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#687069] sm:mt-5 sm:text-base sm:leading-8">
                            Apply to join Bajim Blossom and, once approved,
                            manage your contribution participation through your
                            member account.
                        </p>

                        <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center">
                            <Link
                                href="/join"
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#30483a] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263a2f] sm:w-auto"
                            >
                                Join the Thrift
                            </Link>

                            <Link
                                href="/contact"
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#cbd4c7] bg-white px-7 py-3.5 text-sm font-semibold text-[#30483a] transition hover:bg-[#f3f5f0] sm:w-auto"
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
