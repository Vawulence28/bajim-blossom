import Link from "next/link";

import PublicNavbar from "../../components/public/PublicNavbar";
import PublicFooter from "../../components/public/PublicFooter";

const faqs = [
    {
        question: "How much do I contribute?",
        answer:
            "The standard contribution is ₦3,000 per week. The applicable amount for a particular cycle is determined by the cycle configuration.",
    },
    {
        question: "When is my contribution due?",
        answer:
            "The stated standard deadline is Friday, with a grace period until 10:00 AM Saturday.",
    },
    {
        question: "What happens if I pay late?",
        answer:
            "A ₦500 late-payment fine applies after the configured grace period under the stated contribution arrangement.",
    },
    {
        question: "Does the website process payments?",
        answer:
            "No. Payments are made manually using the payment instructions provided by Bajim Blossom. An administrator verifies and records payments.",
    },
    {
        question: "Can I see my contribution history?",
        answer:
            "Yes. Approved members can view their contribution history through the member portal.",
    },
    {
        question: "Can I see my item history?",
        answer:
            "Yes. Members can view items recorded against their account through the member portal.",
    },
    {
        question: "Can members edit their payment records?",
        answer:
            "No. Payment records are managed by authorized administrators. Members can view their records but cannot modify them.",
    },
    {
        question:
            "Can I see other members' private information?",
        answer:
            "No. Private information such as phone numbers, email addresses, payment amounts, payment references, fines and private notes are protected.",
    },
];

export const metadata = {
    title: "FAQ | Bajim Blossom Kitchen & Household Items",
    description:
        "Frequently asked questions about Bajim Blossom Kitchen & Household Items.",
};

export default function FAQPage() {
    return (
        <>
            <PublicNavbar />

            <main className="overflow-x-hidden">
                {/* Page Header */}
                <section className="bg-[#30483a] py-14 text-white sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d9c58b] sm:text-sm sm:tracking-[0.2em]">
                                Frequently Asked Questions
                            </p>

                            <h1 className="mt-4 break-words text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                                Questions, answered simply.
                            </h1>

                            <p className="mt-5 max-w-2xl break-words text-sm leading-7 text-[#d5ded7] sm:mt-6 sm:text-base sm:leading-8 md:text-lg">
                                Find answers to common questions about
                                contributions, payments, membership and the
                                member portal.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FAQ List */}
                <section className="bg-white py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="space-y-3 sm:space-y-4">
                            {faqs.map((faq) => (
                                <details
                                    key={faq.question}
                                    className="group overflow-hidden rounded-2xl border border-[#e7e2d5] bg-[#faf8f2]"
                                >
                                    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-sm font-semibold text-[#30483a] outline-none transition hover:bg-[#f4f1e8] focus-visible:ring-2 focus-visible:ring-[#7b8066] focus-visible:ring-inset sm:min-h-20 sm:gap-6 sm:px-6 sm:py-5 sm:text-base md:text-lg">
                                        <span className="min-w-0 break-words pr-2">
                                            {faq.question}
                                        </span>

                                        <span
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-2xl font-normal leading-none text-[#7b8066] transition-transform group-open:rotate-45 sm:h-9 sm:w-9"
                                            aria-hidden="true"
                                        >
                                            +
                                        </span>
                                    </summary>

                                    <div className="px-4 pb-5 sm:px-6 sm:pb-6">
                                        <p className="max-w-3xl break-words border-t border-[#e7e2d5] pt-4 text-sm leading-7 text-[#687069] sm:pt-5 sm:text-base">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="bg-[#f2f6ef] py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 md:px-8 lg:px-12">
                        <h2 className="break-words text-2xl font-bold text-[#26332b] sm:text-3xl">
                            Still have a question?
                        </h2>

                        <p className="mx-auto mt-4 max-w-2xl break-words text-sm leading-7 text-[#687069] sm:mt-5 sm:text-base sm:leading-8">
                            If your question is not answered here, contact
                            Bajim Blossom for clarification.
                        </p>

                        <Link
                            href="/contact"
                            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#30483a] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263a2f] active:scale-[0.99] sm:mt-8 sm:w-auto"
                        >
                            Contact Us
                        </Link>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </>
    );
}