import { CLINIC_IS_MOCK, clinicApiRequest } from "./client";
import { getMockAppointments, updateMockAppointmentStatus } from "./mock-data";
import type { StaffAppointment } from "@/lib/types";

function delay(ms = 600) { return new Promise(r => setTimeout(r, ms)); }

export async function getStaffAppointmentsApi(): Promise<StaffAppointment[]> {
  if (CLINIC_IS_MOCK) { await delay(); return getMockAppointments(); }
  return clinicApiRequest<StaffAppointment[]>("/staff/appointments");
}

export async function updateAppointmentStatusApi(id: string, status: StaffAppointment["status"]): Promise<StaffAppointment> {
  if (CLINIC_IS_MOCK) { await delay(400); return updateMockAppointmentStatus(id, status); }
  return clinicApiRequest<StaffAppointment>(`/staff/appointments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function rescheduleStaffAppointmentApi(id: string, appointment_date: string, start_time: string): Promise<StaffAppointment> {
  if (CLINIC_IS_MOCK) {
    await delay(500);
    const appts = getMockAppointments();
    return appts.find(a => a.id === id) ?? appts[0];
  }
  return clinicApiRequest<StaffAppointment>(`/appointments/${id}/reschedule`, {
    method: "PATCH",
    body: JSON.stringify({ appointment_date, appointment_time: start_time }),
  });
}
