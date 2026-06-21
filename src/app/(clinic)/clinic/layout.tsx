import type { ReactNode } from "react";

// Passthrough — auth guard and sidebar live in (dashboard)/layout.tsx
// Login at /clinic/login does NOT inherit (dashboard)/layout.tsx
export default function ClinicLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
