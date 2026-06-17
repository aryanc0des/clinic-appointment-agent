"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, Stethoscope, User } from "lucide-react";
import { cn, formatTime, getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/lib/types";
import type { BadgeProps } from "@/components/ui/badge";

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onReschedule?: (appointment: Appointment) => void;
  compact?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  upcoming: "Upcoming",
  confirmed: "Confirmed",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
  compact = false,
}: AppointmentCardProps) {
  const statusColor = getStatusColor(appointment.status) as BadgeProps["variant"];
  const statusLabel = STATUS_LABELS[appointment.status] ?? appointment.status;
  const isPast = ["completed", "cancelled"].includes(appointment.status);

  let formattedDate = appointment.appointment_date;
  try {
    formattedDate = format(parseISO(appointment.appointment_date), "EEEE, MMMM d, yyyy");
  } catch {
    // keep raw string
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
        isPast && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Type + status */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-base font-semibold text-foreground truncate">
              {appointment.appointment_type?.name ?? "Appointment"}
            </span>
            <Badge variant={statusColor}>{statusLabel}</Badge>
          </div>

          {/* Date and time */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{formatTime(appointment.appointment_time)}</span>
            </div>
          </div>

          {/* Doctor / patient name */}
          {!compact && (
            <div className="mt-3 flex flex-col gap-1">
              {appointment.doctor_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                  <span>{appointment.doctor_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span>{appointment.full_name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Duration pill */}
        {appointment.appointment_type?.duration_minutes && (
          <span className="shrink-0 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1 font-medium">
            {appointment.appointment_type.duration_minutes} min
          </span>
        )}
      </div>

      {/* Actions for upcoming only */}
      {!compact && !isPast && (onCancel || onReschedule) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          {onReschedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReschedule(appointment)}
            >
              Reschedule
            </Button>
          )}
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive-subtle"
              onClick={() => onCancel(appointment.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
