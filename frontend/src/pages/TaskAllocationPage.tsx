// frontend/src/pages/TaskAllocationPage.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/card";
import { mockApi } from "../api/mockApi";
import { useDataStore } from "../state/useDataStore";
import { useToast } from "../components/Toast";

type FormValues = {
  type: "pickup" | "drop" | "move";
  priority: "low" | "medium" | "high";
  from?: string;
  to?: string;
  comments?: string;
};

export default function TaskAllocationPage() {
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: { type: "pickup", priority: "medium", from: "", to: "", comments: "" },
    mode: "onTouched",
  });
  const { errors, isSubmitting } = formState;
  const navigate = useNavigate();
  const refresh = useDataStore((s) => s.refresh);
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: FormValues) {
    setLoading(true);
    try {
      // Basic client-side validation: ensure from/to for move tasks
      if (data.type === "move" && (!data.from || !data.to)) {
        toast.push({ title: "Validation", description: "Move tasks require both From and To zones", tone: "error" });
        setLoading(false);
        return;
      }

      await mockApi.addTask({
        type: data.type,
        priority: data.priority,
        from: data.from,
        to: data.to,
        comments: data.comments,
      });

      await refresh(); // update store from server state
      reset();
      toast.push({ title: "Task created", description: `${data.type} • ${data.priority}`, tone: "success" });
      // small delay so the user sees the toast, then navigate
      setTimeout(() => navigate("/queue"), 350);
    } catch (err) {
      console.error("create task error", err);
      toast.push({ title: "Failed to create task", description: "Server error — try again", tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Create Task</h1>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Row: type + priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Task type</label>
                <select
                  {...register("type", { required: "Please choose a task type" })}
                  className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800"
                >
                  <option value="pickup">Pickup</option>
                  <option value="drop">Drop</option>
                  <option value="move">Move</option>
                </select>
                {errors.type && <div className="text-xs text-red-600 mt-1">{errors.type.message}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  {...register("priority", { required: true })}
                  className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Row: from / to */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">From (Zone)</label>
                <input
                  {...register("from")}
                  placeholder="e.g. A1"
                  className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To (Zone)</label>
                <input
                  {...register("to")}
                  placeholder="e.g. B3"
                  className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium mb-1">Comments</label>
              <textarea
                {...register("comments")}
                placeholder="Optional notes for operator..."
                className="w-full rounded-md border px-3 py-2 min-h-[100px] bg-white dark:bg-slate-800"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="btn btn-primary"
                aria-busy={loading || isSubmitting}
              >
                {loading || isSubmitting ? "Creating..." : "Create Task"}
              </button>

              <button
                type="button"
                onClick={() => {
                  reset();
                  toast.push({ title: "Cleared", description: "Form reset", tone: "info" });
                }}
                className="btn btn-ghost"
              >
                Clear
              </button>

              <div className="text-sm text-slate-500 ml-auto">You will be redirected to the queue after creation.</div>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
