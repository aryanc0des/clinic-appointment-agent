import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "upcoming":
    case "confirmed":
      return "success";
    case "cancelled":
      return "destructive";
    case "completed":
      return "muted";
    case "pending":
      return "warning";
    default:
      return "muted";
  }
}
