// frontend/src/api/serverApi.ts
import { io, Socket } from "socket.io-client";
export type BotStatus = "idle" | "busy" | "charging" | "error";

export type Bot = {
  id: string;
  name: string;
  battery: number;
  status: BotStatus;
  currentTask?: string | null;
  speed: number;
  lastUpdated: number;
  x?: number;
  y?: number;
};

export type Task = {
  id: string;
  type: "pickup" | "drop" | "move";
  priority: "low" | "medium" | "high";
  from?: string;
  to?: string;
  comments?: string;
  createdAt: number;
};

const SERVER = import.meta.env.VITE_API_BASE || "http://localhost:4000";

let socket: Socket | null = null;

export const serverApi = {
  connectSocket: (onState: (data: { bots: Bot[]; tasks: Task[] }) => void) => {
    if (socket) {
      return;
    }
    socket = io(SERVER, { transports: ["websocket"] });

    socket.on("connect", () => {
      console.log("connected to server socket", socket?.id);
    });

    socket.on("state", (payload: { bots: Bot[]; tasks: Task[] }) => {
      onState(payload);
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected");
      socket = null;
    });
  },

  // fetch REST endpoints
  getBots: async (): Promise<Bot[]> => {
    const r = await fetch(`${SERVER}/api/bots`);
    if (!r.ok) throw new Error("Failed to fetch bots");
    return r.json();
  },

  getTasks: async (): Promise<Task[]> => {
    const r = await fetch(`${SERVER}/api/tasks`);
    if (!r.ok) throw new Error("Failed to fetch tasks");
    return r.json();
  },

  addTask: async (task: Omit<Task, "id" | "createdAt">): Promise<Task> => {
    const r = await fetch(`${SERVER}/api/tasks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err?.error || "Failed to add task");
    }
    return r.json();
  },

  popTask: async (): Promise<Task | null> => {
    const r = await fetch(`${SERVER}/api/tasks/pop`, { method: "POST" });
    if (!r.ok) throw new Error("Failed to pop");
    const data = await r.json();
    return data.popped ?? null;
  },
};
