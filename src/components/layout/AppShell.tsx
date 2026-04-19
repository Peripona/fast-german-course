import { Header } from "./Header";
import { MobileNav, Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col pb-16 md:pb-0">
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
