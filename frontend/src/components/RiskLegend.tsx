import React from "react";
import { Info } from "lucide-react";

export const RiskLegend: React.FC = () => {
  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.85)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "8px",
        padding: "0.65rem 0.85rem",
        fontSize: "0.78rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
        <Info size={14} color="#38bdf8" />
        <span style={{ fontWeight: 600, color: "var(--text-main)" }}>Modelled Risk Classification Scale</span>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: "#34d399" }}>Low Risk</div>
            <div style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}>Prob &lt; 0.35</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: "#fbbf24" }}>Medium Risk</div>
            <div style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}>0.35 - 0.65</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: "#f87171" }}>High Risk</div>
            <div style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}>Prob &gt; 0.65</div>
          </div>
        </div>
      </div>
    </div>
  );
};
