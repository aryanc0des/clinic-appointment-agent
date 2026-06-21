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
  | "scheduled"
  | "completed"
  | "cancelled"
  | "missed";

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

// ─── Clinic / Staff types ─────────────────────────────────────────────────

export type StaffAppointmentStatus = "scheduled" | "completed" | "cancelled" | "missed";
export type BookingChannel = "manual" | "voice";
export type TreatmentPlanStatus = "in_progress" | "completed" | "cancelled";

export interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  is_multi_session: boolean;
  session_count: number;
}

export interface StaffAppointment {
  id: string;
  patient_id: string;
  patient_name: string;
  service_id: string;
  service_name: string;
  doctor_id?: string;
  doctor_name?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: StaffAppointmentStatus;
  booking_channel: BookingChannel;
  treatment_plan_id?: string;
  session_number?: number;
  created_at: string;
}

export interface TreatmentSession {
  id: string;
  treatment_plan_id: string;
  session_number: number;
  appointment_date?: string;
  start_time?: string;
  status: StaffAppointmentStatus;
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  patient_name: string;
  service_id: string;
  service_name: string;
  doctor_id?: string;
  doctor_name?: string;
  total_sessions: number;
  current_session: number;
  status: TreatmentPlanStatus;
  sessions: TreatmentSession[];
  created_at: string;
}

export interface StaffPatient {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  total_appointments: number;
  active_treatment_plans: number;
}

export interface StaffUser {
  id: string;
  full_name: string;
  email: string;
  role: "staff";
}

export interface StaffLoginPayload {
  email: string;
  password: string;
}

export interface StaffAuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: StaffUser;
}
