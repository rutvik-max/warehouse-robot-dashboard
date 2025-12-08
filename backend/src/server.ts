// server.ts (or index.ts / server.js) - updated CORS handling
import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { Server as IOServer } from "socket.io";
import { Simulation } from "./simulation";

const app = express();

// ----- CORS configuration -----
const ALLOWED_ORIGINS = [
  "https://warehouse-robot-dashboard-k37t.vercel.app", // front-end origin (replace/add as needed)
  "https://warehouse-robot-dashboard-one.vercel.app", // backend frontend preview (if any)
  // add other allowed origins here
];

// Delegate that echoes origin when allowed (prevents using '*')
const corsOptionsDelegate = (req: express.Request, callback: (err: Error | null, options?: cors.CorsOptions) => void) => {
  const origin = req.header("Origin") ?? "";
  const opts: cors.CorsOptions = {
    origin: false,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: false, // set true if you need cookies/auth
    optionsSuccessStatus: 204,
  };

  if (!origin) {
    // Non-browser clients (curl etc.) — allow
    opts.origin = true;
  } else if (ALLOWED_ORIGINS.includes(origin)) {
    // echo the allowed origin back (required if credentials:true)
    opts.origin = origin;
    // if your app needs cookies/auth set:
    // opts.credentials = true;
  } else {
    opts.origin = false;
  }

  callback(null, opts);
};

// Use CORS with delegate for all routes
app.use(cors(corsOptionsDelegate));
// Ensure preflight OPTIONS handled for all paths
app.options("*", cors(corsOptionsDelegate));

// ----- Standard middleware -----
app.use(express.json());

// static admin files (unchanged)
const adminDir = path.join(__dirname, "../admin");
app.use("/admin/static", express.static(adminDir));

// create HTTP + Socket.IO server
const server = http.createServer(app);

// Socket.IO: restrict origins to allowed origins (array)
const io = new IOServer(server, {
  cors: {
    origin: ALLOWED_ORIGINS, // array of allowed origins
    methods: ["GET", "POST"],
    credentials: false, // set true if you enable credentials above
  },
});

const sim = new Simulation(io);

// Socket connections — keep simple log and emit initial state
io.on("connection", (socket) => {
  console.log("client connected:", socket.id, "origin:", socket.handshake.headers.origin);
  try {
    socket.emit("state", sim.getState());
  } catch (err) {
    console.error("emit state error:", err);
  }
  socket.on("disconnect", () => {
    console.log("client disconnected:", socket.id);
  });
});

// REST endpoints (unchanged)
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

// admin routes (unchanged)
app.get("/admin", (req, res) => {
  const file = path.join(__dirname, "../admin/index.html");
  res.sendFile(file);
});

app.get("/admin/state", (req, res) => {
  res.json(sim.getState());
});

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

// simulation update endpoint (unchanged)
app.post("/admin/interval", (req, res) => {
  const { ms } = req.body as { ms?: number };
  if (!ms || typeof ms !== "number" || ms < 100) return res.status(400).json({ error: "invalid ms" });
  sim.stop();
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

  // store
  (sim as any).__adminInterval && clearInterval((sim as any).__adminInterval);
  (sim as any).__adminInterval = setInterval(updater, ms);
  return res.json({ ok: true, intervalMs: ms });
});

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

// start server
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(PORT, () => {
  console.log(`Mock server listening on http://localhost:${PORT}`);
});
