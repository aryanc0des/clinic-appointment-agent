"use client";
import { useQuery } from "@tanstack/react-query";
import { getStaffPatientsApi } from "@/lib/clinic/api/patients";
import { DataTable } from "@/components/clinic/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import type { StaffPatient } from "@/lib/types";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function PatientsPage() {
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["staff-patients"],
    queryFn: getStaffPatientsApi,
  });
  const router = useRouter();

  const columns: ColumnDef<StaffPatient>[] = [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({ row }) => <span className="font-medium">{row.original.full_name}</span>,
    },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) =>
        row.original.phone ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "created_at",
      header: "Registered",
      cell: ({ row }) => format(parseISO(row.original.created_at), "dd MMM yyyy"),
    },
    {
      accessorKey: "total_appointments",
      header: "Appointments",
      cell: ({ row }) => (
        <Badge variant="muted" className="text-xs">
          {row.original.total_appointments}
        </Badge>
      ),
    },
    {
      accessorKey: "active_treatment_plans",
      header: "Active Plans",
      cell: ({ row }) =>
        row.original.active_treatment_plans > 0 ? (
          <Badge className="text-xs bg-warning-subtle text-warning border border-warning/20">
            {row.original.active_treatment_plans}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-tight">Patients</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Patient directory — click a row to view full history
        </p>
      </div>
      <DataTable
        columns={columns}
        data={patients}
        isLoading={isLoading}
        searchPlaceholder="Search patient…"
        onRowClick={row => router.push(`/clinic/patients/${row.id}`)}
      />
    </div>
  );
}
