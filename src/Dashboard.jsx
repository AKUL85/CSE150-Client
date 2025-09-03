import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { getReports, getStats } from "./api";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const load = async () => {
      const r = await getReports();
      const s = await getStats();
      setReports(r.data || []);
      setStats(s.data || null);
    };
    load();
  }, []);

  if (!stats) return <div>Loading dashboard…</div>;

  // Pie chart data for sectors
  const pieData = {
    labels: Object.keys(stats.sector_counts || {}),
    datasets: [
      {
        data: Object.values(stats.sector_counts || {}),
        backgroundColor: ["#ef4444","#facc15","#3b82f6","#10b981","#8b5cf6","#f97316"],
      },
    ],
  };

  // Bar chart for reports over time (simplified: count per day)
  const dateCounts = {};
  reports.forEach(r => {
    const d = r.timestamp ? r.timestamp.slice(0,10) : "unknown";
    dateCounts[d] = (dateCounts[d] || 0) + 1;
  });

  const barData = {
    labels: Object.keys(dateCounts),
    datasets: [
      {
        label: "Reports per Day",
        data: Object.values(dateCounts),
        backgroundColor: "#2563eb",
      },
    ],
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard</h2>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        <div style={{ width: 300 }}><Pie data={pieData} /></div>
        <div style={{ width: 500 }}><Bar data={barData} /></div>
      </div>
    </div>
  );
}
