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
          padding: "2rem",
          textAlign: "center",
          color: "#7f9bac",
          fontSize: "0.85rem",
        }}
      >
        No rainfall time-series data available for this location.
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
    <div style={{ width: "100%", height: "240px", marginTop: "0.5rem" }}>
      <div style={{ fontSize: "0.82rem", color: "#aaccd6", marginBottom: "0.5rem" }}>
        Recent Monsoon Rainfall Sequence &amp; Flood Inundation Markers for{" "}
        <strong style={{ color: "#ffffff" }}>{locationName}</strong>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(170, 204, 214, 0.12)" />
          <XAxis dataKey="date" stroke="#aaccd6" fontSize={11} tickLine={false} />
          <YAxis stroke="#aaccd6" fontSize={11} unit="mm" tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0c183d",
              borderColor: "rgba(67, 130, 223, 0.45)",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "12px",
              boxShadow: "0 8px 24px rgba(7, 14, 36, 0.7)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px", color: "#aaccd6" }} />
          <Bar dataKey="24h Rain (mm)" fill="#4382df" radius={[4, 4, 0, 0]} opacity={0.9} />
          <Line
            type="monotone"
            dataKey="1h Peak (mm)"
            stroke="#aaccd6"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "#aaccd6" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
