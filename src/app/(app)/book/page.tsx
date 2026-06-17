"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarPlus, Mic2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingForm } from "@/components/appointments/booking-form";
import { VoiceAgent } from "@/components/appointments/voice-agent";
import { Skeleton } from "@/components/ui/skeleton";

type Method = "manual" | "voice";

function BookPageInner() {
  const searchParams = useSearchParams();
  const initialMethod = (searchParams.get("method") as Method) ?? "manual";
  const [method, setMethod] = useState<Method>(initialMethod);

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Book an appointment</h1>
        <p className="text-muted-foreground mt-1">Choose how you&apos;d like to book your visit</p>
      </div>

      {/* Method toggle */}
      <div
        className="grid grid-cols-2 gap-3"
        role="group"
        aria-label="Booking method"
      >
        <MethodButton
          active={method === "manual"}
          onClick={() => setMethod("manual")}
          icon={<CalendarPlus className="h-5 w-5" />}
          label="Fill a form"
          description="Manual booking"
        />
        <MethodButton
          active={method === "voice"}
          onClick={() => setMethod("voice")}
          icon={<Mic2 className="h-5 w-5" />}
          label="Speak to AI"
          description="Voice booking"
        />
      </div>

      {/* Method content */}
      <div className="rounded-xl bg-surface border border-border p-6 shadow-sm">
        {method === "manual" ? (
          <div>
            <h2 className="text-base font-semibold text-foreground mb-1">Appointment details</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Complete the form below and we&apos;ll confirm your appointment.
            </p>
            <BookingForm />
          </div>
        ) : (
          <div>
            <h2 className="text-base font-semibold text-foreground mb-1">Voice booking</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Talk to our AI assistant to book your appointment hands-free.
            </p>
            <VoiceAgent />
          </div>
        )}
      </div>
    </div>
  );
}

function MethodButton({
  active,
  onClick,
  icon,
  label,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "border-primary bg-primary-subtle text-primary shadow-sm"
          : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/50"
      )}
    >
      <span className={cn("transition-colors", active ? "text-primary" : "text-muted-foreground")}>
        {icon}
      </span>
      <div>
        <p className={cn("text-sm font-semibold", active ? "text-primary" : "text-foreground")}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto flex flex-col gap-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
    >
      <BookPageInner />
    </Suspense>
  );
}
