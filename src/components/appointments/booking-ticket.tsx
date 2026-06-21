"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/lib/types";

function formatTimeLabel(time: string) {
  const [h, m] = time.split(":").map(Number);
  const p = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${p}`;
}

function refNumber(id: string) {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function BookingTicket({
  appointment,
  onBookAnother,
}: {
  appointment: Appointment;
  onBookAnother: () => void;
}) {
  const [replay, setReplay] = useState(0);

  let weekday = "";
  let dateLabel = appointment.appointment_date;
  try {
    const d = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    weekday = format(d, "EEEE");
    dateLabel = format(d, "MMMM d");
  } catch {
    // keep raw
  }

  const timeLabel = formatTimeLabel(appointment.appointment_time);
  const typeName = appointment.appointment_type?.name ?? "Appointment";
  const duration = appointment.appointment_type?.duration_minutes;
  const ref = refNumber(appointment.id);

  return (
    <div className="flex flex-col items-center" key={replay}>
      <div className="w-full max-w-[420px] mb-8">
        <h2
          className="font-serif text-[40px] font-medium text-foreground tracking-tight leading-[1.04]"
          style={{ animation: "dateSettle 0.45s ease-out 0.05s both" }}
        >
          You&apos;re all set.
        </h2>
      </div>

      {/* Ticket */}
      <div
        className="w-full max-w-[420px] bg-card border border-border relative shadow-md"
        style={{ animation: "ticketReveal 0.5s ease-out both" }}
      >
        {/* Perf top */}
        <div className="h-[15px] border-b-[1.5px] border-dashed border-border bg-background flex items-center justify-end pr-5">
          <span className="text-[8px] text-muted-foreground/50 tracking-wide tabular-nums">
            SC-{ref}
          </span>
        </div>

        <div className="p-6 pb-6 relative">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-primary mb-4">
            SmileCare Dental
          </p>

          <div style={{ animation: "dateSettle 0.48s ease-out 0.2s both" }}>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1 tabular-nums">
              {weekday}
            </p>
            <p className="font-serif text-[44px] font-medium text-foreground tracking-tight leading-none tabular-nums">
              {dateLabel}
            </p>
          </div>

          <div
            className="h-px bg-border my-4 origin-left"
            style={{ animation: "lineExpand 0.35s ease-in-out 0.56s both" }}
          />

          <div style={{ animation: "dateSettle 0.44s ease-out 0.74s both" }}>
            <p className="font-serif text-[50px] font-medium text-foreground tracking-tight leading-none tabular-nums">
              {timeLabel}
            </p>
          </div>

          <div
            className="mt-4 pt-3.5 border-t border-border"
            style={{ animation: "dateSettle 0.4s ease-out 0.92s both" }}
          >
            <p className="text-sm font-medium text-foreground mb-1 tracking-tight">{typeName}</p>
            <p className="text-[13px] text-muted-foreground mb-0.5">
              {appointment.doctor_name ? `${appointment.doctor_name} · ` : ""}
              {duration ? `${duration} min` : ""}
            </p>
            <p className="text-xs text-muted-foreground/70">{appointment.full_name}</p>
          </div>

          {/* Confirmed stamp */}
          <div
            className="absolute bottom-5 right-6 w-[78px] h-[78px] rounded-full bg-card border-[1.5px] border-accent flex flex-col items-center justify-center"
            style={{
              outline: "1.5px solid rgba(196,98,45,0.4)",
              outlineOffset: "5px",
              animation: "stampDrop 0.65s cubic-bezier(0.34,1.56,0.64,1) 1.12s both",
            }}
          >
            <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-accent leading-tight">
              Confirmed
            </span>
            <span className="w-7 h-px bg-accent/30 my-1" />
            <span className="font-serif text-xs font-medium text-accent tabular-nums">
              {format(new Date(`${appointment.appointment_date}T00:00`), "MMM d")}
            </span>
          </div>
        </div>

        {/* Perf bottom */}
        <div className="border-t-[1.5px] border-dashed border-border px-6 py-2.5">
          <p className="text-[10px] text-muted-foreground/60 tracking-wide tabular-nums">
            REF SC-{ref}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex gap-3 mt-6 w-full max-w-[420px]"
        style={{ animation: "dateSettle 0.4s ease-out 1.4s both" }}
      >
        <Button variant="outline" className="flex-1" onClick={onBookAnother}>
          Book another
        </Button>
        <Button className="flex-1 bg-foreground hover:bg-foreground/90 text-background" asChild>
          <a href="/appointments">Back to home →</a>
        </Button>
      </div>

      <button
        onClick={() => setReplay((r) => r + 1)}
        className="mt-3.5 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/70 border border-foreground/15 rounded-md px-3.5 py-1.5 hover:text-foreground transition-colors"
      >
        <span className="text-sm leading-none">↺</span> Replay animation
      </button>
    </div>
  );
}
