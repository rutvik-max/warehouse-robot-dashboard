import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Box, ListChecks, Clock, BarChart2, MapPin, LogOut, Sun, Moon, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../state/useAuthStore";
import { useThemeStore, type Palette } from "../state/useThemeStore";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/bots", label: "Bots", icon: Box },
  { to: "/tasks", label: "Allocate", icon: ListChecks },
  { to: "/queue", label: "Queue", icon: Clock },
  { to: "/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/map", label: "Map", icon: MapPin },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const palette = useThemeStore((s) => s.palette);
  const setPalette = useThemeStore((s) => s.setPalette);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {}
      <aside className="w-20 lg:w-64 bg-white dark:bg-slate-800 border-r dark:border-slate-700 hidden lg:flex flex-col p-4 gap-6">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary text-white w-10 h-10 flex items-center justify-center font-bold">WR</div>
          <div className="hidden lg:block">
            <div className="font-bold">Warehouse</div>
            <div className="text-xs text-slate-500 dark:text-slate-300">Robots Dashboard</div>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            {navItems.map((n) => {
              const Icon = n.icon;
              const active = location.pathname.startsWith(n.to);
              return (
                <li key={n.to}>
                  <Link to={n.to} className={`group flex items-center gap-3 px-3 py-2 rounded-md ${active ? "bg-indigo-50 dark:bg-slate-700 text-indigo-700 dark:text-indigo-200" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}>
                    <Icon className="w-5 h-5" />
                    <span className="hidden lg:inline text-sm">{n.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto">
          <div className="hidden lg:block text-xs text-slate-500 dark:text-slate-300 mb-2">Signed in as</div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-semibold">
              {(user?.name || "OP").slice(0,2).toUpperCase()}
            </div>
            <div className="hidden lg:block">
              <div className="text-sm">{user?.name ?? "Operator"}</div>
              <button onClick={() => logout()} className="text-red-600 text-xs hover:underline flex items-center gap-1">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {}
      <div className="lg:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
          {navItems.map((n) => {
            const Icon = n.icon;
            const active = location.pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`p-2 rounded-md ${active ? "bg-indigo-50 text-indigo-700 dark:bg-slate-700" : "text-slate-600 dark:text-slate-300"}`}>
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </div>
      </div>

      {}
      <div className="flex-1 min-h-screen">
        <header className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-600 text-white">Menu</button>
            <div className="text-lg font-semibold">Warehouse Robot Dashboard</div>
            <div className="hidden md:flex items-center bg-slate-50 dark:bg-slate-700 rounded px-3 py-1 text-sm text-slate-500 dark:text-slate-200">
              <span className="mr-3">Overview</span>
              <div className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400">Live</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700" title="Notifications">
              <Bell className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <div className="hidden sm:flex flex-col text-right">
              <div className="text-sm font-medium">{user?.name ?? "Operator"}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Operations</div>
            </div>

            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-semibold">
              {(user?.name || "OP").slice(0,2).toUpperCase()}
            </div>
          </div>
        </header>

        <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="p-6">
          {children}
        </motion.main>
      </div>
    </div>
  );
}
