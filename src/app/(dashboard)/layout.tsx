import Nav from "@/components/Nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Nav />
      <main className="flex-1 md:ml-56 p-4 pb-20 md:pb-4">{children}</main>
    </div>
  );
}
