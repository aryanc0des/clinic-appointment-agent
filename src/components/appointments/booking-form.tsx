"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, CheckCircle2, Clock } from "lucide-react";

import { createAppointmentApi } from "@/lib/api/appointments";
import { getAppointmentTypesApi } from "@/lib/api/appointments";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/lib/types";

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

const schema = z.object({
  full_name: z.string().min(2, "Please enter your full name"),
  appointment_date: z.date({ error: "Please select a date" }),
  appointment_time: z.string().min(1, "Please select a time slot"),
  appointment_type_id: z.string().min(1, "Please select an appointment type"),
});
type FormValues = z.infer<typeof schema>;

function formatSlot(t: string) {
  const [h, m] = t.split(":").map(Number);
  const p = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${p}`;
}

interface BookingFormProps {
  onSuccess?: (appointment: Appointment) => void;
}

export function BookingForm({ onSuccess }: BookingFormProps) {
  const { patient } = useAuth();
  const queryClient = useQueryClient();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const { data: apptTypes, isLoading: typesLoading } = useQuery({
    queryKey: ["appointment-types"],
    queryFn: getAppointmentTypesApi,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: patient?.full_name ?? "" },
  });

  const selectedDate = watch("appointment_date");

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createAppointmentApi({
        full_name: values.full_name,
        appointment_date: format(values.appointment_date, "yyyy-MM-dd"),
        appointment_time: values.appointment_time,
        appointment_type_id: values.appointment_type_id,
      }),
    onSuccess: (appt) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setConfirmedAppointment(appt);
      onSuccess?.(appt);
    },
  });

  if (confirmedAppointment) {
    return <ConfirmationScreen appointment={confirmedAppointment} onBookAnother={() => { setConfirmedAppointment(null); reset({ full_name: patient?.full_name ?? "" }); }} />;
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate className="flex flex-col gap-6">
      {mutation.error && (
        <div role="alert" className="rounded-lg bg-destructive-subtle text-destructive text-sm px-4 py-3">
          {(mutation.error as Error).message}
        </div>
      )}

      {/* Full name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="full_name" required>Full name</Label>
        <Input
          id="full_name"
          placeholder="Jane Smith"
          error={!!errors.full_name}
          {...register("full_name")}
        />
        {errors.full_name && <p className="text-sm text-destructive" role="alert">{errors.full_name.message}</p>}
      </div>

      {/* Appointment type */}
      <div className="flex flex-col gap-1.5">
        <Label required>Appointment type</Label>
        {typesLoading ? (
          <Skeleton className="h-10 rounded-md" />
        ) : (
          <Controller
            name="appointment_type_id"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger error={!!errors.appointment_type_id}>
                  <SelectValue placeholder="Select type of visit…" />
                </SelectTrigger>
                <SelectContent>
                  {apptTypes?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                      {t.duration_minutes && (
                        <span className="text-muted-foreground ml-2">({t.duration_minutes} min)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
        {errors.appointment_type_id && (
          <p className="text-sm text-destructive" role="alert">{errors.appointment_type_id.message}</p>
        )}
      </div>

      {/* Date picker */}
      <div className="flex flex-col gap-1.5">
        <Label required>Appointment date</Label>
        <Controller
          name="appointment_date"
          control={control}
          render={({ field }) => (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex h-10 w-full items-center justify-start rounded-md border bg-surface px-3 text-sm",
                    "border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors",
                    !field.value && "text-muted-foreground",
                    errors.appointment_date && "border-destructive focus:ring-destructive/20"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  {field.value ? format(field.value, "EEEE, MMMM d, yyyy") : "Select a date…"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.appointment_date && (
          <p className="text-sm text-destructive" role="alert">{errors.appointment_date.message}</p>
        )}
      </div>

      {/* Time slot grid */}
      <div className="flex flex-col gap-1.5">
        <Label required>
          <Clock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
          Time slot
          {selectedDate && (
            <span className="text-muted-foreground font-normal ml-1.5 text-xs">
              for {format(selectedDate, "MMM d")}
            </span>
          )}
        </Label>
        <Controller
          name="appointment_time"
          control={control}
          render={({ field }) => (
            <div
              role="radiogroup"
              aria-label="Time slot"
              className="grid grid-cols-3 sm:grid-cols-4 gap-2"
            >
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  role="radio"
                  aria-checked={field.value === slot}
                  onClick={() => field.onChange(slot)}
                  className={cn(
                    "h-10 rounded-md text-sm font-medium border transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    field.value === slot
                      ? "bg-primary border-primary text-primary-foreground shadow-sm"
                      : "bg-surface border-border text-foreground hover:border-primary/50 hover:bg-primary-subtle hover:text-primary"
                  )}
                >
                  {formatSlot(slot)}
                </button>
              ))}
            </div>
          )}
        />
        {errors.appointment_time && (
          <p className="text-sm text-destructive" role="alert">{errors.appointment_time.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" loading={mutation.isPending} className="w-full">
        Confirm appointment
      </Button>
    </form>
  );
}

function ConfirmationScreen({
  appointment,
  onBookAnother,
}: {
  appointment: Appointment;
  onBookAnother: () => void;
}) {
  let dateLabel = appointment.appointment_date;
  try {
    const d = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    dateLabel = format(d, "EEEE, MMMM d, yyyy");
  } catch {
    // keep raw
  }

  const [h, m] = appointment.appointment_time.split(":").map(Number);
  const p = h >= 12 ? "PM" : "AM";
  const timeLabel = `${h % 12 || 12}:${String(m).padStart(2, "0")} ${p}`;

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center animate-in fade-in zoom-in-95 duration-300">
      {/* Success icon */}
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success-subtle">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <div className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-primary-subtle flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">✓</span>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-foreground">Appointment booked!</h2>
        <p className="text-muted-foreground mt-1.5">
          We&apos;ve confirmed your appointment. You&apos;ll receive a reminder by email.
        </p>
      </div>

      {/* Details card */}
      <div className="w-full max-w-sm rounded-xl bg-primary-subtle border border-primary/20 p-5 text-left flex flex-col gap-3">
        <DetailRow label="Type" value={appointment.appointment_type?.name ?? "Appointment"} />
        <DetailRow label="Date" value={dateLabel} />
        <DetailRow label="Time" value={timeLabel} />
        <DetailRow label="Patient" value={appointment.full_name} />
        {appointment.doctor_name && <DetailRow label="Doctor" value={appointment.doctor_name} />}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Button variant="outline" className="flex-1" onClick={onBookAnother}>
          Book another
        </Button>
        <Button className="flex-1" asChild>
          <a href="/appointments">View all appointments</a>
        </Button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}
