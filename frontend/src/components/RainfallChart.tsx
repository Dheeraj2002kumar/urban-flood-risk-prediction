import React, { useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
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
  const [chartMode, setChartMode] = useState<"combined" | "cumulative" | "intensity">("combined");

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

  // Calculate cumulative precipitation & peak stats
  let cumulative = 0;
  let peak24h = 0;
  let floodCount = 0;

  const chartData = data.map((item) => {
    cumulative += item.rain_24h_mm;
    if (item.rain_24h_mm > peak24h) peak24h = item.rain_24h_mm;
    if (item.flood_observed) floodCount++;

    return {
      date: item.date.slice(5), // MM-DD
      "24h Rain (mm)": item.rain_24h_mm,
      "1h Peak (mm)": item.rain_1h_mm,
      "Cumulative Rain (mm)": Math.round(cumulative * 10) / 10,
      flood: item.flood_observed,
    };
  });

  return (
    <div style={{ width: "100%", marginTop: "0.4rem" }}>
      {/* Header and View Mode Switcher */}
      <div
        style={{
          fontSize: "0.82rem",
          color: "var(--brand-mist)",
          marginBottom: "0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>
            Telemetry Sequence for <strong style={{ color: "#ffffff" }}>{locationName}</strong>
          </span>
        </div>

        {/* View mode toggle tabs */}
        <div
          style={{
            display: "inline-flex",
            background: "rgba(10, 22, 58, 0.6)",
            borderRadius: "6px",
            padding: "2px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <button
            type="button"
            onClick={() => setChartMode("combined")}
            style={{
              padding: "3px 8px",
              fontSize: "0.68rem",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              background: chartMode === "combined" ? "var(--brand-accent)" : "transparent",
              color: chartMode === "combined" ? "#ffffff" : "var(--brand-mist)",
              fontWeight: chartMode === "combined" ? 600 : 400,
              transition: "all 0.15s ease",
            }}
          >
            24h vs 1h Peak
          </button>
          <button
            type="button"
            onClick={() => setChartMode("cumulative")}
            style={{
              padding: "3px 8px",
              fontSize: "0.68rem",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              background: chartMode === "cumulative" ? "var(--brand-accent)" : "transparent",
              color: chartMode === "cumulative" ? "#ffffff" : "var(--brand-mist)",
              fontWeight: chartMode === "cumulative" ? 600 : 400,
              transition: "all 0.15s ease",
            }}
          >
            Cumulative Curve
          </button>
          <button
            type="button"
            onClick={() => setChartMode("intensity")}
            style={{
              padding: "3px 8px",
              fontSize: "0.68rem",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              background: chartMode === "intensity" ? "var(--brand-accent)" : "transparent",
              color: chartMode === "intensity" ? "#ffffff" : "var(--brand-mist)",
              fontWeight: chartMode === "intensity" ? 600 : 400,
              transition: "all 0.15s ease",
            }}
          >
            Peak Intensity
          </button>
        </div>
      </div>

      {/* Summary Stat Badges */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        <div
          style={{
            background: "rgba(17, 46, 129, 0.25)",
            border: "1px solid rgba(67, 130, 223, 0.25)",
            borderRadius: "6px",
            padding: "0.4rem 0.6rem",
          }}
        >
          <div style={{ fontSize: "0.66rem", color: "var(--brand-mist)" }}>14-Day Cumulative</div>
          <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#ffffff" }}>
            {Math.round(cumulative)} <span style={{ fontSize: "0.7rem", fontWeight: 400 }}>mm</span>
          </div>
        </div>
        <div
          style={{
            background: "rgba(17, 46, 129, 0.25)",
            border: "1px solid rgba(67, 130, 223, 0.25)",
            borderRadius: "6px",
            padding: "0.4rem 0.6rem",
          }}
        >
          <div style={{ fontSize: "0.66rem", color: "var(--brand-mist)" }}>Peak 24h Rainfall</div>
          <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#38bdf8" }}>
            {Math.round(peak24h)} <span style={{ fontSize: "0.7rem", fontWeight: 400 }}>mm</span>
          </div>
        </div>
        <div
          style={{
            background: floodCount > 0 ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
            border: `1px solid ${floodCount > 0 ? "rgba(239, 68, 68, 0.35)" : "rgba(16, 185, 129, 0.35)"}`,
            borderRadius: "6px",
            padding: "0.4rem 0.6rem",
          }}
        >
          <div style={{ fontSize: "0.66rem", color: floodCount > 0 ? "#fca5a5" : "#6ee7b7" }}>
            Historical Flood Events
          </div>
          <div
            style={{
              fontSize: "0.92rem",
              fontWeight: 700,
              color: floodCount > 0 ? "#ef4444" : "#10b981",
            }}
          >
            {floodCount} <span style={{ fontSize: "0.7rem", fontWeight: 400 }}>inundations</span>
          </div>
        </div>
      </div>

      {/* Main Responsive Recharts View */}
      <div style={{ width: "100%", height: "230px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="barRainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4382df" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#4647ae" stopOpacity={0.55} />
              </linearGradient>
              <linearGradient id="cumulGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(170, 204, 214, 0.1)" vertical={false} />
            <XAxis dataKey="date" stroke="#aaccd6" fontSize={11} tickLine={false} axisLine={{ stroke: "rgba(170, 204, 214, 0.2)" }} />
            <YAxis stroke="#aaccd6" fontSize={11} unit="mm" tickLine={false} axisLine={{ stroke: "rgba(170, 204, 214, 0.2)" }} />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload;
                  return (
                    <div
                      style={{
                        backgroundColor: "rgba(10, 22, 58, 0.95)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(67, 130, 223, 0.45)",
                        borderRadius: "10px",
                        padding: "0.6rem 0.8rem",
                        color: "#f8fafc",
                        fontSize: "12px",
                        boxShadow: "0 10px 30px rgba(4, 8, 23, 0.8)",
                      }}
                    >
                      <div style={{ fontWeight: 600, color: "#ffffff", marginBottom: "4px" }}>
                        Date: {label}
                      </div>
                      <div style={{ color: "#38bdf8" }}>24h Total: {dataPoint["24h Rain (mm)"]} mm</div>
                      <div style={{ color: "#f59e0b" }}>1h Peak: {dataPoint["1h Peak (mm)"]} mm/h</div>
                      <div style={{ color: "#06b6d4" }}>Cumulative: {dataPoint["Cumulative Rain (mm)"]} mm</div>
                      {dataPoint.flood === 1 && (
                        <div style={{ marginTop: "4px", color: "#ef4444", fontWeight: 700, fontSize: "11px" }}>
                          🚨 Flood Inundation Recorded
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px", color: "#aaccd6" }} />

            {/* IMD Severe Alert Threshold Marker at 64.5 mm */}
            <ReferenceLine
              y={64.5}
              stroke="rgba(245, 158, 11, 0.65)"
              strokeDasharray="4 4"
              label={{ value: "IMD Heavy (64.5mm)", fill: "#f59e0b", fontSize: 9, position: "top" }}
            />

            {chartMode === "combined" && (
              <>
                <Bar dataKey="24h Rain (mm)" fill="url(#barRainGradient)" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="1h Peak (mm)"
                  stroke="url(#lineGlow)"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: "#ffffff", stroke: "#ef4444", strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: "#ffffff", stroke: "#f59e0b", strokeWidth: 2 }}
                />
              </>
            )}

            {chartMode === "cumulative" && (
              <Area
                type="monotone"
                dataKey="Cumulative Rain (mm)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fill="url(#cumulGradient)"
                dot={{ r: 3, fill: "#06b6d4" }}
              />
            )}

            {chartMode === "intensity" && (
              <Bar dataKey="1h Peak (mm)" fill="url(#lineGlow)" radius={[4, 4, 0, 0]} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
