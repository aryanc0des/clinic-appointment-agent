import { CLINIC_IS_MOCK, clinicApiRequest } from "./client";
import { getMockPatients } from "./mock-data";
import type { StaffPatient } from "@/lib/types";

function delay(ms = 600) { return new Promise(r => setTimeout(r, ms)); }

export async function getStaffPatientsApi(): Promise<StaffPatient[]> {
  if (CLINIC_IS_MOCK) { await delay(); return getMockPatients(); }
  return clinicApiRequest<StaffPatient[]>("/staff/patients");
}
