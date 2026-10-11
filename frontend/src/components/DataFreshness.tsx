import React from "react";
import { Activity, Calendar, CheckCircle2, Cpu, MapPin } from "lucide-react";

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
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1rem",
        marginBottom: "1.25rem",
      }}
    >
      {/* Pilot Region Card */}
      <div className="glass-panel" style={{ padding: "1.1rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="caption-label">PILOT STUDY REGION</span>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(67, 130, 223, 0.18)",
              border: "1px solid rgba(67, 130, 223, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MapPin size={16} color="#4382df" />
          </div>
        </div>
        <div className="title-md" style={{ color: "#ffffff", marginTop: "0.5rem", fontSize: "1.15rem" }}>
          {pilotRegion}
        </div>
        <div style={{ fontSize: "0.78rem", color: "var(--brand-blue)", marginTop: "4px", fontWeight: 600 }}>
          {totalLocations} Calibrated Hotspots &amp; Basin Wards
        </div>
      </div>

      {/* Model Version Card */}
      <div className="glass-panel" style={{ padding: "1.1rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="caption-label">PRODUCTION PIPELINE</span>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(70, 71, 174, 0.22)",
              border: "1px solid rgba(70, 71, 174, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Cpu size={16} color="#8b9bf7" />
          </div>
        </div>
        <div className="title-md" style={{ color: "#ffffff", marginTop: "0.5rem", fontSize: "1.15rem" }}>
          {modelVersion}
        </div>
        <div style={{ fontSize: "0.78rem", color: "var(--brand-mist)", marginTop: "4px" }}>
          Random Forest (91.0% Recall) + XGBoost
        </div>
      </div>

      {/* Data Validation Card */}
      <div className="glass-panel" style={{ padding: "1.1rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="caption-label">DATA COVERAGE &amp; TEST SPLIT</span>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(67, 130, 223, 0.18)",
              border: "1px solid rgba(67, 130, 223, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Calendar size={16} color="#4382df" />
          </div>
        </div>
        <div className="title-md" style={{ color: "#ffffff", marginTop: "0.5rem", fontSize: "1.15rem" }}>
          2018 – 2023 Monsoons
        </div>
        <div style={{ fontSize: "0.78rem", color: "var(--brand-mist)", marginTop: "4px" }}>
          Held-Out 2023 Season (Zero Data Leakage)
        </div>
      </div>

      {/* Governance & Status Card */}
      <div className="glass-panel" style={{ padding: "1.1rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="caption-label">GOVERNANCE &amp; HEALTH</span>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(16, 185, 129, 0.18)",
              border: "1px solid rgba(16, 185, 129, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle2 size={16} color="#10b981" />
          </div>
        </div>
        <div className="title-md" style={{ color: "#ffffff", marginTop: "0.5rem", fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "6px" }}>
          <span>Ready &amp; Calibrated</span>
          <span className="live-beacon" />
        </div>
        <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: "4px" }}>
          Sub-50ms Inference • Non-Operational
        </div>
      </div>
    </div>
  );
};
