import type { Patient, Appointment, AppointmentType, AuthTokens } from "@/lib/types";

export const MOCK_PATIENT: Patient = {
  id: "p-001",
  email: "jane.smith@example.com",
  full_name: "Jane Smith",
  phone: "+1 (555) 012-3456",
  created_at: "2024-09-15T10:00:00Z",
};

export const MOCK_APPOINTMENT_TYPES: AppointmentType[] = [
  { id: "at-1", name: "General Check-up", duration_minutes: 30, description: "Routine health check" },
  { id: "at-2", name: "Dental Cleaning", duration_minutes: 45, description: "Professional dental cleaning" },
  { id: "at-3", name: "Consultation", duration_minutes: 20, description: "Initial consultation with a doctor" },
  { id: "at-4", name: "Follow-up", duration_minutes: 15, description: "Follow-up on previous visit" },
  { id: "at-5", name: "X-Ray & Imaging", duration_minutes: 30, description: "Diagnostic imaging" },
  { id: "at-6", name: "Emergency Care", duration_minutes: 60, description: "Urgent medical attention" },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "appt-1",
    patient_id: "p-001",
    full_name: "Jane Smith",
    appointment_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    appointment_time: "10:00",
    appointment_type_id: "at-1",
    appointment_type: MOCK_APPOINTMENT_TYPES[0],
    doctor_name: "Dr. Sarah Chen",
    status: "confirmed",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "appt-2",
    patient_id: "p-001",
    full_name: "Jane Smith",
    appointment_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    appointment_time: "14:30",
    appointment_type_id: "at-2",
    appointment_type: MOCK_APPOINTMENT_TYPES[1],
    doctor_name: "Dr. Marcus Webb",
    status: "upcoming",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "appt-3",
    patient_id: "p-001",
    full_name: "Jane Smith",
    appointment_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    appointment_time: "09:00",
    appointment_type_id: "at-3",
    appointment_type: MOCK_APPOINTMENT_TYPES[2],
    doctor_name: "Dr. Priya Patel",
    status: "completed",
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "appt-4",
    patient_id: "p-001",
    full_name: "Jane Smith",
    appointment_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    appointment_time: "11:00",
    appointment_type_id: "at-4",
    appointment_type: MOCK_APPOINTMENT_TYPES[3],
    doctor_name: "Dr. Sarah Chen",
    status: "cancelled",
    created_at: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_AUTH_TOKENS: AuthTokens = {
  access_token: "mock_access_token_eyJhbGciOiJIUzI1NiJ9.mock",
  refresh_token: "mock_refresh_token_eyJhbGciOiJIUzI1NiJ9.mock",
  token_type: "bearer",
};

let mockAppointments = [...MOCK_APPOINTMENTS];

export function getMockAppointments() {
  return [...mockAppointments];
}

let idCounter = 10;
export function addMockAppointment(appt: Omit<Appointment, "id" | "created_at" | "status">) {
  const newAppt: Appointment = {
    ...appt,
    id: `appt-${++idCounter}`,
    status: "confirmed",
    appointment_type: MOCK_APPOINTMENT_TYPES.find((t) => t.id === appt.appointment_type_id),
    created_at: new Date().toISOString(),
  };
  mockAppointments = [newAppt, ...mockAppointments];
  return newAppt;
}

export function cancelMockAppointment(id: string) {
  mockAppointments = mockAppointments.map((a) =>
    a.id === id ? { ...a, status: "cancelled" as const } : a
  );
}

export function rescheduleMockAppointment(
  id: string,
  date: string,
  time: string
) {
  mockAppointments = mockAppointments.map((a) =>
    a.id === id ? { ...a, appointment_date: date, appointment_time: time } : a
  );
  return mockAppointments.find((a) => a.id === id)!;
}
