"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CalendarPlus, Mic2, Calendar, Sparkles } from "lucide-react";
import { format } from "date-fns";

import { getAppointmentsApi } from "@/lib/api/appointments";
import { useAuth } from "@/lib/auth-context";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { Button } from "@/components/ui/button";
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
    .filter((a) => !["completed", "cancelled"].includes(a.status))
    .sort(
      (a, b) =>
        new Date(`${a.appointment_date}T${a.appointment_time}`).getTime() -
        new Date(`${b.appointment_date}T${b.appointment_time}`).getTime()
    )
    .slice(0, 3);
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
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
  const firstName = patient?.full_name.split(" ")[0] ?? "there";
  const today = format(new Date(), "EEEE, MMMM d");

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground font-medium">{today}</p>
        </div>
        <h1 className="text-3xl font-semibold text-foreground">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-muted-foreground mt-0.5">
          {upcoming.length > 0
            ? `You have ${upcoming.length} upcoming appointment${upcoming.length > 1 ? "s" : ""}.`
            : "No upcoming appointments. Ready to book one?"}
        </p>
      </div>

      {/* Primary actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => router.push("/book?method=manual")}
          className="group flex flex-col items-start gap-3 rounded-xl bg-primary p-6 text-left shadow-md hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/15">
            <CalendarPlus className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-base font-semibold text-primary-foreground">Book Manually</p>
            <p className="text-sm text-primary-foreground/75 mt-0.5 leading-snug">
              Fill in a quick form to schedule your visit
            </p>
          </div>
        </button>

        <button
          onClick={() => router.push("/book?method=voice")}
          className="group flex flex-col items-start gap-3 rounded-xl bg-surface border border-border p-6 text-left shadow-sm hover:shadow-md hover:border-primary/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle">
            <Mic2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Book by Voice</p>
            <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
              Speak naturally — our AI books it for you
            </p>
          </div>
        </button>
      </div>

      {/* Upcoming appointments */}
      <section aria-labelledby="upcoming-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="upcoming-heading" className="text-lg font-semibold text-foreground">
            Upcoming appointments
          </h2>
          {upcoming.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/appointments")}
              className="text-primary hover:text-primary"
            >
              View all
            </Button>
          )}
        </div>

        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 py-14 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <p className="text-base font-medium text-foreground">No upcoming appointments</p>
            <p className="text-sm text-muted-foreground mt-1 mb-5">
              Book your first appointment to get started
            </p>
            <Button onClick={() => router.push("/book")}>Book an appointment</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} compact />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
