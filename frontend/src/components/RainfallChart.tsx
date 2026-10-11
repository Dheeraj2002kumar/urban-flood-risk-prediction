import React from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RainfallHistoryItem } from "../types/prediction";

interface RainfallChartProps {
  data: RainfallHistoryItem[];
  locationName: string;
}

export const RainfallChart: React.FC<RainfallChartProps> = ({ data, locationName }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          padding: "2.5rem 1rem",
          textAlign: "center",
          color: "var(--text-dim)",
          fontSize: "0.85rem",
          background: "rgba(10, 22, 58, 0.35)",
          borderRadius: "8px",
          border: "1px dashed var(--border-subtle)",
        }}
      >
        No historical rainfall time-series telemetry recorded for this station.
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map((item) => ({
    date: item.date.slice(5), // MM-DD
    "24h Rain (mm)": item.rain_24h_mm,
    "1h Peak (mm)": item.rain_1h_mm,
    flood: item.flood_observed,
  }));

  return (
    <div style={{ width: "100%", height: "250px", marginTop: "0.4rem" }}>
      <div style={{ fontSize: "0.82rem", color: "var(--brand-mist)", marginBottom: "0.6rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>
          Monsoon Sequence &amp; Inundation Telemetry for <strong style={{ color: "#ffffff" }}>{locationName}</strong>
        </span>
        <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Past 14 Days</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="barRainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4382df" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#4647ae" stopOpacity={0.55} />
            </linearGradient>
            <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#aaccd6" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(170, 204, 214, 0.1)" vertical={false} />
          <XAxis dataKey="date" stroke="#aaccd6" fontSize={11} tickLine={false} axisLine={{ stroke: "rgba(170, 204, 214, 0.2)" }} />
          <YAxis stroke="#aaccd6" fontSize={11} unit="mm" tickLine={false} axisLine={{ stroke: "rgba(170, 204, 214, 0.2)" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(10, 22, 58, 0.95)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(67, 130, 223, 0.45)",
              borderRadius: "10px",
              color: "#f8fafc",
              fontSize: "12px",
              boxShadow: "0 10px 30px rgba(4, 8, 23, 0.8)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px", color: "#aaccd6" }} />
          <Bar dataKey="24h Rain (mm)" fill="url(#barRainGradient)" radius={[4, 4, 0, 0]} />
          <Line
            type="monotone"
            dataKey="1h Peak (mm)"
            stroke="url(#lineGlow)"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "#ffffff", stroke: "#4382df", strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: "#ffffff", stroke: "#4647ae", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
