// frontend/src/pages/LoginPage.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/ui/card";
import { useAuthStore } from "../state/useAuthStore";
import { useToast } from "../components/Toast";
import clsx from "clsx";

type FormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { register, handleSubmit, formState } = useForm<FormValues>({ mode: "onTouched" });
  const { errors, isSubmitting } = formState;
  const login = useAuthStore((s) => s.login);
  const toast = useToast();
  const navigate = useNavigate();

  async function onSubmit(data: FormValues) {
    try {
      await login(data.email, data.password);
      toast.push({ title: "Welcome back", description: `Signed in as ${data.email}`, tone: "success" });
      navigate("/dashboard");
    } catch (err: any) {
      toast.push({ title: "Sign in failed", description: err?.message || "Check credentials", tone: "error" });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FF7AF3] via-[#7C3AED] to-[#4F46E5]">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: Tagline / About */}
        <div className="hidden lg:flex flex-col gap-6 text-white">
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <h1 className="text-4xl font-extrabold tracking-tight">Warehouse Robot Console</h1>
            <p className="mt-3 text-lg">A live simulation dashboard for fleet management: monitor robots, allocate tasks, and visualize performance.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/6 border border-white/8">
            <h3 className="text-lg font-semibold">About this project</h3>
            <p className="mt-2 text-sm text-white/90">
              Demo assignment UI for an SDE internship: real-time Socket.IO simulation, admin controls, task queue, and analytics.
              Designed to be vibrant, accessible, and developer-friendly.
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              <li>• Live fleet simulation with admin panel</li>
              <li>• Task allocation & queue management</li>
              <li>• Rich analytics & map visualization</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white/6 border border-white/8">
            <h4 className="text-sm font-medium">Try these demo accounts</h4>
            <div className="mt-2 text-sm">
              <div>operator@demo.com / any password</div>
            </div>
          </div>
        </div>

        {/* Right: Login Card */}
        <div className="mx-auto w-full max-w-md">
          <Card>
            <div className="mb-4">
              <div className="text-2xl font-bold">Sign in to your account</div>
              <div className="text-sm text-slate-500 mt-1">Vibrant UI • Quick demo • No persistent auth</div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } })}
                  className={clsx("w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800", errors.email && "border-red-500")}
                />
                {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email.message}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  {...register("password", { required: "Password required", minLength: { value: 4, message: "At least 4 characters" } })}
                  className={clsx("w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800", errors.password && "border-red-500")}
                />
                {errors.password && <div className="text-xs text-red-600 mt-1">{errors.password.message}</div>}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
                </div>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>

            <div className="mt-4 text-xs text-slate-500">
              By signing in you agree to the demo terms. This app stores authentication only in memory.
            </div>
          </Card>

          {/* small footer */}
          <div className="mt-4 text-center text-sm text-white/80 lg:hidden">
            <div className="font-semibold">Warehouse Robot Console</div>
            <div className="text-xs">Real-time simulation — built for demo & interviews.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
