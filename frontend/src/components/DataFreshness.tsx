import React from "react";
import { Calendar, CheckCircle2, Cpu, MapPin } from "lucide-react";

interface DataFreshnessProps {
  pilotRegion?: string;
  modelVersion?: string;
  totalLocations: number;
}

export const DataFreshness: React.FC<DataFreshnessProps> = ({
  pilotRegion = "Greater Mumbai Pilot Region",
  modelVersion = "rf-v1.0",
  totalLocations = 20,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "0.85rem",
        marginBottom: "1rem",
      }}
    >
      {/* Pilot Region Card */}
      <div className="glass-panel" style={{ padding: "0.9rem 1.15rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#aaccd6", fontSize: "0.78rem" }}>
          <MapPin size={16} color="#4382df" />
          <span style={{ fontWeight: 600, letterSpacing: "0.03em" }}>PILOT STUDY REGION</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: "1.05rem", marginTop: "0.3rem", color: "#ffffff" }}>
          {pilotRegion}
        </div>
        <div style={{ fontSize: "0.74rem", color: "#4382df", marginTop: "2px", fontWeight: 500 }}>
          {totalLocations} Calibrated Hotspots &amp; Wards
        </div>
      </div>

      {/* Model Version Card */}
      <div className="glass-panel" style={{ padding: "0.9rem 1.15rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#aaccd6", fontSize: "0.78rem" }}>
          <Cpu size={16} color="#8b9bf7" />
          <span style={{ fontWeight: 600, letterSpacing: "0.03em" }}>PRODUCTION PIPELINE</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: "1.05rem", marginTop: "0.3rem", color: "#ffffff" }}>
          {modelVersion}
        </div>
        <div style={{ fontSize: "0.74rem", color: "#aaccd6", marginTop: "2px" }}>
          RandomForest + XGBoost Benchmark
        </div>
      </div>

      {/* Data Validation Card */}
      <div className="glass-panel" style={{ padding: "0.9rem 1.15rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#aaccd6", fontSize: "0.78rem" }}>
          <Calendar size={16} color="#4382df" />
          <span style={{ fontWeight: 600, letterSpacing: "0.03em" }}>DATA COVERAGE</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: "1.05rem", marginTop: "0.3rem", color: "#ffffff" }}>
          2018 – 2023 Monsoons
        </div>
        <div style={{ fontSize: "0.74rem", color: "#aaccd6", marginTop: "2px" }}>
          2023 Held-Out Untouched Test Split
        </div>
      </div>

      {/* Governance & Status Card */}
      <div className="glass-panel" style={{ padding: "0.9rem 1.15rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#aaccd6", fontSize: "0.78rem" }}>
          <CheckCircle2 size={16} color="#34d399" />
          <span style={{ fontWeight: 600, letterSpacing: "0.03em" }}>STATUS &amp; GOVERNANCE</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: "1.05rem", marginTop: "0.3rem", color: "#ffffff" }}>
          Validated Prototype
        </div>
        <div style={{ fontSize: "0.74rem", color: "#7f9bac", marginTop: "2px" }}>
          Decision Support (Non-Operational)
        </div>
      </div>
    </div>
  );
};
