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

/**
 * API base resolution:
 * - In production with Vercel rewrite we want same-origin requests => use "/api"
 * - For local dev you might set VITE_API_BASE (e.g. http://localhost:4000)
 */
const RAW_ENV = (import.meta as any).env?.VITE_API_BASE;
const API_BASE = RAW_ENV && RAW_ENV !== "undefined" ? RAW_ENV.replace(/\/+$/, "") : "/api";

console.info("[serverApi] Using API base:", API_BASE);

// safe join to avoid double-slashes
function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  if (!path) return b;
  return b + (path.startsWith("/") ? path : "/" + path);
}

// Helper to fetch JSON with better error messages
async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = joinUrl(API_BASE, path);
  const res = await fetch(url, init);

  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {}
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}\nURL: ${url}\n${body}`);
  }

  return res.json();
}

// ======== REST API WRAPPERS ========
export const serverApi = {
  getBots: async (): Promise<Bot[]> => {
    return fetchJson<Bot[]>(" /bots".trim()); // resolves to "/api/bots"
  },

  getTasks: async (): Promise<Task[]> => {
    return fetchJson<Task[]>(" /tasks".trim());
  },

  addTask: async (task: Omit<Task, "id" | "createdAt">): Promise<Task> => {
    return fetchJson<Task>(" /tasks".trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
  },

  popTask: async (): Promise<Task | null> => {
    const data = await fetchJson<{ popped?: Task | null }>(" /tasks/pop".trim(), { method: "POST" });
    return data.popped ?? null;
  },
};
