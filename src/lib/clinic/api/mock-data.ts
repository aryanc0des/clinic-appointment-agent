import type { StaffAppointment, TreatmentPlan, StaffPatient, Service, StaffUser } from "@/lib/types";

export const MOCK_STAFF_USER: StaffUser = {
  id: "staff-1",
  full_name: "Dr. Priya Sharma",
  email: "priya@carebook.in",
  role: "staff",
};

export const MOCK_SERVICES: Service[] = [
  { id: "svc-1", name: "Consultation / Check-up", price: 300, duration_minutes: 30, is_multi_session: false, session_count: 1 },
  { id: "svc-2", name: "Teeth Cleaning", price: 1500, duration_minutes: 45, is_multi_session: false, session_count: 1 },
  { id: "svc-3", name: "Teeth Whitening", price: 8000, duration_minutes: 60, is_multi_session: false, session_count: 1 },
  { id: "svc-4", name: "Tooth Filling", price: 1200, duration_minutes: 45, is_multi_session: false, session_count: 1 },
  { id: "svc-5", name: "Tooth Extraction", price: 1500, duration_minutes: 45, is_multi_session: false, session_count: 1 },
  { id: "svc-6", name: "Dental Crown / Cap", price: 5000, duration_minutes: 60, is_multi_session: false, session_count: 1 },
  { id: "svc-7", name: "Root Canal", price: 6000, duration_minutes: 60, is_multi_session: true, session_count: 4 },
];

export const MOCK_PATIENTS: StaffPatient[] = [
  { id: "p-1", full_name: "Arjun Mehta", email: "arjun@example.com", phone: "9876543210", created_at: "2025-12-01T10:00:00Z", total_appointments: 5, active_treatment_plans: 1 },
  { id: "p-2", full_name: "Sneha Patel", email: "sneha@example.com", phone: "9123456789", created_at: "2026-01-15T09:00:00Z", total_appointments: 3, active_treatment_plans: 0 },
  { id: "p-3", full_name: "Rahul Verma", email: "rahul@example.com", phone: "9988776655", created_at: "2026-02-10T11:00:00Z", total_appointments: 7, active_treatment_plans: 1 },
  { id: "p-4", full_name: "Kavita Iyer", email: "kavita@example.com", phone: "9871234560", created_at: "2026-03-05T14:00:00Z", total_appointments: 2, active_treatment_plans: 0 },
  { id: "p-5", full_name: "Rohan Singh", email: "rohan@example.com", phone: "9765432100", created_at: "2026-04-20T10:30:00Z", total_appointments: 4, active_treatment_plans: 0 },
];

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
const in2days = new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0];
const in3days = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];

export const MOCK_APPOINTMENTS: StaffAppointment[] = [
  { id: "apt-1", patient_id: "p-1", patient_name: "Arjun Mehta", service_id: "svc-7", service_name: "Root Canal", appointment_date: today, start_time: "10:00", end_time: "11:00", status: "scheduled", booking_channel: "manual", treatment_plan_id: "tp-1", session_number: 3, created_at: "2026-06-01T08:00:00Z" },
  { id: "apt-2", patient_id: "p-2", patient_name: "Sneha Patel", service_id: "svc-1", service_name: "Consultation / Check-up", appointment_date: today, start_time: "11:00", end_time: "11:30", status: "scheduled", booking_channel: "voice", created_at: "2026-06-10T09:00:00Z" },
  { id: "apt-3", patient_id: "p-3", patient_name: "Rahul Verma", service_id: "svc-2", service_name: "Teeth Cleaning", appointment_date: today, start_time: "12:00", end_time: "12:45", status: "completed", booking_channel: "manual", created_at: "2026-06-05T10:00:00Z" },
  { id: "apt-4", patient_id: "p-4", patient_name: "Kavita Iyer", service_id: "svc-4", service_name: "Tooth Filling", appointment_date: today, start_time: "14:00", end_time: "14:45", status: "missed", booking_channel: "manual", created_at: "2026-06-08T11:00:00Z" },
  { id: "apt-5", patient_id: "p-5", patient_name: "Rohan Singh", service_id: "svc-6", service_name: "Dental Crown / Cap", appointment_date: tomorrow, start_time: "10:30", end_time: "11:30", status: "scheduled", booking_channel: "manual", created_at: "2026-06-12T13:00:00Z" },
  { id: "apt-6", patient_id: "p-1", patient_name: "Arjun Mehta", service_id: "svc-1", service_name: "Consultation / Check-up", appointment_date: yesterday, start_time: "15:00", end_time: "15:30", status: "completed", booking_channel: "manual", created_at: "2026-05-20T09:00:00Z" },
  { id: "apt-7", patient_id: "p-2", patient_name: "Sneha Patel", service_id: "svc-3", service_name: "Teeth Whitening", appointment_date: in2days, start_time: "11:00", end_time: "12:00", status: "scheduled", booking_channel: "voice", created_at: "2026-06-14T10:00:00Z" },
  { id: "apt-8", patient_id: "p-3", patient_name: "Rahul Verma", service_id: "svc-7", service_name: "Root Canal", appointment_date: in3days, start_time: "16:00", end_time: "17:00", status: "scheduled", booking_channel: "manual", treatment_plan_id: "tp-2", session_number: 2, created_at: "2026-06-10T09:00:00Z" },
  { id: "apt-9", patient_id: "p-4", patient_name: "Kavita Iyer", service_id: "svc-5", service_name: "Tooth Extraction", appointment_date: yesterday, start_time: "10:00", end_time: "10:45", status: "cancelled", booking_channel: "manual", created_at: "2026-06-01T08:00:00Z" },
  { id: "apt-10", patient_id: "p-5", patient_name: "Rohan Singh", service_id: "svc-2", service_name: "Teeth Cleaning", appointment_date: in2days, start_time: "13:00", end_time: "13:45", status: "scheduled", booking_channel: "manual", created_at: "2026-06-15T11:00:00Z" },
];

