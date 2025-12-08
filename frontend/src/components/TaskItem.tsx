// taskitem code

import clsx from "clsx";
import type { Task } from "../api/mockApi";

type Props = {
  task: Task;
  compact?: boolean;
};

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 5_000) return "just now";
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

export default function TaskItem({ task, compact = false }: Props) {
  return (
    <div className="bg-white p-3 rounded-lg border shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{task.type.toUpperCase()} — {task.id}</div>
          <div className="text-xs text-gray-500 mt-1">
            <span>Priority: </span><span className="font-medium">{task.priority}</span>
            {task.from ? <> <span className="mx-2">•</span> From: {task.from}</> : null}
            {task.to ? <> <span className="mx-2">•</span> To: {task.to}</> : null}
          </div>
        </div>

        <div className="text-right">
          <div className={clsx("px-2 py-0.5 rounded text-xs font-medium",
            task.priority === "high" ? "bg-red-50 text-red-700" : task.priority === "medium" ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"
          )}>
            {task.priority}
          </div>
          <div className="text-xs text-gray-400 mt-2">{timeAgo(task.createdAt)}</div>
        </div>
      </div>

      {!compact && task.comments ? (
        <div className="mt-3 text-sm text-gray-600">{task.comments}</div>
      ) : null}
    </div>
  );
}
