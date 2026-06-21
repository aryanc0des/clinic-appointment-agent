import type { StaffAppointmentStatus, TreatmentPlanStatus } from "@/lib/types";

type AnyStatus = StaffAppointmentStatus | TreatmentPlanStatus;

const STATUS_STYLES: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
  scheduled: { label: "Scheduled", dot: "#B8943F", text: "#B8943F", bg: "rgba(184,148,63,0.1)", border: "rgba(184,148,63,0.22)" },
  in_progress: { label: "In Progress", dot: "#B8943F", text: "#B8943F", bg: "rgba(184,148,63,0.1)", border: "rgba(184,148,63,0.22)" },
  completed: { label: "Completed", dot: "#6B9E6F", text: "#6B9E6F", bg: "rgba(107,158,111,0.1)", border: "rgba(107,158,111,0.22)" },
  cancelled: { label: "Cancelled", dot: "#9A958A", text: "#7D7868", bg: "rgba(154,149,138,0.12)", border: "rgba(154,149,138,0.25)" },
  missed: { label: "Missed", dot: "#C0392B", text: "#C0392B", bg: "rgba(192,57,43,0.1)", border: "rgba(192,57,43,0.22)" },
};

export function StatusBadge({ status }: { status: AnyStatus }) {
  const style = STATUS_STYLES[status] ?? { label: status, dot: "#9A958A", text: "#7D7868", bg: "rgba(154,149,138,0.12)", border: "rgba(154,149,138,0.25)" };
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5"
      style={{ background: style.bg }}
    >
      <div className="rounded-full shrink-0" style={{ background: style.dot, width: 5, height: 5 }} />
      <span className="text-[11px] font-medium" style={{ color: style.text }}>
        {style.label}
      </span>
    </div>
  );
}

export function ChannelBadge({ channel }: { channel: "manual" | "voice" }) {
  return (
    <span
      className={
        channel === "voice"
          ? "inline-flex items-center rounded-[4px] px-2 py-0.5 text-[11px] font-medium bg-accent-subtle text-accent"
          : "inline-flex items-center rounded-[4px] px-2 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground"
      }
    >
      {channel === "voice" ? "Voice" : "Manual"}
    </span>
  );
}
