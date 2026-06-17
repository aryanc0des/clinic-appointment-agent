export interface Patient {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  duration_minutes: number;
  description?: string;
}

export type AppointmentStatus =
  | "upcoming"
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: string;
  patient_id: string;
  full_name: string;
  appointment_date: string;   // ISO date string YYYY-MM-DD
  appointment_time: string;   // HH:MM 24h
  appointment_type_id: string;
  appointment_type?: AppointmentType;
  doctor_name?: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
}

export interface CreateAppointmentPayload {
  full_name: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type_id: string;
}

export interface ReschedulePayload {
  appointment_date: string;
  appointment_time: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface ApiError {
  detail: string;
  status?: number;
}
