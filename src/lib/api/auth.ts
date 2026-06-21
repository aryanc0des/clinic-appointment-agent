import { apiRequest, IS_MOCK, setTokens } from "./client";
import type { AuthTokens, Patient, LoginPayload, RegisterPayload } from "@/lib/types";
import { MOCK_AUTH_TOKENS, MOCK_PATIENT } from "./mock-data";

function delay(ms = 800) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function loginApi(payload: LoginPayload): Promise<AuthTokens> {
  if (IS_MOCK) {
    await delay();
    if (payload.password.length < 6) throw new Error("Invalid email or password.");
    setTokens(MOCK_AUTH_TOKENS.access_token, MOCK_AUTH_TOKENS.refresh_token);
    return MOCK_AUTH_TOKENS;
  }
  const data = await apiRequest<{ access_token: string; refresh_token: string; token_type: string }>(
    "/login-user",
    {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    }
  );
  setTokens(data.access_token, data.refresh_token);
  return data;
}

export async function registerApi(payload: RegisterPayload): Promise<AuthTokens> {
  if (IS_MOCK) {
    await delay();
    setTokens(MOCK_AUTH_TOKENS.access_token, MOCK_AUTH_TOKENS.refresh_token);
    return MOCK_AUTH_TOKENS;
  }
  // Registration doesn't issue tokens — log in right after with the same credentials.
  await apiRequest("/register-user", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  return loginApi({ email: payload.email, password: payload.password });
}

export async function getMeApi(): Promise<Patient> {
  if (IS_MOCK) {
    await delay(300);
    return MOCK_PATIENT;
  }
  return apiRequest<Patient>("/me");
}

export async function updateProfileApi(
  payload: Partial<Pick<Patient, "full_name" | "phone">>
): Promise<Patient> {
  if (IS_MOCK) {
    await delay();
    return { ...MOCK_PATIENT, ...payload };
  }
  return apiRequest<Patient>("/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
