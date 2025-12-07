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

export const useDataStore = create<DataState>((set, get) => {
  let initialized = false;

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
      console.error("fetchAll error", err);
      set({ loading: false });
    }
  }

  // initialize socket and REST fetch once
  if (!initialized) {
    initialized = true;
    // initial data fetch
    void fetchAll();

    // connect socket: server pushes updates
    serverApi.connectSocket((payload) => {
      // payload has bots and tasks
      computeAndSet(payload.bots, payload.tasks);
    });
  }

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
