"use client";
import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getStaffAppointmentsApi, updateAppointmentStatusApi } from "@/lib/clinic/api/appointments";
import { StatusBadge } from "@/components/clinic/status-badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal } from "lucide-react";
import { format, parseISO, isToday } from "date-fns";
import type { StaffAppointment, StaffAppointmentStatus } from "@/lib/types";

function durationLabel(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return `${mins}m`;
}

function timeLabel(time: string) {
  const [h, m] = time.split(":").map(Number);
  const p = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${p}`;
}

function nowTimeString() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function ClinicTodayPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<StaffAppointment | null>(null);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["staff-appointments"],
    queryFn: getStaffAppointmentsApi,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StaffAppointmentStatus }) =>
      updateAppointmentStatusApi(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["staff-appointments"] });
      const prev = queryClient.getQueryData<StaffAppointment[]>(["staff-appointments"]);
      queryClient.setQueryData<StaffAppointment[]>(
        ["staff-appointments"],
        old => old?.map(a => (a.id === id ? { ...a, status } : a))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(["staff-appointments"], ctx?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-appointments"] });
    },
  });

  const handleStatus = (id: string, status: StaffAppointmentStatus) => {
    statusMutation.mutate({ id, status });
    if (selected?.id === id) setSelected(s => (s ? { ...s, status } : s));
  };

  const today = appointments
    .filter(a => isToday(parseISO(a.appointment_date)))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const completedCount = today.filter(a => a.status === "completed").length;
  const scheduledCount = today.filter(a => a.status === "scheduled").length;
  const cancelledCount = today.filter(a => a.status === "cancelled").length;
  const missedCount = today.filter(a => a.status === "missed").length;

  const now = nowTimeString();
  const nowMarkerId = today.find(a => a.status === "scheduled" && a.start_time >= now)?.id;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-14 w-80" />
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Date header + tally */}
      <div className="pb-5">
        <h1 className="font-serif text-[52px] font-normal text-foreground tracking-tight leading-none">
          {format(new Date(), "EEEE, d MMMM")}
        </h1>
        <div className="flex items-center gap-4 flex-wrap mt-2.5">
          <span className="text-xs text-muted-foreground tabular-nums">
            {today.length} appointment{today.length !== 1 ? "s" : ""}
          </span>
          <Tally color="#5A8A5E" label={`${completedCount} completed`} />
          <Tally color="#9A7C35" label={`${scheduledCount} remaining`} />
          <Tally color="#8A4838" label={`${cancelledCount} cancelled`} />
          {missedCount > 0 && <Tally color="#8A4838" label={`${missedCount} missed`} />}
        </div>
      </div>

      {/* Register table */}
      <div className="bg-card border-t border-border">
        <div className="flex items-center h-9 px-6 bg-background border-b border-border">
          <div className="w-16 shrink-0 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">Time</div>
          <div className="flex-[1.1] text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">Patient</div>
          <div className="flex-[1.7] text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">Treatment</div>
          <div className="flex-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">Provider</div>
          <div className="w-12 shrink-0 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">Dur</div>
          <div className="w-28 shrink-0 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">Status</div>
          <div className="w-44 shrink-0 text-right text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">Actions</div>
        </div>

        {today.length === 0 ? (
          <div className="py-14 text-center text-sm text-muted-foreground">No appointments today.</div>
        ) : (
          today.map(apt => (
            <div key={apt.id}>
              {apt.id === nowMarkerId && (
                <div className="flex items-center gap-2.5 px-6 h-6 bg-background border-b border-border">
                  <div className="w-4 h-px bg-foreground/30 shrink-0" />
                  <span className="text-[10px] font-medium text-muted-foreground/70 tabular-nums whitespace-nowrap">
                    Now · {timeLabel(now)}
                  </span>
                  <div className="flex-1 h-px bg-foreground/10" />
                </div>
              )}
              <div
                className="flex items-center h-10 px-6 border-b border-border text-[12.5px] hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setSelected(apt)}
              >
                <div className="w-16 shrink-0 font-medium text-foreground tabular-nums">{apt.start_time.slice(0, 5)}</div>
                <div className="flex-[1.1] truncate pr-3 text-foreground">{apt.patient_name}</div>
                <div className="flex-[1.7] flex items-center gap-1.5 min-w-0 pr-2.5">
                  <span className="truncate text-foreground/75">{apt.service_name}</span>
                  {apt.treatment_plan_id && (
                    <Link
                      href={`/clinic/treatment-plans/${apt.treatment_plan_id}`}
                      onClick={e => e.stopPropagation()}
                      className="text-[10px] text-primary underline underline-offset-2 shrink-0 whitespace-nowrap"
                    >
                      plan ↗
                    </Link>
                  )}
                </div>
                <div className="flex-1 truncate pr-2.5 text-muted-foreground text-xs">{apt.doctor_name ?? "—"}</div>
                <div className="w-12 shrink-0 text-muted-foreground text-xs tabular-nums">
                  {durationLabel(apt.start_time, apt.end_time)}
                </div>
                <div className="w-28 shrink-0">
                  <StatusBadge status={apt.status} />
                </div>
                <div className="w-44 shrink-0 flex items-center justify-end gap-3.5" onClick={e => e.stopPropagation()}>
                  {apt.status === "scheduled" ? (
                    <>
                      <button
                        onClick={() => handleStatus(apt.id, "completed")}
                        className="text-xs font-medium text-primary"
                      >
                        Mark complete
                      </button>
                      <button
                        onClick={() => handleStatus(apt.id, "cancelled")}
                        className="text-xs text-muted-foreground/60"
                      >
                        Cancel
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-muted-foreground/50">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-sm">
                          <DropdownMenuItem onClick={() => handleStatus(apt.id, "missed")}>
                            Mark Missed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : (
                    <button onClick={() => setSelected(apt)} className="text-xs font-medium text-primary">
                      View
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="text-base">Appointment Detail</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4 text-sm">
              <div className="space-y-2">
                <Row label="Patient" value={selected.patient_name} />
                <Row label="Treatment" value={selected.service_name} />
                <Row
                  label="Date"
                  value={format(parseISO(selected.appointment_date), "EEEE, MMMM d, yyyy")}
                />
                <Row label="Time" value={`${selected.start_time} – ${selected.end_time}`} />
                <Row label="Provider" value={selected.doctor_name ?? "Not assigned"} />
                <Row label="Channel" value={selected.booking_channel === "voice" ? "Voice" : "Manual"} />
                <Row label="Status" value={<StatusBadge status={selected.status} />} />
                {selected.treatment_plan_id && (
                  <Row
                    label="Plan"
                    value={
                      <Link
                        href={`/clinic/treatment-plans/${selected.treatment_plan_id}`}
                        className="text-primary underline underline-offset-2"
                      >
                        View treatment plan ↗
                      </Link>
                    }
                  />
                )}
              </div>
              {selected.status === "scheduled" && (
                <div className="pt-2 space-y-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleStatus(selected.id, "completed")}
                      className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleStatus(selected.id, "missed")}
                      className="px-3 py-1.5 rounded-md border border-border text-xs font-medium"
                    >
                      Mark Missed
                    </button>
                    <button
                      onClick={() => handleStatus(selected.id, "cancelled")}
                      className="px-3 py-1.5 rounded-md border border-destructive/30 text-destructive text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Tally({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-xs text-muted-foreground tabular-nums">{label}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
