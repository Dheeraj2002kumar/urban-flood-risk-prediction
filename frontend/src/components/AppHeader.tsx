import React from "react";
import { Activity, AlertTriangle, BarChart3, Database, Layers } from "lucide-react";

interface AppHeaderProps {
  activeTab: "dashboard" | "performance" | "methodology";
  setActiveTab: (tab: "dashboard" | "performance" | "methodology") => void;
  apiStatus?: "connecting" | "healthy" | "offline";
  isBackendHealthy?: boolean;
  modelVersion?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  setActiveTab,
  apiStatus,
  isBackendHealthy,
  modelVersion,
}) => {
  const status = apiStatus || (isBackendHealthy ? "healthy" : "offline");
  const statusColor = status === "healthy" ? "#10b981" : status === "connecting" ? "#4382df" : "#ef4444";
  const statusLabel = status === "healthy" ? "API Ready" : status === "connecting" ? "Connecting API..." : "API Offline (Waking)";
  return (
    <header className="glass-panel" style={{ margin: "1rem", padding: "1rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        
        {/* Brand & SDGs */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #112e81 0%, #4647ae 50%, #4382df 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 18px rgba(70, 71, 174, 0.45)",
              border: "1px solid rgba(170, 204, 214, 0.3)",
            }}
          >
            <Layers size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <h1 className="title-md gradient-text" style={{ fontSize: "1.3rem", margin: 0 }}>
                Urban Flood Risk Prediction
              </h1>
              <span
                style={{
                  fontSize: "0.7rem",
                  padding: "0.2rem 0.55rem",
                  borderRadius: "999px",
                  background: "rgba(17, 46, 129, 0.45)",
                  color: "#aaccd6",
                  border: "1px solid rgba(67, 130, 223, 0.4)",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                MUMBAI PILOT
              </span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "#aaccd6", marginTop: "2px", opacity: 0.9 }}>
              <strong style={{ color: "#aaccd6" }}>SDG 11</strong> Sustainable Cities & Communities |{" "}
              <strong style={{ color: "#4382df" }}>SDG 13</strong> Climate Action
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
            id="tab-dashboard"
          >
            <Activity size={16} />
            <span>Risk Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`nav-tab ${activeTab === "performance" ? "active" : ""}`}
            id="tab-performance"
          >
            <BarChart3 size={16} />
            <span>Model Performance</span>
          </button>
          <button
            onClick={() => setActiveTab("methodology")}
            className={`nav-tab ${activeTab === "methodology" ? "active" : ""}`}
            id="tab-methodology"
          >
            <Database size={16} />
            <span>Data & Methodology</span>
          </button>
        </nav>

        {/* Status indicator & Version */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              background: "rgba(17, 46, 129, 0.4)",
              padding: "0.4rem 0.8rem",
              borderRadius: "8px",
              border: "1px solid rgba(170, 204, 214, 0.2)",
              fontSize: "0.8rem",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: statusColor,
                boxShadow: `0 0 8px ${statusColor}`,
              }}
              className={status === "connecting" ? "live-beacon" : ""}
            />
            <span style={{ color: statusColor, fontWeight: 600 }}>
              {statusLabel}
            </span>
            {modelVersion && (
              <span style={{ color: "var(--text-dim)", marginLeft: "0.25rem", borderLeft: "1px solid rgba(170, 204, 214, 0.25)", paddingLeft: "0.5rem" }}>
                {modelVersion}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Advisory disclaimer banner */}
      <div
        style={{
          marginTop: "0.85rem",
          padding: "0.55rem 0.95rem",
          background: "linear-gradient(90deg, rgba(17, 46, 129, 0.35) 0%, rgba(70, 71, 174, 0.25) 100%)",
          border: "1px solid rgba(67, 130, 223, 0.35)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "0.55rem",
          fontSize: "0.78rem",
          color: "#aaccd6",
        }}
      >
        <AlertTriangle size={15} color="#4382df" style={{ flexShrink: 0 }} />
        <span>
          <strong style={{ color: "#ffffff" }}>Research Prototype:</strong> Estimates relative flood vulnerability based on terrain, drainage, and rainfall features.
          Not an official early warning service. Consult MCGM / IMD for official alerts.
        </span>
      </div>
    </header>
  );
};
