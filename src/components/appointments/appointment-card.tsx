"use client";

import { format, parseISO } from "date-fns";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import type { Appointment } from "@/lib/types";

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onReschedule?: (appointment: Appointment) => void;
  compact?: boolean;
}

export function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
  compact = false,
}: AppointmentCardProps) {
  const isPast = ["completed", "cancelled", "missed"].includes(appointment.status);

  let month = "";
  let day = "";
  let weekday = "";
  try {
    const d = parseISO(appointment.appointment_date);
    month = format(d, "MMM");
    day = format(d, "d");
    weekday = format(d, "EEE");
  } catch {
    // keep blank
  }

  const typeName = appointment.appointment_type?.name ?? "Appointment";
  const duration = appointment.appointment_type?.duration_minutes;

  if (compact) {
    return (
      <div className="flex items-center gap-4 py-3.5 px-1">
        <div className="flex flex-col items-center min-w-[28px] shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
            {month}
          </span>
          <span className="font-serif text-[22px] leading-tight text-muted-foreground/70">
            {day}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm" style={{ color: "rgba(22,48,43,0.72)" }}>
            {typeName}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            {appointment.doctor_name ? `${appointment.doctor_name} · ` : ""}
            {formatTime(appointment.appointment_time)}
            {duration ? ` · ${duration} min` : ""}
          </p>
        </div>
        <StatusPill status={appointment.status} className="shrink-0" />
      </div>
    );
  }

  return (
    <div
      className={`bg-card rounded-[10px] overflow-hidden border border-border shadow-sm ${
        isPast ? "opacity-70" : ""
      }`}
    >
      <div className="flex p-5">
        <div className="flex flex-col items-center pr-5 border-r border-border min-w-[62px] shrink-0 pt-0.5">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {month}
          </span>
          <span className="font-serif text-[44px] font-medium leading-none text-foreground my-0.5">
            {day}
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {weekday}
          </span>
        </div>

        <div className="flex-1 pl-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-medium text-foreground tracking-tight mb-1 truncate">
              {typeName}
            </p>
            {appointment.doctor_name && (
              <p className="text-sm text-muted-foreground mb-2.5">{appointment.doctor_name}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {formatTime(appointment.appointment_time)}
              </span>
              {duration && (
                <>
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <span>{duration} min</span>
                </>
              )}
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span>{appointment.full_name}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0 ml-2">
            <StatusPill status={appointment.status} />
            {!isPast && (onCancel || onReschedule) && (
              <div className="flex items-center gap-3">
                {onReschedule && (
                  <button
                    onClick={() => onReschedule(appointment)}
                    className="text-sm text-primary underline underline-offset-2 hover:opacity-80"
                  >
                    Reschedule
                  </button>
                )}
                {onCancel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive-subtle h-7 px-2"
                    onClick={() => onCancel(appointment.id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
