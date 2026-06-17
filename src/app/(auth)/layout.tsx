import { Stethoscope } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="py-5 px-6">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Stethoscope className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold text-foreground">CareBook</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="py-5 px-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CareBook. Your health information is kept private and secure.
      </footer>
    </div>
  );
}
