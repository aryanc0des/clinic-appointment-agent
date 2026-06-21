"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useClinicAuth } from "@/lib/clinic/auth-context";
import { ClinicTopNav } from "@/components/clinic/topnav";
import { CLINIC_IS_MOCK } from "@/lib/clinic/api/client";

export default function ClinicDashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useClinicAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && !CLINIC_IS_MOCK) {
      router.replace("/clinic/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <ClinicTopNav />
      <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
    </div>
  );
}
