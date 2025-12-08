// frontend/src/pages/BotStatusPage.tsx
import { useEffect, useState, useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/card";
import BotCard from "../components/BotCard";
import { useDataStore } from "../state/useDataStore";
import { Search, Battery, ChevronUp, ChevronDown } from "lucide-react";

export default function BotStatusPage() {
  const bots = useDataStore((s) => s.bots);
  const refresh = useDataStore((s) => s.refresh);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<null | string>(null);
  const [batterySort, setBatterySort] = useState<"asc" | "desc" | null>(null);

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    let result = [...bots];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((b) => b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q));
    }

    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (batterySort === "asc") {
      result.sort((a, b) => a.battery - b.battery);
    } else if (batterySort === "desc") {
      result.sort((a, b) => b.battery - a.battery);
    }

    return result;
  }, [bots, query, statusFilter, batterySort]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Bots</h1>
        </div>

        <Card>
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            
            {/* Search */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-md w-full lg:w-64">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search bots..."
                className="bg-transparent focus:outline-none text-sm flex-1 dark:text-slate-100"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              {["idle", "busy", "charging", "error"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                  className={`px-3 py-1 rounded text-sm capitalize border ${
                    statusFilter === s
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Battery Sort */}
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-slate-500" />
              <button
                onClick={() => setBatterySort("asc")}
                className={`px-2 py-1 rounded border text-xs ${
                  batterySort === "asc"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                }`}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => setBatterySort("desc")}
                className={`px-2 py-1 rounded border text-xs ${
                  batterySort === "desc"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Bots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <BotCard key={b.id} bot={b} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
