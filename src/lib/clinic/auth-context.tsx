"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getStaffToken, clearStaffTokens } from "./api/client";
import type { StaffUser } from "@/lib/types";

interface ClinicAuthContextType {
  user: StaffUser | null;
  isLoading: boolean;
  setUser: (user: StaffUser | null) => void;
  logout: () => void;
}

const ClinicAuthContext = createContext<ClinicAuthContextType | null>(null);

export function ClinicAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStaffToken();
    if (token) {
      const stored = localStorage.getItem("carebook_staff_user");
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch {}
      }
    }
    setIsLoading(false);
  }, []);

  const handleSetUser = useCallback((u: StaffUser | null) => {
    setUser(u);
    if (u) localStorage.setItem("carebook_staff_user", JSON.stringify(u));
    else localStorage.removeItem("carebook_staff_user");
  }, []);

  const logout = useCallback(() => {
    clearStaffTokens();
    handleSetUser(null);
    window.location.href = "/clinic/login";
  }, [handleSetUser]);

  return (
    <ClinicAuthContext.Provider value={{ user, isLoading, setUser: handleSetUser, logout }}>
      {children}
    </ClinicAuthContext.Provider>
  );
}

export function useClinicAuth() {
  const ctx = useContext(ClinicAuthContext);
  if (!ctx) throw new Error("useClinicAuth must be used within ClinicAuthProvider");
  return ctx;
}
