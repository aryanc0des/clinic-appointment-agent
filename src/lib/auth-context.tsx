"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Patient } from "@/lib/types";
import { getMeApi } from "@/lib/api/auth";
import { getToken, clearTokens } from "@/lib/api/client";

interface AuthContextValue {
  patient: Patient | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setPatient: (p: Patient | null) => void;
  logout: () => void;
  refetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setPatient(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await getMeApi();
      setPatient(me);
    } catch {
      clearTokens();
      setPatient(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchMe();
  }, [refetchMe]);

  const logout = useCallback(() => {
    clearTokens();
    setPatient(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        patient,
        isLoading,
        isAuthenticated: !!patient,
        setPatient,
        logout,
        refetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthContextProvider");
  return ctx;
}
