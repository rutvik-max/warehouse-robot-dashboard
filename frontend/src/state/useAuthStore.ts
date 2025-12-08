// frontend/src/state/useAuthStore.ts
import { create } from "zustand";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,

  // mock login: accept any non-empty email/password, simulate API delay
  login: async (email: string, password: string) => {
    set({ loading: true });
    // fake API delay
    await new Promise((r) => setTimeout(r, 700));
    if (!email || !password) {
      set({ loading: false });
      throw new Error("Invalid credentials");
    }
    const user = { id: "u-" + Date.now(), name: email.split("@")[0], email };
    set({ user, loading: false });
    return user;
  },

  // mock register: create user and sign in immediately
  register: async (name: string, email: string, password: string) => {
    set({ loading: true });
    await new Promise((r) => setTimeout(r, 800));
    if (!name || !email || !password) {
      set({ loading: false });
      throw new Error("Invalid registration data");
    }
    const user = { id: "u-" + Date.now(), name, email };
    set({ user, loading: false });
    return user;
  },

  logout: () => {
    // in-memory only — no localStorage used
    set({ user: null });
  },
}));
