import AdminSidebar from "./_components/admin-sidebar";
import DevOnly from "@/components/dev/DevOnly";
import DevKeyWarningTrace from "@/components/dev/DevKeyWarningTrace";

export const metadata = {
  title: "Admin — Carnet d’expérience",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen min-h-screen px-6 py-6">
      <div className="grid w-full grid-cols-[260px_1fr] gap-8">
        <AdminSidebar />
        <main className="min-w-0">
          <DevOnly>
            <DevKeyWarningTrace />
          </DevOnly>

          {children}
        </main>
      </div>
    </section>
  );
}