// frontend/src/api/serverApi.ts

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

// Read API base from Vite env
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE &&
  (import.meta as any).env?.VITE_API_BASE !== "undefined"
    ? (import.meta as any).env.VITE_API_BASE
    : "http://localhost:4000";

console.log("[serverApi] Using API:", API_BASE);

// Helper to fetch JSON with better error messages
async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, init);

  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {}

    throw new Error(
      `Fetch failed: ${res.status} ${res.statusText}\nURL: ${url}\n${body}`
    );
  }

  return res.json();
}

// ======== REST API WRAPPERS ========

export const serverApi = {
  getBots: async (): Promise<Bot[]> => {
    return fetchJson<Bot[]>("/api/bots");
  },

  getTasks: async (): Promise<Task[]> => {
    return fetchJson<Task[]>("/api/tasks");
  },

  addTask: async (
    task: Omit<Task, "id" | "createdAt">
  ): Promise<Task> => {
    return fetchJson<Task>("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
  },

  popTask: async (): Promise<Task | null> => {
    const data = await fetchJson<{ popped?: Task | null }>(
      "/api/tasks/pop",
      { method: "POST" }
    );
    return data.popped ?? null;
  },
};
