// frontend/src/pages/TaskQueuePage.tsx
import { useEffect, useRef, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/card";
import TaskItem from "../components/TaskItem";
import { serverApi } from "../api/serverApi";
import { useDataStore } from "../state/useDataStore";

export default function TaskQueuePage() {
  const tasks = useDataStore((s) => s.tasks);
  const refresh = useDataStore((s) => s.refresh);
  const loading = useDataStore((s) => s.loading);

  const [popping, setPopping] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    void refresh();

    intervalRef.current = window.setInterval(async () => {
      setPopping(true);
      try {
        const popped = await serverApi.popTask();
        if (popped) await refresh();
        else await refresh();
      } catch (err) {
        console.error(err);
      } finally {
        setPopping(false);
      }
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Task Queue</h1>
          <div className="text-sm text-slate-500">{loading ? "Updating..." : `${tasks.length} pending`}</div>
        </div>

        <Card>
          {tasks.length === 0 ? (
            <div className="text-center text-slate-500 py-8">No pending tasks</div>
          ) : (
            <div className="space-y-3">
              {popping && <div className="text-sm text-slate-500 mb-2">Assigning task...</div>}
              {tasks.map((t) => (
                <TaskItem key={t.id} task={t} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
