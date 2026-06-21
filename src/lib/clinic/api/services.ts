import { CLINIC_IS_MOCK, clinicApiRequest } from "./client";
import { getMockServices } from "./mock-data";
import type { Service } from "@/lib/types";

function delay(ms = 600) { return new Promise(r => setTimeout(r, ms)); }

export async function getServicesApi(): Promise<Service[]> {
  if (CLINIC_IS_MOCK) { await delay(); return getMockServices(); }
  return clinicApiRequest<Service[]>("/services");
}

export async function updateServiceApi(id: string, updates: Partial<Service>): Promise<Service> {
  if (CLINIC_IS_MOCK) {
    await delay(400);
    return { ...getMockServices().find(s => s.id === id)!, ...updates };
  }
  return clinicApiRequest<Service>(`/staff/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}
