"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Calendar, CalendarPlus, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { href: "/dashboard", label: "My visits", icon: LayoutDashboard },
  { href: "/book", label: "Book", icon: CalendarPlus },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/profile", label: "Profile", icon: User },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg bg-primary shrink-0"
      style={{ width: size, height: size }}
    >
      <span
        className="font-serif text-primary-foreground font-semibold leading-none"
        style={{ fontSize: size * 0.57, letterSpacing: "-0.02em" }}
      >
        S
      </span>
    </div>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { patient, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <>
      {/* Desktop nav */}
      <header className="hidden md:flex h-14 items-center border-b border-border bg-surface sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between gap-8 w-full">
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <Logo />
            <span className="font-serif text-lg font-medium text-foreground tracking-tight">
              SmileCare
            </span>
          </Link>

          <nav className="flex items-center gap-7" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "text-sm pb-0.5 transition-colors",
                    active
                      ? "font-medium text-foreground border-b-[1.5px] border-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {patient && (
              <div className="flex items-center gap-2.5">
                <span className="text-sm text-muted-foreground hidden lg:block">
                  {patient.full_name.split(" ")[0]}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-foreground text-background text-xs font-medium">
                    {initials(patient.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <header className="md:hidden h-14 flex items-center justify-between px-4 border-b border-border bg-surface sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo size={26} />
          <span className="font-serif text-base font-medium text-foreground">SmileCare</span>
        </Link>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-30 bg-background">
          <nav className="p-4 flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    active
                      ? "bg-primary-subtle text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border"
        aria-label="Bottom navigation"
      >
        <div className="flex">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2 px-1 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5", active && "text-primary")} />
                {label === "Appointments" ? "Visits" : label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
