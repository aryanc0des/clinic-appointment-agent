import type { ReactNode } from "react";
import { ClinicAuthProvider } from "@/lib/clinic/auth-context";

export default function ClinicRootLayout({ children }: { children: ReactNode }) {
  return <ClinicAuthProvider>{children}</ClinicAuthProvider>;
}
