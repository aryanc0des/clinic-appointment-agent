import { CLINIC_IS_MOCK, clinicApiRequest } from "./client";
import { getMockTreatmentPlans } from "./mock-data";
import type { TreatmentPlan } from "@/lib/types";

function delay(ms = 600) { return new Promise(r => setTimeout(r, ms)); }

export async function getTreatmentPlansApi(): Promise<TreatmentPlan[]> {
  if (CLINIC_IS_MOCK) { await delay(); return getMockTreatmentPlans(); }
  return clinicApiRequest<TreatmentPlan[]>("/staff/treatment-plans");
}

export async function getTreatmentPlanApi(id: string): Promise<TreatmentPlan> {
  if (CLINIC_IS_MOCK) {
    await delay(400);
    const plans = getMockTreatmentPlans();
    return plans.find(p => p.id === id)!;
  }
  return clinicApiRequest<TreatmentPlan>(`/staff/treatment-plans/${id}`);
}

export async function markSessionCompleteApi(planId: string, sessionNumber: number): Promise<TreatmentPlan> {
  if (CLINIC_IS_MOCK) { await delay(500); return getMockTreatmentPlans().find(p => p.id === planId)!; }
  return clinicApiRequest<TreatmentPlan>(`/staff/treatment-plans/${planId}/sessions/${sessionNumber}/complete`, { method: "POST" });
}

export async function scheduleSessionApi(
  planId: string,
  sessionNumber: number,
  appointment_date: string,
  start_time: string
): Promise<TreatmentPlan> {
  if (CLINIC_IS_MOCK) { await delay(500); return getMockTreatmentPlans().find(p => p.id === planId)!; }
  return clinicApiRequest<TreatmentPlan>(`/staff/treatment-plans/${planId}/sessions/${sessionNumber}/schedule`, {
    method: "POST",
    body: JSON.stringify({ appointment_date, start_time }),
  });
}
