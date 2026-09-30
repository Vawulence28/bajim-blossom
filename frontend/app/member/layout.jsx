import MemberSidebar from "../../components/member/MemberSidebar";
import MemberMobileNav from "../../components/member/MemberMobileNav";

export default function MemberLayout({ children }) {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <div className="flex min-h-screen">
        <MemberSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <MemberMobileNav />

          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}