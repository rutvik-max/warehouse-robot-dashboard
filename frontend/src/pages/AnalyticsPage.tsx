// frontend/src/pages/AnalyticsPage.tsx
import React, { useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/card";
import { useDataStore } from "../state/useDataStore";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

export default function AnalyticsPage() {
  const bots = useDataStore((s) => s.bots);
  const tasks = useDataStore((s) => s.tasks);
  const loading = useDataStore((s) => s.loading);

  const tasksTimeSeries = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    const map = new Map<string, number>();
    tasks.forEach((t) => {
      const key = new Date(t.createdAt).toISOString().substr(0, 16);
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort()
      .map(([k, v]) => ({ time: k.replace("T", " "), count: v }));
  }, [tasks]);

  const statusDistribution = useMemo(() => {
    const map: Record<string, number> = { idle: 0, busy: 0, charging: 0, error: 0 };
    bots.forEach((b) => (map[b.status] = (map[b.status] ?? 0) + 1));
    return [
      { name: "Idle", value: map.idle },
      { name: "Busy", value: map.busy },
      { name: "Charging", value: map.charging },
      { name: "Error", value: map.error },
    ];
  }, [bots]);

  const batteryBuckets = useMemo(() => {
    const buckets = [
      { name: "0-20", count: 0 },
      { name: "21-50", count: 0 },
      { name: "51-80", count: 0 },
      { name: "81-100", count: 0 },
    ];
    bots.forEach((b) => {
      const v = b.battery ?? 0;
      if (v <= 20) buckets[0].count++;
      else if (v <= 50) buckets[1].count++;
      else if (v <= 80) buckets[2].count++;
      else buckets[3].count++;
    });
    return buckets;
  }, [bots]);

  const COLORS = ["#60A5FA", "#A78BFA", "#FBBF24", "#F87171"];

  // helper small wrapper style to ensure Recharts can measure
  const chartWrapperStyle: React.CSSProperties = {
    width: "100%",
    height: 280,
    minWidth: 0, // important for flex/grid children
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold mb-2">Tasks over time</h3>

            {/* Give a fixed-height container so ResponsiveContainer can measure */}
            <div style={chartWrapperStyle}>
              {tasksTimeSeries.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-slate-500">No task data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tasksTimeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tickFormatter={(d) => String(d).slice(11, 16)} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-3 text-sm text-slate-500">{loading ? "Loading…" : `Total tasks: ${tasks.length}`}</div>
          </Card>

          <div className="space-y-4">
            <Card>
              <h3 className="text-lg font-semibold mb-2">Bot status distribution</h3>
              <div style={{ width: "100%", height: 220, minWidth: 0 }}>
                {bots.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-slate-500">No bots</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusDistribution} dataKey="value" nameKey="name" outerRadius={80} label>
                        {statusDistribution.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend layout="horizontal" verticalAlign="bottom" />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-2">Battery levels</h3>
              <div style={{ width: "100%", height: 220, minWidth: 0 }}>
                {bots.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-slate-500">No bots</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={batteryBuckets}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#60A5FA" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>
        </div>

        <Card>
          <h3 className="text-lg font-semibold mb-2">Design notes</h3>
          <p className="text-sm text-slate-600">Charts show task flow and fleet health. Use them to detect surges, spot charging needs, and identify error spikes.</p>
        </Card>
      </div>
    </MainLayout>
  );
}
