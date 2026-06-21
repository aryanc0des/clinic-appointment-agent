"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTreatmentPlanApi,
  markSessionCompleteApi,
  scheduleSessionApi,
} from "@/lib/clinic/api/treatment-plans";
import { StatusBadge } from "@/components/clinic/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import Link from "next/link";
import { use } from "react";
import type { TreatmentSession } from "@/lib/types";

export default function TreatmentPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [scheduling, setScheduling] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const { data: plan, isLoading } = useQuery({
    queryKey: ["treatment-plan", id],
    queryFn: () => getTreatmentPlanApi(id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["treatment-plan", id] });
    queryClient.invalidateQueries({ queryKey: ["treatment-plans"] });
  };

  const completeMutation = useMutation({
    mutationFn: (sessionNumber: number) => markSessionCompleteApi(id, sessionNumber),
    onSuccess: invalidate,
  });

  const scheduleMutation = useMutation({
    mutationFn: (sessionNumber: number) => scheduleSessionApi(id, sessionNumber, date, time),
    onSuccess: () => {
      invalidate();
      setScheduling(false);
      setDate("");
      setTime("");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (!plan) return <p className="text-sm text-muted-foreground">Plan not found.</p>;

  const currentSession = plan.sessions.find(s => s.session_number === plan.current_session);
  const allDone = plan.status === "completed";

  const canMark =
    plan.status === "in_progress" &&
    currentSession?.status === "scheduled" &&
    currentSession.appointment_date != null &&
    isPast(parseISO(currentSession.appointment_date));

  const canSchedule =
    plan.status === "in_progress" && currentSession != null && currentSession.appointment_date == null;

  const markReason = !canMark
    ? allDone
      ? "All sessions complete."
      : canSchedule
      ? "Schedule the next session to begin."
      : null
    : null;

  const schedReason = !canSchedule
    ? allDone
      ? "Treatment plan complete."
      : currentSession?.appointment_date != null
      ? "Mark the current session complete first."
      : null
    : null;

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground/70 flex-wrap">
        <Link href="/clinic/patients" className="underline underline-offset-2 hover:text-foreground">
          Patients
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <Link href={`/clinic/patients/${plan.patient_id}`} className="underline underline-offset-2 hover:text-foreground">
          {plan.patient_name}
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <Link href="/clinic/treatment-plans" className="underline underline-offset-2 hover:text-foreground">
          Treatment Plans
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground font-medium">{plan.service_name}</span>
      </div>

      {/* Patient header bar */}
      <div className="flex items-center justify-between py-3.5 gap-3">
        <div>
          <p className="text-lg font-semibold text-foreground tracking-tight">{plan.patient_name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
            {plan.service_name} · Session {Math.min(plan.current_session, plan.total_sessions)} of {plan.total_sessions}
          </p>
        </div>
        <StatusBadge status={plan.status} />
      </div>

      <div className="h-px bg-border" />

      {/* Chart marks */}
      <div className="py-5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70 mb-4">
          Treatment progress · {plan.total_sessions}-session {plan.service_name.toLowerCase()}
        </p>
        <div className="relative max-w-md">
          <div
            className="absolute top-[14px] h-px bg-border"
            style={{ left: `${100 / plan.total_sessions / 2}%`, right: `${100 / plan.total_sessions / 2}%` }}
          />
          <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${plan.total_sessions}, 1fr)` }}>
            {plan.sessions.map(session => {
              const done = session.status === "completed";
              const current = session.session_number === plan.current_session && !allDone;
              return (
                <div key={session.id} className="flex flex-col items-center gap-2">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                    Sess. {session.session_number}
                  </p>
                  {done ? (
                    <div className="w-7 h-7 rounded-[3px] bg-primary flex items-center justify-center relative z-10 shrink-0">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  ) : current ? (
                    <div className="w-7 h-7 rounded-[3px] bg-card border-[1.5px] border-primary flex items-center justify-center relative z-10 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-[3px] bg-background border border-border relative z-10 shrink-0" />
                  )}
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    {session.appointment_date ? format(parseISO(session.appointment_date), "MMM d") : "—"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Session history */}
      <div className="pt-5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70 pb-2.5 border-b border-border mb-0">
          Session history
        </p>
        <div className="flex items-center h-8 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70 bg-background border-b border-border">
          <div className="w-7 shrink-0">#</div>
          <div className="w-20 shrink-0">Date</div>
          <div className="flex-1">Treatment</div>
          <div className="w-16 shrink-0">Dur</div>
          <div className="w-24 shrink-0">Status</div>
        </div>
        {plan.sessions.map((session: TreatmentSession) => (
          <div
            key={session.id}
            className="flex items-center h-11 text-[12.5px] border-b border-border hover:bg-muted/20 transition-colors"
          >
            <div className="w-7 shrink-0 font-serif text-lg text-muted-foreground/60 tabular-nums">
              {session.session_number}
            </div>
            <div className="w-20 shrink-0 text-muted-foreground tabular-nums">
              {session.appointment_date ? format(parseISO(session.appointment_date), "dd MMM") : "—"}
            </div>
            <div className="flex-1 text-foreground/75 truncate pr-3">{plan.service_name}</div>
            <div className="w-16 shrink-0 text-muted-foreground text-xs">
              {session.start_time ? "60m" : "—"}
            </div>
            <div className="w-24 shrink-0">
              {session.appointment_date ? (
                <StatusBadge status={session.status} />
              ) : (
                <span className="text-xs text-muted-foreground/60">Not booked</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="pt-5 flex items-start gap-3 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => currentSession && completeMutation.mutate(currentSession.session_number)}
            disabled={!canMark || completeMutation.isPending}
            className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Mark current session complete
          </button>
          {markReason && <p className="text-[11px] text-muted-foreground italic max-w-[260px]">{markReason}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          {scheduling ? (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="h-9 rounded-md border border-border bg-card px-2 text-xs"
              />
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="h-9 rounded-md border border-border bg-card px-2 text-xs"
              />
              <button
                onClick={() => currentSession && date && time && scheduleMutation.mutate(currentSession.session_number)}
                disabled={!date || !time || scheduleMutation.isPending}
                className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-40"
              >
                Confirm
              </button>
              <button
                onClick={() => setScheduling(false)}
                className="h-9 px-3 rounded-md border border-border text-xs text-muted-foreground"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setScheduling(true)}
              disabled={!canSchedule}
              className="px-5 py-2.5 rounded-md border-[1.5px] border-primary/40 text-primary text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              Schedule next session
            </button>
          )}
          {schedReason && !scheduling && (
            <p className="text-[11px] text-muted-foreground italic max-w-[260px]">{schedReason}</p>
          )}
        </div>
      </div>
    </div>
  );
}
