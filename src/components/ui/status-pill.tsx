import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  upcoming: { dot: "#B8943F", text: "#B8943F", bg: "rgba(184,148,63,0.1)", border: "rgba(184,148,63,0.22)" },
  confirmed: { dot: "#B8943F", text: "#B8943F", bg: "rgba(184,148,63,0.1)", border: "rgba(184,148,63,0.22)" },
  pending: { dot: "#B8943F", text: "#B8943F", bg: "rgba(184,148,63,0.1)", border: "rgba(184,148,63,0.22)" },
  scheduled: { dot: "#B8943F", text: "#B8943F", bg: "rgba(184,148,63,0.1)", border: "rgba(184,148,63,0.22)" },
  completed: { dot: "#6B9E6F", text: "#6B9E6F", bg: "rgba(107,158,111,0.1)", border: "rgba(107,158,111,0.22)" },
  cancelled: { dot: "#C0392B", text: "#C0392B", bg: "rgba(192,57,43,0.1)", border: "rgba(192,57,43,0.22)" },
  missed: { dot: "#C0392B", text: "#C0392B", bg: "rgba(192,57,43,0.1)", border: "rgba(192,57,43,0.22)" },
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: "Upcoming",
  confirmed: "Confirmed",
  pending: "Pending",
  scheduled: "Upcoming",
  completed: "Done",
  cancelled: "Cancelled",
  missed: "Missed",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  const label = STATUS_LABELS[status] ?? status;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 border",
        className
      )}
      style={{ background: style.bg, borderColor: style.border }}
    >
      <div className="h-1.25 w-1.25 rounded-full shrink-0" style={{ background: style.dot, width: 5, height: 5 }} />
      <span className="text-xs font-medium" style={{ color: style.text }}>
        {label}
      </span>
    </div>
  );
}
