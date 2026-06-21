import Link from "next/link";
import { Logo } from "@/components/layout/nav-bar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="py-5 px-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <Logo />
          <span className="font-serif text-lg font-medium text-foreground tracking-tight">
            SmileCare
          </span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="py-5 px-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SmileCare Dental. Your health information is kept private and secure.
      </footer>
    </div>
  );
}
