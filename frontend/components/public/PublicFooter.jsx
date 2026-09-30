import Link from "next/link";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Guidelines", href: "/guidelines" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function PublicFooter() {
  return (
    <footer className="border-t border-[#e7e2d5] bg-[#263a2f] text-white">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 lg:px-12">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
              aria-label="Bajim Blossom home"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d9c58b] text-sm font-bold text-[#263a2f]"
                aria-hidden="true"
              >
                BB
              </div>

              <div>
                <p className="text-base font-bold">Bajim Blossom</p>

                <p className="mt-0.5 text-xs text-[#c7d0c9]">
                  Kitchen &amp; Household Items
                </p>
              </div>
            </Link>

            <p className="mt-6 max-w-md text-sm leading-7 text-[#c7d0c9]">
              A community-based thrift contribution initiative focused on
              useful kitchen and household items through organized weekly
              contributions.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#d9c58b]">
              Explore
            </h2>

            <nav className="mt-5" aria-label="Footer navigation">
              <ul className="space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#d9dfda] transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Account */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#d9c58b]">
              Member Access
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#c7d0c9]">
              Already a member? Access your account to view your contribution
              history and other member information.
            </p>

            <div className="mt-5 flex flex-col items-start gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-[#617167] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#30483a]"
              >
                Member Login
              </Link>

              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-full bg-[#d9c58b] px-5 py-2.5 text-sm font-semibold text-[#263a2f] transition hover:bg-[#e4d39e]"
              >
                Join the Thrift
              </Link>
            </div>
          </div>
        </div>

        {/* Contact placeholder */}
        <div className="mt-12 border-t border-[#4b5b51] pt-8">
          <div className="grid gap-6 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#d9c58b]">
                Phone
              </p>

              <p className="mt-2 text-[#c7d0c9]">08028963739, 09157464134</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#d9c58b]">
                Email
              </p>

              <p className="mt-2 text-[#c7d0c9]">olajummie24@gmail.com</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#d9c58b]">
                Address
              </p>

              <p className="mt-2 text-[#c7d0c9]">CAC Bus-Stop, AIT Road, Kollington Bus-Stop, Alagbado, Lagos State.</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 flex flex-col gap-3 border-t border-[#4b5b51] pt-6 text-xs text-[#aebbb2] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Bajim Blossom Kitchen &amp; Household
            Items. All rights reserved.
          </p>

          <p>Community thrift contribution initiative.</p>
        </div>
      </div>
    </footer>
  );
}