import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#faf8f2]">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#e7eddf] opacity-70 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#f1e9d6] opacity-60 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center rounded-full border border-[#d9dfd4] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#61705f] shadow-sm">
              Bajim Blossom Kitchen &amp; Household Items
            </div>

            <h1 className="mt-7 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-[#26332b] sm:text-5xl lg:text-6xl">
              Make Your Household Needs Easier, One Contribution at a Time.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[#687069] sm:text-lg">
              Join Bajim Blossom Kitchen &amp; Household Items and contribute
              ₦3,000 weekly toward useful and quality kitchen and household
              items without putting too much pressure on your pocket.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-full bg-[#30483a] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263a2f]"
              >
                Join the Thrift
              </Link>

              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-[#cbd4c7] bg-white px-7 py-3.5 text-sm font-semibold text-[#30483a] transition hover:bg-[#f3f5f0]"
              >
                How It Works
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#687069]">
              <span>✓ Weekly contribution</span>
              <span>✓ Organized records</span>
              <span>✓ Community participation</span>
            </div>
          </div>

          <div className="relative">
            <div className="mx-auto max-w-md rounded-[2rem] border border-[#e2ddcf] bg-white p-5 shadow-[0_20px_60px_rgba(38,51,43,0.08)] sm:p-6">
              <div className="rounded-[1.5rem] bg-[#30483a] p-7 text-white sm:p-8">
                <p className="text-sm font-medium text-[#dce5dc]">
                  Weekly Contribution
                </p>

                <p className="mt-3 text-5xl font-bold tracking-tight">
                  ₦3,000
                </p>

                <p className="mt-2 text-sm text-[#dce5dc]">
                  Contribute consistently toward useful household items.
                </p>

                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                    <span className="text-sm text-[#dce5dc]">Due</span>
                    <span className="text-sm font-semibold">Friday</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                    <span className="text-sm text-[#dce5dc]">Grace</span>
                    <span className="text-sm font-semibold">
                      Sat. 10:00 AM
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                    <span className="text-sm text-[#dce5dc]">Late fine</span>
                    <span className="text-sm font-semibold">₦500</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-2 pb-1 pt-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e7eddf] text-sm font-bold text-[#40533f]">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#30483a]">
                    Simple. Organized. Community-focused.
                  </p>

                  <p className="mt-0.5 text-xs text-[#7a817b]">
                    Track your participation with ease.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}