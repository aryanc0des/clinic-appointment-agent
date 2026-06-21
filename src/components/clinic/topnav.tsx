"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useClinicAuth } from "@/lib/clinic/auth-context";
import { Logo } from "@/components/layout/nav-bar";

const NAV = [
  { href: "/clinic/dashboard", label: "Today" },
  { href: "/clinic/appointments", label: "Appointments" },
  { href: "/clinic/patients", label: "Patients" },
  { href: "/clinic/treatment-plans", label: "Treatment Plans" },
  { href: "/clinic/services", label: "Services" },
];

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

export function ClinicTopNav() {
  const pathname = usePathname();
  const { user, logout } = useClinicAuth();

  return (
    <header className="h-[52px] flex items-center px-7 bg-card border-b border-border shrink-0">
      <Link href="/clinic/dashboard" className="flex items-center gap-2 mr-8 shrink-0">
        <Logo size={26} />
        <span className="font-serif text-[17px] font-medium text-foreground tracking-tight">SmileCare</span>
        <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-[3px] font-semibold tracking-wider">
          ADMIN
        </span>
      </Link>

      <nav className="flex items-stretch h-full" aria-label="Admin navigation">
        {NAV.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center px-4 text-[13px] transition-colors",
                active
                  ? "font-medium text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {user?.full_name ?? "Staff"}&apos;s practice
        </span>
        <button onClick={logout} title="Sign out" className="shrink-0">
          <div className="h-[30px] w-[30px] rounded-full bg-foreground flex items-center justify-center">
            <span className="text-[10px] font-medium text-background">
              {initials(user?.full_name ?? "Staff")}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
