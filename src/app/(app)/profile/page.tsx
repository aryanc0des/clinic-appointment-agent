"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Mail, Phone, User } from "lucide-react";

import { updateProfileApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export default function ProfilePage() {
  const { patient, setPatient } = useAuth();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      full_name: patient?.full_name ?? "",
      phone: patient?.phone ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (updated) => {
      setPatient(updated);
      reset({ full_name: updated.full_name, phone: updated.phone ?? "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err: Error) => {
      setError("root", { message: err.message });
    },
  });

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-0.5">Manage your personal information</p>
      </div>

      {/* Avatar section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {patient ? initials(patient.full_name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground text-lg">
                {patient?.full_name ?? "—"}
              </p>
              <p className="text-sm text-muted-foreground">{patient?.email ?? "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Update your name and contact details</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((v) => mutation.mutate(v))}
            noValidate
            className="flex flex-col gap-5"
          >
            {errors.root && (
              <div role="alert" className="rounded-lg bg-destructive-subtle text-destructive text-sm px-4 py-3">
                {errors.root.message}
              </div>
            )}

            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="full_name"
                  placeholder="Jane Smith"
                  error={!!errors.full_name}
                  className="pl-9"
                  {...register("full_name")}
                />
              </div>
              {errors.full_name && (
                <p className="text-sm text-destructive" role="alert">{errors.full_name.message}</p>
              )}
            </div>

            {/* Email (read only) */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  value={patient?.email ?? ""}
                  disabled
                  className="pl-9 opacity-60 cursor-not-allowed"
                  readOnly
                />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="pl-9"
                  {...register("phone")}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button
                type="submit"
                loading={mutation.isPending}
                disabled={!isDirty}
              >
                Save changes
              </Button>

              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-success animate-in fade-in duration-300">
                  <Check className="h-4 w-4" />
                  Saved
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
