import { NavBar } from "./nav-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
