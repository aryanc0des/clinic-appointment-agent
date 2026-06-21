import { apiRequest, IS_MOCK } from "./client";
import type {
  Appointment,
  AppointmentType,
  CreateAppointmentPayload,
  ReschedulePayload,
} from "@/lib/types";
import {
  getMockAppointments,
  addMockAppointment,
  cancelMockAppointment,
  rescheduleMockAppointment,
  MOCK_APPOINTMENT_TYPES,
  MOCK_PATIENT,
} from "./mock-data";

function delay(ms = 700) {
  return new Promise((r) => setTimeout(r, ms));
}

interface BackendService {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  is_multi_session: boolean;
  session_count: number;
}

export async function getAppointmentTypesApi(): Promise<AppointmentType[]> {
  if (IS_MOCK) {
    await delay(400);
    return MOCK_APPOINTMENT_TYPES;
  }
  const services = await apiRequest<BackendService[]>("/services");
  return services.map((s) => ({
    id: s.id,
    name: s.name,
    duration_minutes: s.duration_minutes,
  }));
}

export async function getAppointmentsApi(): Promise<Appointment[]> {
  if (IS_MOCK) {
    await delay();
    return getMockAppointments();
  }
  return apiRequest<Appointment[]>("/appointments");
}

export async function createAppointmentApi(
  payload: CreateAppointmentPayload
): Promise<Appointment> {
  if (IS_MOCK) {
    await delay(900);
    return addMockAppointment({ ...payload, patient_id: MOCK_PATIENT.id });
  }
  return apiRequest<Appointment>("/book-appointment", {
    method: "POST",
    body: JSON.stringify({
      patient_name: payload.full_name,
      service_id: payload.appointment_type_id,
      appointment_date: payload.appointment_date,
      start_time: payload.appointment_time,
    }),
  });
}

export async function cancelAppointmentApi(id: string): Promise<void> {
  if (IS_MOCK) {
    await delay();
    cancelMockAppointment(id);
    return;
  }
  await apiRequest<Appointment>(`/cancel-appointment/${id}`, { method: "PATCH" });
}

export async function rescheduleAppointmentApi(
  id: string,
  payload: ReschedulePayload
): Promise<Appointment> {
  if (IS_MOCK) {
    await delay();
    return rescheduleMockAppointment(id, payload.appointment_date, payload.appointment_time);
  }
  return apiRequest<Appointment>(`/appointments/${id}/reschedule`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
