// signupPage code
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/ui/card";
import { useAuthStore } from "../state/useAuthStore";
import { useToast } from "../components/Toast";
import clsx from "clsx";


type FormValues = {
  name: string;
  email: string;
  password: string;
  password2: string;
};

export default function SignupPage() {
  const { register, handleSubmit, watch, formState } = useForm<FormValues>({ mode: "onTouched" });
  const { errors, isSubmitting } = formState;
  const registerFn = useAuthStore((s) => s.register);
  const toast = useToast();
  const navigate = useNavigate();
  const password = watch("password", "");

  async function onSubmit(data: FormValues) {
    try {
      if (data.password !== data.password2) {
        toast.push({ title: "Password mismatch", description: "Passwords do not match", tone: "error" });
        return;
      }
      await registerFn(data.name, data.email, data.password);
      toast.push({ title: "Welcome!", description: `Account created for ${data.name}`, tone: "success" });
      navigate("/dashboard");
    } catch (err: any) {
      toast.push({ title: "Signup failed", description: err?.message || "Try again", tone: "error" });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FF7AF3] via-[#7C3AED] to-[#4F46E5]">
      <div className="max-w-3xl w-full grid grid-cols-1 gap-8">
        <div className="mx-auto w-full max-w-md">
          <Card>
            <div className="mb-4">
              <div className="text-2xl font-bold">Create your account</div>
              <div className="text-sm text-slate-500 mt-1">Join the demo console — no persistent auth.</div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full name</label>
                <input
                  {...register("name", { required: "Enter your name" })}
                  className={clsx("w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800", errors.name && "border-red-500")}
                  placeholder="Your name"
                />
                {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name.message}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  {...register("email", { required: "Email required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } })}
                  className={clsx("w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800", errors.email && "border-red-500")}
                  placeholder="you@example.com"
                />
                {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email.message}</div>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    {...register("password", { required: "Password required", minLength: { value: 4, message: "At least 4 characters" } })}
                    className={clsx("w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800", errors.password && "border-red-500")}
                  />
                  {errors.password && <div className="text-xs text-red-600 mt-1">{errors.password.message}</div>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm</label>
                  <input
                    type="password"
                    {...register("password2", { required: "Confirm your password", validate: (v) => v === password || "Passwords must match" })}
                    className={clsx("w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800", errors.password2 && "border-red-500")}
                  />
                  {errors.password2 && <div className="text-xs text-red-600 mt-1">{errors.password2.message}</div>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link to="/" className="text-primary hover:underline">Have an account? Sign in</Link>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create account"}
                </button>
              </div>
            </form>
          </Card>

          <div className="mt-4 text-center text-sm text-white/80">
            <div className="font-semibold">Warehouse Robot Console</div>
            <div className="text-xs">Real-time simulation — built for demo & interviews.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
