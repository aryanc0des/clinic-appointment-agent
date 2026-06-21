"use client";
import { useQuery } from "@tanstack/react-query";
import { getStaffPatientsApi } from "@/lib/clinic/api/patients";
import { getStaffAppointmentsApi } from "@/lib/clinic/api/appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/clinic/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { use } from "react";

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: patients = [], isLoading: pLoading } = useQuery({
    queryKey: ["staff-patients"],
    queryFn: getStaffPatientsApi,
  });
  const { data: appointments = [], isLoading: aLoading } = useQuery({
    queryKey: ["staff-appointments"],
    queryFn: getStaffAppointmentsApi,
  });

  const patient = patients.find(p => p.id === id);
  const patientApts = appointments
    .filter(a => a.patient_id === id)
    .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));

  if (pLoading || aLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (!patient) return <p className="text-sm text-muted-foreground">Patient not found.</p>;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link
          href="/clinic/patients"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Patients
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs">{patient.full_name}</span>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{patient.full_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Email:</span> {patient.email}
          </p>
          {patient.phone && (
            <p>
              <span className="text-muted-foreground">Phone:</span> {patient.phone}
            </p>
          )}
          <p>
            <span className="text-muted-foreground">Registered:</span>{" "}
            {format(parseISO(patient.created_at), "dd MMM yyyy")}
          </p>
          <p>
            <span className="text-muted-foreground">Total appointments:</span>{" "}
            {patient.total_appointments}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Appointment History</h2>
        {patientApts.length === 0 ? (
          <p className="text-xs text-muted-foreground">No appointments found.</p>
        ) : (
          <div className="rounded-md border border-border divide-y divide-border">
            {patientApts.map(apt => (
              <div key={apt.id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium">{apt.service_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(apt.appointment_date), "dd MMM yyyy")} at {apt.start_time}
                  </p>
                </div>
                <StatusBadge status={apt.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