export const MOCK_TREATMENT_PLANS: TreatmentPlan[] = [
  {
    id: "tp-1",
    patient_id: "p-1",
    patient_name: "Arjun Mehta",
    service_id: "svc-7",
    service_name: "Root Canal",
    total_sessions: 4,
    current_session: 3,
    status: "in_progress",
    created_at: "2026-04-01T09:00:00Z",
    sessions: [
      { id: "s-1", treatment_plan_id: "tp-1", session_number: 1, appointment_date: "2026-04-15", start_time: "10:00", status: "completed" },
      { id: "s-2", treatment_plan_id: "tp-1", session_number: 2, appointment_date: "2026-05-01", start_time: "10:00", status: "completed" },
      { id: "s-3", treatment_plan_id: "tp-1", session_number: 3, appointment_date: today, start_time: "10:00", status: "scheduled" },
      { id: "s-4", treatment_plan_id: "tp-1", session_number: 4, status: "scheduled" },
    ],
  },
  {
    id: "tp-2",
    patient_id: "p-3",
    patient_name: "Rahul Verma",
    service_id: "svc-7",
    service_name: "Root Canal",
    total_sessions: 4,
    current_session: 2,
    status: "in_progress",
    created_at: "2026-05-20T09:00:00Z",
    sessions: [
      { id: "s-5", treatment_plan_id: "tp-2", session_number: 1, appointment_date: "2026-06-01", start_time: "14:00", status: "completed" },
      { id: "s-6", treatment_plan_id: "tp-2", session_number: 2, appointment_date: in3days, start_time: "16:00", status: "scheduled" },
      { id: "s-7", treatment_plan_id: "tp-2", session_number: 3, status: "scheduled" },
      { id: "s-8", treatment_plan_id: "tp-2", session_number: 4, status: "scheduled" },
    ],
  },
  {
    id: "tp-3",
    patient_id: "p-2",
    patient_name: "Sneha Patel",
    service_id: "svc-7",
    service_name: "Root Canal",
    total_sessions: 4,
    current_session: 4,
    status: "completed",
    created_at: "2026-01-10T09:00:00Z",
    sessions: [
      { id: "s-9", treatment_plan_id: "tp-3", session_number: 1, appointment_date: "2026-01-15", start_time: "11:00", status: "completed" },
      { id: "s-10", treatment_plan_id: "tp-3", session_number: 2, appointment_date: "2026-02-01", start_time: "11:00", status: "completed" },
      { id: "s-11", treatment_plan_id: "tp-3", session_number: 3, appointment_date: "2026-02-20", start_time: "11:00", status: "completed" },
      { id: "s-12", treatment_plan_id: "tp-3", session_number: 4, appointment_date: "2026-03-10", start_time: "11:00", status: "completed" },
    ],
  },
];

// Mutable copies for mock state changes
let mockAppointments = [...MOCK_APPOINTMENTS];
let mockTreatmentPlans = [...MOCK_TREATMENT_PLANS];

export function getMockAppointments() { return [...mockAppointments]; }
export function getMockTreatmentPlans() { return [...mockTreatmentPlans]; }
export function getMockPatients() { return [...MOCK_PATIENTS]; }
export function getMockServices() { return [...MOCK_SERVICES]; }

export function updateMockAppointmentStatus(id: string, status: StaffAppointment["status"]) {
  mockAppointments = mockAppointments.map(a => a.id === id ? { ...a, status } : a);
  return mockAppointments.find(a => a.id === id)!;
}

export function updateMockService(id: string, updates: Partial<Service>) {
  const services = [...MOCK_SERVICES];
  const idx = services.findIndex(s => s.id === id);
  if (idx !== -1) services[idx] = { ...services[idx], ...updates };
  return services[idx];
}
