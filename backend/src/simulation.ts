// backend/src/simulation.ts
import { Server as IOServer } from "socket.io";

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

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function makeBot(i: number): Bot {
  const statuses: BotStatus[] = ["idle", "busy", "charging", "error"];
  const status = statuses[rnd(0, statuses.length - 1)];
  return {
    id: `bot-${i}`,
    name: `BOT-${100 + i}`,
    battery: rnd(10, 100),
    status,
    currentTask: status === "busy" ? `task-${rnd(1, 6)}` : null,
    speed: Number((Math.random() * 1.5).toFixed(2)),
    lastUpdated: Date.now(),
    x: rnd(10, 380),
    y: rnd(10, 280),
  };
}

export class Simulation {
  bots: Bot[] = [];
  tasks: Task[] = [];
  io: IOServer | null = null;
  intervalId: NodeJS.Timeout | null = null;

  constructor(io?: IOServer) {
    // initialize
    this.bots = Array.from({ length: 10 }, (_, i) => makeBot(i + 1));
    for (let i = 1; i <= 4; i++) {
      this.tasks.push({
        id: `task-${i}`,
        type: i % 2 === 0 ? "drop" : "pickup",
        priority: i % 3 === 0 ? "high" : "medium",
        from: `A${rnd(1, 10)}`,
        to: `B${rnd(1, 10)}`,
        comments: "Initial",
        createdAt: Date.now() - i * 60000,
      });
    }
    if (io) this.attachIo(io);
    this.start();
  }

  attachIo(io: IOServer) {
    this.io = io;
  }

  getState() {
    return { bots: this.bots, tasks: this.tasks };
  }

  start() {
    // update bots every 10s
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.bots = this.bots.map((b) => {
        // battery change
        let battery = b.battery;
        if (b.status !== "charging") battery = Math.max(0, battery - rnd(0, 8));
        else battery = Math.min(100, battery + rnd(1, 10));

        // small chance to change status slightly
        if (Math.random() < 0.15) {
          const statuses: BotStatus[] = ["idle", "busy", "charging", "error"];
          const status = statuses[rnd(0, statuses.length - 1)];
          return {
            ...b,
            battery,
            status,
            currentTask: status === "busy" ? `task-${rnd(1, 100)}` : null,
            speed: Number((Math.random() * 1.5).toFixed(2)),
            lastUpdated: Date.now(),
            x: (b.x ?? 0) + rnd(-20, 20),
            y: (b.y ?? 0) + rnd(-20, 20),
          };
        }
        return {
          ...b,
          battery,
          lastUpdated: Date.now(),
          x: (b.x ?? 0) + rnd(-8, 8),
          y: (b.y ?? 0) + rnd(-8, 8),
        };
      });
      this.broadcast();
    }, 10000);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
  }

  addTask(payload: Omit<Task, "id" | "createdAt">) {
    const task: Task = {
      ...payload,
      id: `task-${Date.now()}`,
      createdAt: Date.now(),
    };
    this.tasks.push(task);
    this.broadcast();
    return task;
  }

  popTask() {
    if (this.tasks.length === 0) return null;
    const t = this.tasks.shift()!;
    this.broadcast();
    return t;
  }

  broadcast() {
    if (this.io) {
      this.io.emit("state", this.getState());
    }
  }
}
