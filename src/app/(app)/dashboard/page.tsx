"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Mic2 } from "lucide-react";

import { getAppointmentsApi } from "@/lib/api/appointments";
import { useAuth } from "@/lib/auth-context";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { ServicesPanel } from "@/components/dashboard/services-panel";
import { Skeleton } from "@/components/ui/skeleton";
import type { Appointment } from "@/lib/types";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getUpcoming(appointments: Appointment[]) {
  return appointments
    .filter((a) => !["completed", "cancelled", "missed"].includes(a.status))
    .sort(
      (a, b) =>
        new Date(`${a.appointment_date}T${a.appointment_time}`).getTime() -
        new Date(`${b.appointment_date}T${b.appointment_time}`).getTime()
    );
}

function getRecent(appointments: Appointment[]) {
  return appointments
    .filter((a) => a.status === "completed")
    .sort(
      (a, b) =>
        new Date(`${b.appointment_date}T${b.appointment_time}`).getTime() -
        new Date(`${a.appointment_date}T${a.appointment_time}`).getTime()
    )
    .slice(0, 3);
}

function VoiceButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/book?method=voice")}
      className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] border-[1.5px] border-primary/40 text-primary text-[15px] hover:bg-primary-subtle transition-colors ${className}`}
    >
      <Mic2 className="h-4 w-4" />
      Book by voice
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex gap-10 items-start">
      <div className="flex flex-col gap-8 flex-1 min-w-0 max-w-2xl">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-64" />
        </div>
        <Skeleton className="h-32 rounded-[10px]" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-20 rounded-[10px]" />
        </div>
      </div>
      <aside className="w-[420px] shrink-0 hidden lg:block">
        <Skeleton className="h-96 rounded-[10px]" />
      </aside>
    </div>
  );
}

export default function DashboardPage() {
  const { patient } = useAuth();
  const router = useRouter();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointmentsApi,
  });

  if (isLoading) return <DashboardSkeleton />;

  const upcoming = getUpcoming(appointments ?? []);
  const recent = getRecent(appointments ?? []);
  const firstName = patient?.full_name.split(" ")[0] ?? "there";

  return (
    <div className="flex gap-10 items-start">
      <div className="flex flex-col gap-9 flex-1 min-w-0 max-w-2xl">
      {/* Greeting */}
      <div>
        <p className="text-[13px] text-muted-foreground mb-0.5">{getGreeting()},</p>
        <h1 className="font-serif text-[42px] font-medium text-foreground tracking-tight leading-[1.04]">
          {firstName}.
        </h1>
      </div>

      {upcoming.length > 0 ? (
        <>
          {/* Upcoming */}
          <section>
            <h2 className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70 mb-3">
              Upcoming {upcoming.length > 1 ? `(${upcoming.length})` : ""}
            </h2>
            <div className="flex flex-col gap-3">
              {upcoming.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onReschedule={() => router.push("/appointments")}
                />
              ))}
            </div>
          </section>

          {/* Recent visits */}
          {recent.length > 0 && (
            <section>
              <h2 className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70 mb-3">
                Recent visits
              </h2>
              <div className="bg-card rounded-[10px] border border-border shadow-sm divide-y divide-border px-6">
                {recent.map((appt) => (
                  <AppointmentCard key={appt.id} appointment={appt} compact />
                ))}
              </div>
            </section>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/book?method=manual")}
              className="px-7 py-3.5 rounded-[10px] bg-primary text-primary-foreground text-[15px] font-medium hover:bg-primary-hover transition-colors"
            >
              Book manually
            </button>
            <VoiceButton />
          </div>
        </>
      ) : (
        /* Empty state */
        <div className="flex flex-1 flex-col items-center justify-center py-16">
          <div className="w-80 h-[100px] border-[1.5px] border-dashed rounded-[10px] mb-7 relative flex items-center justify-center border-foreground/15">
            <div className="absolute left-[18px] top-[14px] bottom-[14px] w-8 border-r border-foreground/10 flex flex-col items-center justify-center gap-1.5">
              <div className="w-3 h-[3px] bg-foreground/10 rounded-sm" />
              <div className="w-[18px] h-[18px] bg-foreground/[0.07] rounded-sm" />
              <div className="w-3 h-[3px] bg-foreground/10 rounded-sm" />
            </div>
            <div className="ml-6 opacity-[0.16]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="4" x2="12" y2="20" stroke="#16302B" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="4" y1="12" x2="20" y2="12" stroke="#16302B" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <p className="font-serif text-2xl text-foreground/60 text-center tracking-tight mb-2 leading-tight">
            No upcoming visits.
          </p>
          <p className="text-sm text-muted-foreground text-center mb-8">Ready when you are.</p>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/book")}
              className="px-7 py-3.5 rounded-[10px] bg-accent text-accent-foreground text-[15px] font-medium hover:opacity-90 transition-opacity"
            >
              Book your first appointment
            </button>
            <VoiceButton />
          </div>
        </div>
      )}
      </div>

      {/* Services & pricing */}
      <aside className="w-[420px] shrink-0 hidden lg:block sticky top-20">
        <ServicesPanel />
      </aside>
    </div>
  );
}
