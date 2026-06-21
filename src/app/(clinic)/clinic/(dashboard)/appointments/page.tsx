"use client";
import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStaffAppointmentsApi, updateAppointmentStatusApi } from "@/lib/clinic/api/appointments";
import { DataTable } from "@/components/clinic/data-table";
import { StatusBadge, ChannelBadge } from "@/components/clinic/status-badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import type { StaffAppointment, StaffAppointmentStatus } from "@/lib/types";

export default function AppointmentsPage() {
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

  const columns: ColumnDef<StaffAppointment>[] = [
    {
      accessorKey: "patient_name",
      header: "Patient",
      cell: ({ row }) => <span className="font-medium">{row.original.patient_name}</span>,
    },
    { accessorKey: "service_name", header: "Service" },
    {
      accessorKey: "appointment_date",
      header: "Date",
      cell: ({ row }) => format(parseISO(row.original.appointment_date), "dd MMM yyyy"),
    },
    { accessorKey: "start_time", header: "Time" },
    {
      accessorKey: "doctor_name",
      header: "Doctor",
      cell: ({ row }) =>
        row.original.doctor_name ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "booking_channel",
      header: "Channel",
      cell: ({ row }) => <ChannelBadge channel={row.original.booking_channel} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const apt = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-sm">
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  setSelected(apt);
                }}
              >
                View Detail
              </DropdownMenuItem>
              {apt.status === "scheduled" && (
                <>
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation();
                      handleStatus(apt.id, "completed");
                    }}
                  >
                    Mark Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation();
                      handleStatus(apt.id, "missed");
                    }}
                  >
                    Mark Missed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation();
                      handleStatus(apt.id, "cancelled");
                    }}
                    className="text-destructive"
                  >
                    Cancel
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-tight">Appointments</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          All appointments — click a row to view details
        </p>
      </div>
      <DataTable
        columns={columns}
        data={appointments}
        isLoading={isLoading}
        searchPlaceholder="Search patient or service…"
        onRowClick={setSelected}
      />

      <Sheet open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="text-base">Appointment Detail</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4 text-sm">
              <div className="space-y-2">
                <Row label="Patient" value={selected.patient_name} />
                <Row label="Service" value={selected.service_name} />
                <Row
                  label="Date"
                  value={format(parseISO(selected.appointment_date), "EEEE, MMMM d, yyyy")}
                />
                <Row label="Time" value={`${selected.start_time} – ${selected.end_time}`} />
                <Row label="Doctor" value={selected.doctor_name ?? "Not assigned"} />
                <Row label="Channel" value={<ChannelBadge channel={selected.booking_channel} />} />
                <Row label="Status" value={<StatusBadge status={selected.status} />} />
                {selected.session_number && (
                  <Row label="Session" value={`Session ${selected.session_number}`} />
                )}
              </div>
              {selected.status === "scheduled" && (
                <div className="pt-2 space-y-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Actions
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleStatus(selected.id, "completed")}
                    >
                      Mark Completed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleStatus(selected.id, "missed")}
                    >
                      Mark Missed
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs"
                      onClick={() => handleStatus(selected.id, "cancelled")}
                    >
                      Cancel
                    </Button>
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

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
