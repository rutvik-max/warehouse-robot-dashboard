// frontend/src/api/mockApi.ts
// Simple in-memory mock for bots and tasks, with helper functions.
// This runs in the browser and is intended for dev/demo only.

export type BotStatus = "idle" | "busy" | "charging" | "error";

export type Bot = {
  id: string;
  name: string;
  battery: number; // 0-100
  status: BotStatus;
  currentTask?: string | null;
  speed: number; // arbitrary units
  lastUpdated: number; // timestamp
  x?: number;
  y?: number;
};

// Task shape
export type Task = {
  id: string;
  type: "pickup" | "drop" | "move";
  priority: "low" | "medium" | "high";
  from?: string;
  to?: string;
  comments?: string;
  createdAt: number;
};

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function makeBot(i: number): Bot {
  const statuses: BotStatus[] = ["idle", "busy", "charging", "error"];
  const status = statuses[random(0, statuses.length - 1)];
  return {
    id: `bot-${i}`,
    name: `BOT-${100 + i}`,
    battery: random(10, 100),
    status,
    currentTask: status === "busy" ? `task-${random(1, 5)}` : null,
    speed: Number((Math.random() * 1.5).toFixed(2)),
    lastUpdated: Date.now() - random(0, 60_000),
    x: random(10, 400),
    y: random(10, 300),
  };
}

let bots: Bot[] = Array.from({ length: 10 }, (_, i) => makeBot(i + 1));
let tasks: Task[] = []; // pending tasks queue

// initialize some tasks
for (let i = 1; i <= 5; i++) {
  tasks.push({
    id: `task-${i}`,
    type: i % 2 === 0 ? "drop" : "pickup",
    priority: i % 3 === 0 ? "high" : "medium",
    from: `A${random(1, 10)}`,
    to: `B${random(1, 10)}`,
    comments: "Auto-generated",
    createdAt: Date.now() - i * 1000 * 30,
  });
}

// Simulate changes: every 10s randomly update some bots (battery/status/lastUpdated)
setInterval(() => {
  bots = bots.map((b) => {
    // small random battery drain unless charging
    let battery = b.battery;
    if (b.status !== "charging") battery = Math.max(0, battery - random(0, 8));
    else battery = Math.min(100, battery + random(1, 10));

    // random status flip chance
    if (Math.random() < 0.15) {
      const statuses: BotStatus[] = ["idle", "busy", "charging", "error"];
      const status = statuses[random(0, statuses.length - 1)];
      return {
        ...b,
        battery,
        status,
        currentTask: status === "busy" ? `task-${random(1, 20)}` : null,
        speed: Number((Math.random() * 1.5).toFixed(2)),
        lastUpdated: Date.now(),
        x: b.x! + random(-10, 10),
        y: b.y! + random(-10, 10),
      };
    }

    return { ...b, battery, lastUpdated: Date.now(), x: b.x! + random(-4, 4), y: b.y! + random(-4, 4) };
  });
}, 10_000);

export const mockApi = {
  getBots: async (): Promise<Bot[]> => {
    // simulate network delay
    await new Promise((r) => setTimeout(r, random(100, 300)));
    return bots;
  },

  getTasks: async (): Promise<Task[]> => {
    await new Promise((r) => setTimeout(r, random(100, 300)));
    return tasks;
  },

  addTask: async (task: Omit<Task, "id" | "createdAt">): Promise<Task> => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: Date.now(),
    };
    tasks.push(newTask);
    return newTask;
  },

  // simulate removing/assigning a task (pop)
  popTask: async (): Promise<Task | null> => {
    if (tasks.length === 0) return null;
    const t = tasks.shift()!;
    return t;
  },

  // helper to get counts quickly
  getOverviewCounts: async () => {
    const b = await mockApi.getBots();
    const t = await mockApi.getTasks();
    const totalBots = b.length;
    const botsInError = b.filter((x) => x.status === "error").length;
    const idleBots = b.filter((x) => x.status === "idle").length;
    const activeTasksCount = b.filter((x) => x.status === "busy").length;
    const pendingTasks = t.length;
    return { totalBots, botsInError, idleBots, activeTasksCount, pendingTasks };
  },
};
