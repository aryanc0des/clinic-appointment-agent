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

export async function getAppointmentTypesApi(): Promise<AppointmentType[]> {
  if (IS_MOCK) {
    await delay(400);
    return MOCK_APPOINTMENT_TYPES;
  }
  return apiRequest<AppointmentType[]>("/appointments/types");
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
  return apiRequest<Appointment>("/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function cancelAppointmentApi(id: string): Promise<void> {
  if (IS_MOCK) {
    await delay();
    cancelMockAppointment(id);
    return;
  }
  return apiRequest<void>(`/appointments/${id}/cancel`, { method: "POST" });
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
