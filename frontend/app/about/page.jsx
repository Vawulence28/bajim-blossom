import Link from "next/link";

import PublicNavbar from "../../components/public/PublicNavbar";
import PublicFooter from "../../components/public/PublicFooter";
import SectionHeading from "../../components/public/SectionHeading";

export const metadata = {
    title: "About | Bajim Blossom Kitchen & Household Items",
    description:
        "Learn about Bajim Blossom Kitchen & Household Items and its community-based thrift contribution approach.",
};

export default function AboutPage() {
    return (
        <>
            <PublicNavbar />

            <main className="overflow-x-hidden">
                {/* Page Header */}
                <section className="bg-[#30483a] py-14 text-white sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d9c58b] sm:text-sm sm:tracking-[0.2em]">
                                About Bajim Blossom
                            </p>

                            <h1 className="mt-4 break-words text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                                Making household needs easier, one contribution at a time.
                            </h1>

                            <p className="mt-5 max-w-2xl break-words text-sm leading-7 text-[#d5ded7] sm:mt-6 sm:text-base sm:leading-8 md:text-lg">
                                Bajim Blossom Kitchen &amp; Household Items is a
                                community-based thrift initiative built around manageable
                                contributions toward useful kitchen and household items.
                            </p>
                        </div>
                    </div>
                </section>

                {/* About */}
                <section className="bg-white py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
                            <SectionHeading
                                eyebrow="Who We Are"
                                title="A community approach to household needs."
                                description="The idea behind Bajim Blossom is straightforward: contribute consistently, participate responsibly and work toward useful household items through an organized thrift arrangement."
                            />

                            <div className="rounded-[1.5rem] bg-[#f2f6ef] p-6 sm:rounded-[2rem] sm:p-8 lg:p-10">
                                <p className="break-words text-base leading-7 text-[#405047] sm:text-lg sm:leading-8">
                                    Here, we will be contributing ₦3,000 every week, to get
                                    useful and quality kitchen/household items without putting
                                    too much pressure on our pockets.
                                </p>

                                <p className="mt-5 break-words text-base leading-7 text-[#405047] sm:text-lg sm:leading-8">
                                    Let&apos;s contribute consistently, shop wisely and enjoy
                                    our items.
                                </p>

                                <p className="mt-5 border-t border-[#d6dfd2] pt-5 text-sm font-semibold leading-6 text-[#30483a] sm:mt-6 sm:pt-6">
                                    Let&apos;s make this a smooth and successful journey
                                    together.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What We Focus On */}
                <section className="bg-[#faf8f2] py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <SectionHeading
                            eyebrow="Our Focus"
                            title="Simple principles guide the experience."
                            description="The platform is designed to support a clear and organized contribution process without making promises beyond what the thrift arrangement provides."
                            centered
                        />

                        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:mt-12 md:grid-cols-3 md:gap-6">
                            <div className="rounded-2xl border border-[#e7e2d5] bg-white p-5 sm:p-7">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7eddf] text-sm font-bold text-[#30483a] sm:h-12 sm:w-12">
                                    01
                                </div>

                                <h2 className="mt-5 text-lg font-bold text-[#30483a] sm:mt-6 sm:text-xl">
                                    Consistency
                                </h2>

                                <p className="mt-3 break-words text-sm leading-7 text-[#687069]">
                                    Members are encouraged to keep up with their contribution
                                    commitments and communicate when clarification is needed.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[#e7e2d5] bg-white p-5 sm:p-7">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1e9d6] text-sm font-bold text-[#6a5130] sm:h-12 sm:w-12">
                                    02
                                </div>

                                <h2 className="mt-5 text-lg font-bold text-[#30483a] sm:mt-6 sm:text-xl">
                                    Usefulness
                                </h2>

                                <p className="mt-3 break-words text-sm leading-7 text-[#687069]">
                                    The initiative is centered around useful kitchen and
                                    household items rather than financial investment returns.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[#e7e2d5] bg-white p-5 sm:p-7">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7eddf] text-sm font-bold text-[#30483a] sm:h-12 sm:w-12">
                                    03
                                </div>

                                <h2 className="mt-5 text-lg font-bold text-[#30483a] sm:mt-6 sm:text-xl">
                                    Organization
                                </h2>

                                <p className="mt-3 break-words text-sm leading-7 text-[#687069]">
                                    Contribution records, member information and relevant
                                    participation details are organized through the platform.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What Bajim Blossom Is */}
                <section className="bg-white py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12">
                        <SectionHeading
                            eyebrow="What We Are"
                            title="A community-based thrift initiative."
                            description="Bajim Blossom exists to organize contributions toward useful kitchen and household items."
                            centered
                        />

                        <div className="mt-8 rounded-[1.5rem] border border-[#e7e2d5] bg-[#faf8f2] p-5 sm:mt-10 sm:rounded-[2rem] sm:p-8 md:p-10">
                            <div className="space-y-4 text-sm leading-7 text-[#58635b] sm:space-y-5 sm:text-base sm:leading-8">
                                <p>
                                    Bajim Blossom Kitchen &amp; Household Items is focused on
                                    helping members participate in a structured thrift
                                    contribution arrangement.
                                </p>

                                <p>
                                    Members contribute according to the active cycle, keep
                                    track of their participation and receive items according
                                    to the organization&apos;s arrangement.
                                </p>

                                <p>
                                    The platform provides organized records and account
                                    access so members can monitor their own contribution
                                    information.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Important distinction */}
                <section className="bg-[#f2f6ef] py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 md:px-8 lg:px-12">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#30483a] text-lg font-bold text-white sm:h-14 sm:w-14 sm:rounded-2xl sm:text-xl">
                            i
                        </div>

                        <h2 className="mt-5 break-words text-2xl font-bold text-[#26332b] sm:mt-6 sm:text-3xl">
                            What Bajim Blossom is not
                        </h2>

                        <p className="mx-auto mt-4 max-w-2xl break-words text-sm leading-7 text-[#687069] sm:mt-5 sm:text-base sm:leading-8">
                            Bajim Blossom is not a bank, investment company, loan company or
                            financial institution. The initiative is focused on organized
                            thrift contributions toward kitchen and household items.
                        </p>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-white py-14 sm:py-20 lg:py-24">
                    <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 md:px-8 lg:px-12">
                        <h2 className="break-words text-2xl font-bold text-[#26332b] sm:text-3xl md:text-4xl">
                            Ready to learn how it works?
                        </h2>

                        <p className="mx-auto mt-4 max-w-2xl break-words text-sm leading-7 text-[#687069] sm:mt-5 sm:text-base sm:leading-8">
                            Understand the contribution process, deadlines and member
                            journey before applying to join.
                        </p>

                        <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-row sm:justify-center">
                            <Link
                                href="/how-it-works"
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#30483a] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263a2f] sm:w-auto"
                            >
                                How It Works
                            </Link>

                            <Link
                                href="/join"
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#cbd4c7] bg-white px-7 py-3.5 text-sm font-semibold text-[#30483a] transition hover:bg-[#f3f5f0] sm:w-auto"
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