import { CLINIC_IS_MOCK, clinicApiRequest, setStaffTokens } from "./client";
import { MOCK_STAFF_USER } from "./mock-data";
import type { StaffLoginPayload, StaffAuthTokens } from "@/lib/types";

function delay(ms = 800) { return new Promise(r => setTimeout(r, ms)); }

export async function staffLoginApi(payload: StaffLoginPayload): Promise<StaffAuthTokens> {
  if (CLINIC_IS_MOCK) {
    await delay();
    if (payload.password !== "password123") throw new Error("Invalid credentials");
    const tokens: StaffAuthTokens = {
      access_token: "mock-staff-access-token",
      refresh_token: "mock-staff-refresh-token",
      token_type: "bearer",
      user: MOCK_STAFF_USER,
    };
    setStaffTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  }
  const result = await clinicApiRequest<Omit<StaffAuthTokens, "user">>("/login-staff", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  } as RequestInit & { skipAuth: boolean });
  setStaffTokens(result.access_token, result.refresh_token);

  const user = await clinicApiRequest<StaffAuthTokens["user"]>("/staff/me");
  return { ...result, user };
}
