"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useClinicAuth } from "@/lib/clinic/auth-context";
import { staffLoginApi } from "@/lib/clinic/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/layout/nav-bar";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});
type FormData = z.infer<typeof schema>;

export default function ClinicLoginPage() {
  const { setUser } = useClinicAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setError("");
      const result = await staffLoginApi(data);
      setUser(result.user);
      router.replace("/clinic/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center gap-2.5 justify-center">
          <Logo size={32} />
          <div>
            <h1 className="font-serif text-lg font-medium tracking-tight">SmileCare</h1>
            <p className="text-xs text-muted-foreground">Staff Portal</p>
          </div>
        </div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Sign in</CardTitle>
            <CardDescription className="text-xs">
              Access the clinic management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="you@clinic.com"
                  className="h-8 text-sm"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="h-8 text-sm"
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              {error && (
                <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full h-8 text-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Staff access only.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
