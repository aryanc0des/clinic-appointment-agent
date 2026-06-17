"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Calendar, CalendarPlus } from "lucide-react";
import { format, isBefore, startOfDay, parseISO } from "date-fns";

import {
  getAppointmentsApi,
  cancelAppointmentApi,
  rescheduleAppointmentApi,
} from "@/lib/api/appointments";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/lib/types";

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "10:30",
  "11:00", "11:30", "13:00", "14:00",
  "14:30", "15:00", "15:30", "16:00",
];

function AppointmentsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 rounded-lg" />
      ))}
    </div>
  );
}

export default function AppointmentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [newTime, setNewTime] = useState<string>("");
  const [dateOpen, setDateOpen] = useState(false);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointmentsApi,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAppointmentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setCancelTarget(null);
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, date, time }: { id: string; date: string; time: string }) =>
      rescheduleAppointmentApi(id, { appointment_date: date, appointment_time: time }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setRescheduleTarget(null);
      setNewDate(undefined);
      setNewTime("");
    },
  });

  const upcoming = appointments.filter(
    (a) => !["completed", "cancelled"].includes(a.status)
  );
  const past = appointments.filter((a) =>
    ["completed", "cancelled"].includes(a.status)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My appointments</h1>
          <p className="text-muted-foreground mt-0.5">
            {appointments.length} total appointment{appointments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => router.push("/book")}>
          <CalendarPlus className="h-4 w-4" />
          Book new
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming
            {upcoming.length > 0 && (
              <span className="ml-1.5 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">
                {upcoming.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {isLoading ? (
            <AppointmentsSkeleton />
          ) : upcoming.length === 0 ? (
            <EmptyState
              title="No upcoming appointments"
              description="You don't have any scheduled visits. Book one to get started."
              action={<Button onClick={() => router.push("/book")}>Book an appointment</Button>}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onCancel={(id) => setCancelTarget(id)}
                  onReschedule={(a) => {
                    setRescheduleTarget(a);
                    setNewDate(undefined);
                    setNewTime("");
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {isLoading ? (
            <AppointmentsSkeleton />
          ) : past.length === 0 ? (
            <EmptyState
              title="No past appointments"
              description="Your appointment history will appear here."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {past.map((appt) => (
                <AppointmentCard key={appt.id} appointment={appt} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel appointment?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your appointment slot will be released.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              loading={cancelMutation.isPending}
              onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget)}
            >
              Cancel appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule dialog */}
      <Dialog open={!!rescheduleTarget} onOpenChange={(o) => !o && setRescheduleTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule appointment</DialogTitle>
            <DialogDescription>
              Choose a new date and time for your{" "}
              <strong>{rescheduleTarget?.appointment_type?.name ?? "appointment"}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 my-2">
            {/* Date picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">New date</label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex h-10 w-full items-center justify-start rounded-md border bg-surface px-3 text-sm",
                      "border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20",
                      !newDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {newDate ? format(newDate, "EEEE, MMMM d, yyyy") : "Select a date…"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={newDate}
                    onSelect={(d) => { setNewDate(d); setDateOpen(false); }}
                    disabled={(d) => isBefore(d, startOfDay(new Date()))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time slots */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">New time</label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const [h, m] = slot.split(":").map(Number);
                  const p = h >= 12 ? "PM" : "AM";
                  const label = `${h % 12 || 12}:${String(m).padStart(2, "0")} ${p}`;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setNewTime(slot)}
                      className={cn(
                        "h-9 rounded-md text-xs font-medium border transition-all",
                        newTime === slot
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-surface border-border hover:border-primary/40 hover:bg-primary-subtle hover:text-primary"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={!newDate || !newTime}
              loading={rescheduleMutation.isPending}
              onClick={() => {
                if (rescheduleTarget && newDate && newTime) {
                  rescheduleMutation.mutate({
                    id: rescheduleTarget.id,
                    date: format(newDate, "yyyy-MM-dd"),
                    time: newTime,
                  });
                }
              }}
            >
              Confirm reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 py-14 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle mb-4">
        <Calendar className="h-6 w-6 text-primary" />
      </div>
      <p className="text-base font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1 mb-5">{description}</p>
      {action}
    </div>
  );
}
