"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { registerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { getMeApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const schema = z.object({
  full_name: z.string().min(2, "Please enter your full name"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  path: ["confirm_password"],
  message: "Passwords do not match",
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setPatient } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      registerApi({ email: values.email, password: values.password, full_name: values.full_name }),
    onSuccess: async () => {
      const me = await getMeApi();
      setPatient(me);
      router.push("/dashboard");
    },
    onError: (err: Error) => {
      setError("root", { message: err.message });
    },
  });

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Create your account</h1>
        <p className="mt-2 text-muted-foreground">Start managing your health appointments today</p>
      </div>

      <Card className="shadow-lg border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Register</CardTitle>
          <CardDescription>Fill in your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate className="flex flex-col gap-5">
            {errors.root && (
              <div role="alert" className="rounded-lg bg-destructive-subtle text-destructive text-sm px-4 py-3">
                {errors.root.message}
              </div>
            )}

            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name" required>Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="full_name"
                  type="text"
                  autoComplete="name"
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

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" required>Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  error={!!errors.email}
                  className="pl-9"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive" role="alert">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" required>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  error={!!errors.password}
                  className="pl-9 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive" role="alert">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm_password" required>Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="confirm_password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  error={!!errors.confirm_password}
                  className="pl-9"
                  {...register("confirm_password")}
                />
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-destructive" role="alert">{errors.confirm_password.message}</p>
              )}
            </div>

            <Button type="submit" size="lg" loading={mutation.isPending} className="w-full mt-1">
              Create account
            </Button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              By registering, you agree that your health information will be handled securely and privately.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
