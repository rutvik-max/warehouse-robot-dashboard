// backend/src/server.ts
import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { Server as IOServer } from "socket.io";
import { Simulation } from "./simulation";

const app = express();
app.use(cors());
app.use(express.json());

// serve admin static from /admin
const adminDir = path.join(__dirname, "../admin");
app.use("/admin/static", express.static(adminDir)); // for any static assets

const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: "*" },
});

const sim = new Simulation(io);

// Socket connections: send state on connect already handled by Simulation in previous version,
// but keep a simple log here
io.on("connection", (socket) => {
  console.log("client connected:", socket.id);
  socket.emit("state", sim.getState());
  socket.on("disconnect", () => {
    console.log("client disconnected:", socket.id);
  });
});

// REST endpoints (existing)
app.get("/api/bots", (req, res) => res.json(sim.getState().bots));
app.get("/api/tasks", (req, res) => res.json(sim.getState().tasks));

app.post("/api/tasks", (req, res) => {
  const body = req.body;
  if (!body || !body.type || !body.priority) return res.status(400).json({ error: "invalid payload" });
  const t = sim.addTask({
    type: body.type,
    priority: body.priority,
    from: body.from,
    to: body.to,
    comments: body.comments,
  });
  res.json(t);
});

app.post("/api/tasks/pop", (req, res) => res.json({ popped: sim.popTask() }));

// --- New admin endpoints ---

// Serve admin HTML
app.get("/admin", (req, res) => {
  const file = path.join(__dirname, "../admin/index.html");
  res.sendFile(file);
});

// Get full state (for admin)
app.get("/admin/state", (req, res) => {
  res.json(sim.getState());
});

// Toggle simulation (start/stop)
app.post("/admin/toggle", (req, res) => {
  const { action } = req.body as { action?: "start" | "stop" };
  if (action === "stop") {
    sim.stop();
    return res.json({ ok: true, running: false });
  } else {
    sim.start();
    return res.json({ ok: true, running: true });
  }
});

// Set simulation update interval (ms)
app.post("/admin/interval", (req, res) => {
  const { ms } = req.body as { ms?: number };
  if (!ms || typeof ms !== "number" || ms < 100) return res.status(400).json({ error: "invalid ms" });
  // quick approach: stop and restart simulation with the new interval by modifying Simulation.start logic
  // We add a tiny helper: setIntervalTime on sim if available, else respond not supported.
  // For now, we'll implement by stopping and starting repeatedly with new interval by monkey-patch.
  // (Simulation.start uses fixed 10s; we can emulate by replacing the interval with ms)
  sim.stop();
  // We will create a minimal setInterval here to update bots and broadcast using existing sim logic:
  // small inline updater:
  const updater = () => {
    sim.bots = sim.bots.map((b) => {
      let battery = b.battery;
      if (b.status !== "charging") battery = Math.max(0, battery - Math.floor(Math.random() * 9));
      else battery = Math.min(100, battery + Math.floor(Math.random() * 11));

      if (Math.random() < 0.15) {
        const statuses = ["idle", "busy", "charging", "error"] as const;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        return {
          ...b,
          battery,
          status,
          currentTask: status === "busy" ? `task-${Math.floor(Math.random() * 100)}` : null,
          speed: Number((Math.random() * 1.5).toFixed(2)),
          lastUpdated: Date.now(),
          x: (b.x ?? 0) + (Math.random() * 40 - 20),
          y: (b.y ?? 0) + (Math.random() * 40 - 20),
        };
      }
      return {
        ...b,
        battery,
        lastUpdated: Date.now(),
        x: (b.x ?? 0) + (Math.random() * 16 - 8),
        y: (b.y ?? 0) + (Math.random() * 16 - 8),
      };
    });
    sim.broadcast();
  };

  // store on sim for cleanup
  (sim as any).__adminInterval && clearInterval((sim as any).__adminInterval);
  (sim as any).__adminInterval = setInterval(updater, ms);
  return res.json({ ok: true, intervalMs: ms });
});

// Admin helper: inject a task from admin UI
app.post("/admin/addTask", (req, res) => {
  const body = req.body;
  if (!body || !body.type || !body.priority) return res.status(400).json({ error: "invalid payload" });
  const t = sim.addTask({
    type: body.type,
    priority: body.priority,
    from: body.from,
    to: body.to,
    comments: body.comments,
  });
  res.json(t);
});

// done
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(PORT, () => {
  console.log(`Mock server listening on http://localhost:${PORT}`);
});
