# 📦 **Warehouse Robot Dashboard – Final Submission**

A simulation-based web dashboard for monitoring warehouse robots, their tasks, analytics, and map layout.
Includes Bot Status, Dashboard, Task Allocation, Task Queue, Analytics, optional Map Page, and optional 3D visualization.

---

# 🚀 **How to Run the Project**

### **Prerequisites**

* Node.js **18+**
* npm or yarn
* Git

---

## **1) Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/warehouse-robot-dashboard.git
cd warehouse-robot-dashboard
```

---

## **2) Install frontend dependencies**

```bash
cd frontend
npm install
```

---

## **3) Start the development server**

```bash
npm run dev
```

The frontend will start at:

```
http://localhost:5173
```

---

## **4) (Bonus) Run Next.js 3D Visualization (optional)**

If you included the `next-visual` folder:

```bash
cd next-visual
npm install
npm run dev
```

Open:

```
http://localhost:3000/three-map
```

---

# 🛠 **Tech Stack**

### **Frontend**

* **React (TypeScript)**
* **Tailwind CSS** for styling
* **Zustand** for state management
* **Framer Motion** for animations
* **React Router** for page navigation
* **Recharts** for analytics graphs
* **SVG Rendering** for Map Page
* **Vite** for fast builds

### **Bonus (Optional)**

* **Next.js** + **Three.js** (`@react-three/fiber`, `@react-three/drei`)
  Used to create a 3D robot movement visualization.

---

# 🧱 **Component Architecture**

```
frontend/
│
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── HomeDashboard.tsx
│   │   ├── BotStatusPage.tsx
│   │   ├── TaskAllocationPage.tsx
│   │   ├── TaskQueuePage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   ├── MapPage.tsx         # Bonus: SVG map viewer
│   │   └── ...
│   │
│   ├── components/
│   │   ├── BotCard.tsx
│   │   ├── CompactBotCard.tsx
│   │   ├── SvgMapViewer.tsx   # Bonus: upload + render SVG layout
│   │   └── ui/
│   │        ├── Card.tsx
│   │        ├── StatCard.tsx
│   │        └── Button.tsx
│   │
│   ├── state/
│   │   ├── useDataStore.ts     # bots, tasks, simulation timers
│   │   └── useThemeStore.ts    # dark/light mode + palettes
│   │
│   ├── api/
│   │   └── mockApi.ts          # random bot generation, telemetry mock
│   │
│   └── styles/
│       └── globals.css
│
└── README.md
```

### **Key Components**

* **BotCard** – Displays bot health, battery, status, sparkline history, last update.
* **SvgMapViewer** – Upload an SVG map → render → overlay bots moving on it.
* **StatCard** – Dashboard summary of metrics like total bots, errors, tasks.
* **Task Form & Queue** – Assign tasks, auto-dequeue simulated tasks every 3 seconds.
* **Theme Provider** – Handles dark/light modes and color palettes.

---

# 🔄 **Data Flow Explanation**

### **1) Mock API Layer**

`mockApi.ts` simulates:

* Robot telemetry
* Battery drain
* Speed changes
* Status changes (idle, busy, charging, error)
* Task creation & assignment

This allows the system to run **offline with no backend**.

---

### **2) Zustand Store (Central State Hub)**

`useDataStore.ts` holds:

#### **State slices**

* `bots[]`
* `tasks[]`
* `pendingTasks[]`
* `loading`
* `simulationInterval`

#### **Actions**

* `refreshBots()`
* `addTask()`
* `removeTask()`
* `assignTask()`
* `setSimInterval()`

The store simulates:

* Bot updates every **10 seconds**
* Task dequeue every **3 seconds**

---

### **3) Components Subscribe to Slices**

Zustand uses *selectors*, so only the required parts re-render:

```ts
const bots = useDataStore(s => s.bots);
const pending = useDataStore(s => s.pendingTasks);
```

Pages remain fast and never over-render.

---

### **4) UI Rendering**

* **BotStatusPage** maps over `bots[]` → `BotCard`
* **TaskAllocationPage** dispatches `addTask()`
* **TaskQueuePage** auto-updates when `pendingTasks` changes
* **Dashboard** listens to:

  * `totalBots`
  * `idleBots`
  * `botsInError`
  * `activeTasks`
  * `pendingTasks`

---

# 🧠 **State Management Reasoning**

### ✔ **Why Zustand?**

* Much simpler than Redux
* Minimal boilerplate
* React-friendly
* Perfect for real-time simulation updates
* Small bundle size
* No context provider wrapper needed
* Built-in shallow comparison for optimal renders

### ✔ **Why not Context API?**

* Too many nested components
* Frequent updates cause re-renders
* Harder to structure simulation loop

### ✔ **Why not Redux Toolkit?**

* Heavy for an assignment
* Requires slicing, actions, reducers
* More code, less clarity
* Zustand is more suitable for fast prototyping

---

# 🎨 **Figma Link (Bonus)**

> Replace the link below with your real share URL:

👉 **Figma Design:**
[https://www.figma.com/file/YOUR_FIGMA_ID/warehouse-robot-dashboard](https://www.figma.com/file/YOUR_FIGMA_ID/warehouse-robot-dashboard)

Your Figma should include:

* Home Dashboard
* Bot Status
* Task Allocation
* Optional: SVG Map Page layout
* Component hierarchy and spacing tokens

---

# 📝 **Extras Included (Bonus Work)**

### ✔ Animated Bot Cards

* Gradient headers
* Sparkline trend graph
* Expanding details
* Hover motion effects

### ✔ SVG Map Page

* Upload any warehouse layout SVG
* Render directly
* Bots move over coordinates

### ✔ Optional Three.js Visualizer

(`/next-visual/three-map`)

* 3D animated bot movement
* @react-three/fiber & drei

---

# 🚀 **Future Improvements**

* Real WebSocket backend
* Live telemetry stream
* Real map coordinates from warehouse systems
* User roles & permissions
* Offline sync
* Error monitoring with Sentry

---

# 🙌 **Author**

**Your Name**
**Email:** [your-email@example.com](mailto:your-email@example.com)
**GitHub:** github.com/YOUR_USERNAME

---
