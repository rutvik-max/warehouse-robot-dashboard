// frontend/src/state/useDataStore.ts
import { create } from "zustand";
import { serverApi, type Bot, type Task } from "../api/serverApi";

type DataState = {
  bots: Bot[];
  tasks: Task[];
  loading: boolean;
  totalBots: number;
  botsInError: number;
  idleBots: number;
  activeTasksCount: number;
  pendingTasks: number;
  refresh: () => Promise<void>;
};

export const useDataStore = create<DataState>((set) => {

  // interval refs stored on globalThis to persist across HMR in dev
  const GLOBAL = globalThis as any;
  GLOBAL.__DATA_STORE_INIT_DONE = GLOBAL.__DATA_STORE_INIT_DONE ?? false;
  GLOBAL.__DATA_STORE_BOTS_INTERVAL = GLOBAL.__DATA_STORE_BOTS_INTERVAL ?? null;
  GLOBAL.__DATA_STORE_POP_INTERVAL = GLOBAL.__DATA_STORE_POP_INTERVAL ?? null;

  const computeAndSet = (bots: Bot[], tasks: Task[]) => {
    const totalBots = bots.length;
    const botsInError = bots.filter((b) => b.status === "error").length;
    const idleBots = bots.filter((b) => b.status === "idle").length;
    const activeTasksCount = bots.filter((b) => b.status === "busy").length;
    const pendingTasks = tasks.length;
    set({
      bots,
      tasks,
      totalBots,
      botsInError,
      idleBots,
      activeTasksCount,
      pendingTasks,
      loading: false,
    });
  };

  async function fetchAll() {
    set({ loading: true });
    try {
      const [bots, tasks] = await Promise.all([serverApi.getBots(), serverApi.getTasks()]);
      computeAndSet(bots, tasks);
    } catch (err) {
      console.error("useDataStore.fetchAll error", err);
      set({ loading: false });
    }
  }

  async function popAndRefresh() {
    try {
      const popped = await serverApi.popTask();
      if (popped) {
        // if a task was popped/assigned, refresh tasks (and bots)
        await fetchAll();
      }
    } catch (err) {
      console.error("useDataStore.popAndRefresh error", err);
    }
  }

  // initialize polling only once (persist across HMR dev reloads)
  if (!GLOBAL.__DATA_STORE_INIT_DONE) {
    GLOBAL.__DATA_STORE_INIT_DONE = true;

    // initial fetch
    void fetchAll();

    // poll every 10s for fresh bots/tasks
    GLOBAL.__DATA_STORE_BOTS_INTERVAL = window.setInterval(() => {
      void fetchAll();
    }, 10_000);

    // simulate task assignment: pop one every 3s
    GLOBAL.__DATA_STORE_POP_INTERVAL = window.setInterval(() => {
      void popAndRefresh();
    }, 3_000);

    // cleanup on page unload
    window.addEventListener("beforeunload", () => {
      if (GLOBAL.__DATA_STORE_BOTS_INTERVAL) {
        clearInterval(GLOBAL.__DATA_STORE_BOTS_INTERVAL);
        GLOBAL.__DATA_STORE_BOTS_INTERVAL = null;
      }
      if (GLOBAL.__DATA_STORE_POP_INTERVAL) {
        clearInterval(GLOBAL.__DATA_STORE_POP_INTERVAL);
        GLOBAL.__DATA_STORE_POP_INTERVAL = null;
      }
    });
  }

  // initial state return
  return {
    bots: [],
    tasks: [],
    loading: true,
    totalBots: 0,
    botsInError: 0,
    idleBots: 0,
    activeTasksCount: 0,
    pendingTasks: 0,
    refresh: fetchAll,
  };
});
