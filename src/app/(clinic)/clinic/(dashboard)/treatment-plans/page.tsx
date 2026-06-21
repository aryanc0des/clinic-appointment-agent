"use client";
import { useQuery } from "@tanstack/react-query";
import { getTreatmentPlansApi } from "@/lib/clinic/api/treatment-plans";
import { DataTable } from "@/components/clinic/data-table";
import { StatusBadge } from "@/components/clinic/status-badge";
import { type ColumnDef } from "@tanstack/react-table";
import type { TreatmentPlan } from "@/lib/types";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

function SessionProgress({ plan }: { plan: TreatmentPlan }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: plan.total_sessions }).map((_, i) => {
        const session = plan.sessions[i];
        const done = session?.status === "completed";
        const current = i + 1 === plan.current_session && plan.status === "in_progress";
        return (
          <div
            key={i}
            className={`h-2.5 w-2.5 rounded-[2px] ${
              done ? "bg-primary" : current ? "border-[1.5px] border-primary bg-card" : "border border-border bg-background"
            }`}
          />
        );
      })}
      <span className="text-xs text-muted-foreground ml-1.5 tabular-nums">
        {plan.sessions.filter(s => s.status === "completed").length}/{plan.total_sessions}
      </span>
    </div>
  );
}

export default function TreatmentPlansPage() {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["treatment-plans"],
    queryFn: getTreatmentPlansApi,
  });
  const router = useRouter();

  const columns: ColumnDef<TreatmentPlan>[] = [
    {
      accessorKey: "patient_name",
      header: "Patient",
      cell: ({ row }) => <span className="font-medium">{row.original.patient_name}</span>,
    },
    { accessorKey: "service_name", header: "Service" },
    {
      id: "progress",
      header: "Progress",
      cell: ({ row }) => <SessionProgress plan={row.original} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: "Started",
      cell: ({ row }) => format(parseISO(row.original.created_at), "dd MMM yyyy"),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-tight">Treatment Plans</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Root canal and multi-session treatments — click a plan to manage sessions
        </p>
      </div>
      <DataTable
        columns={columns}
        data={plans}
        isLoading={isLoading}
        searchPlaceholder="Search patient…"
        onRowClick={row => router.push(`/clinic/treatment-plans/${row.id}`)}
      />
    </div>
  );
}
