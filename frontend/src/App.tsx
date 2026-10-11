import React, { useEffect, useState } from "react";
import { getHealth } from "./api/predictions";
import { AppHeader } from "./components/AppHeader";
import { AboutData } from "./pages/AboutData";
import { Dashboard } from "./pages/Dashboard";
import { ModelPerformance } from "./pages/ModelPerformance";

export function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "performance" | "methodology">("dashboard");
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(false);
  const [modelVersion, setModelVersion] = useState<string>("rf-v1.0");

  useEffect(() => {
    async function checkBackend() {
      try {
        const health = await getHealth();
        setIsBackendHealthy(health.status === "healthy");
        if (health.model_version) {
          setModelVersion(health.model_version);
        }
      } catch {
        setIsBackendHealthy(false);
      }
    }

    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* App Header */}
      <AppHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendHealthy={isBackendHealthy}
        modelVersion={modelVersion}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeTab === "dashboard" && <Dashboard modelVersion={modelVersion} />}
        {activeTab === "performance" && <ModelPerformance />}
        {activeTab === "methodology" && <AboutData />}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(170, 204, 214, 0.15)",
          padding: "1.25rem 2rem",
          background: "rgba(7, 14, 36, 0.95)",
          fontSize: "0.78rem",
          color: "#aaccd6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <span>Urban Flood Risk Prediction System &copy; 2026. Academic Decision-Support Prototype.</span>
          <span style={{ marginLeft: "0.5rem", color: "#4382df", fontWeight: 600 }}>Pilot: Greater Mumbai</span>
        </div>
        <div style={{ display: "flex", gap: "1.25rem" }}>
          <span>UN SDGs 11 &amp; 13</span>
          <span>MIT License</span>
          <span>OpenStreetMap &copy; Contributors</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
