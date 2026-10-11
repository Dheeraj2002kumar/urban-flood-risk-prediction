import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  MapPin,
  RefreshCw,
  Send,
  Sliders,
  TrendingUp,
} from "lucide-react";
import {
  getAreas,
  getRainfallHistory,
  predictFloodRisk,
} from "../api/predictions";
import { DataFreshness } from "../components/DataFreshness";
import { MapView } from "../components/MapView";
import { RainfallChart } from "../components/RainfallChart";
import { RiskBadge } from "../components/RiskBadge";
import { RiskLegend } from "../components/RiskLegend";
import type {
  AreaSummary,
  FeatureInputs,
  PredictionResponse,
  RainfallHistoryItem,
} from "../types/prediction";

interface DashboardProps {
  modelVersion?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ modelVersion }) => {
  const [areas, setAreas] = useState<AreaSummary[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("MUM-KURLA-01");
  const [rainfallHistory, setRainfallHistory] = useState<RainfallHistoryItem[]>([]);
  
  // Feature input state
  const [features, setFeatures] = useState<FeatureInputs>({
    rain_1h_mm: 45.0,
    rain_24h_mm: 175.0,
    rain_72h_mm: 290.0,
    elevation_m: 3.2,
    slope_deg: 0.8,
    dist_water_m: 120.0,
    impervious_pct: 88.5,
    drainage_index: 0.25,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load initial pilot locations
  useEffect(() => {
    async function loadInitial() {
      try {
        const areaList = await getAreas();
        setAreas(areaList);
        if (areaList.length > 0) {
          handleSelectArea(areaList[0].location_id, areaList);
        }
      } catch (err: any) {
        setErrorMessage(`Could not connect to API server: ${err.message}`);
      }
    }
    loadInitial();
  }, []);

  const handleSelectArea = async (areaId: string, currentAreas = areas) => {
    setSelectedAreaId(areaId);
    setErrorMessage(null);
    const area = currentAreas.find((a) => a.location_id === areaId);
    if (area) {
      setFeatures((prev) => ({
        ...prev,
        elevation_m: area.elevation_m,
        slope_deg: area.slope_deg,
        dist_water_m: area.dist_water_m,
        impervious_pct: area.impervious_pct,
        drainage_index: area.drainage_index,
      }));

      try {
        const hist = await getRainfallHistory(areaId);
        setRainfallHistory(hist);
      } catch {
        // non-blocking
      }
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    setErrorMessage(null);

    const selected = areas.find((a) => a.location_id === selectedAreaId);
    const locationName = selected ? selected.location_name : "Selected Location";

    try {
      const result = await predictFloodRisk({
        location_id: selectedAreaId,
        location_name: locationName,
        features: features,
      });
      setPrediction(result);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: "light" | "moderate" | "deluge" | "cloudburst") => {
    if (preset === "light") {
      setFeatures((prev) => ({
        ...prev,
        rain_1h_mm: 3.5,
        rain_24h_mm: 18.0,
        rain_72h_mm: 35.0,
      }));
    } else if (preset === "moderate") {
      setFeatures((prev) => ({
        ...prev,
        rain_1h_mm: 15.0,
        rain_24h_mm: 65.0,
        rain_72h_mm: 110.0,
      }));
    } else if (preset === "deluge") {
      setFeatures((prev) => ({
        ...prev,
        rain_1h_mm: 48.0,
        rain_24h_mm: 195.0,
        rain_72h_mm: 340.0,
      }));
    } else if (preset === "cloudburst") {
      setFeatures((prev) => ({
        ...prev,
        rain_1h_mm: 75.0,
        rain_24h_mm: 260.0,
        rain_72h_mm: 450.0,
      }));
    }
  };

  const selectedArea = areas.find((a) => a.location_id === selectedAreaId);

  return (
    <div style={{ padding: "0 1rem 2rem 1rem" }}>
      {/* Top metrics summary cards */}
      <DataFreshness
        pilotRegion="Greater Mumbai Metropolitan Area"
        modelVersion={modelVersion}
        totalLocations={areas.length || 20}
      />

      {/* Main Grid: Left Map + Chart | Right Controls & Results */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(350px, 1.25fr) minmax(320px, 1fr)",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        {/* Left Column: Map & Time Series */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Map Container */}
          <div className="glass-panel" style={{ padding: "1rem", minHeight: "440px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin size={18} color="#4382df" />
                <h2 className="title-md" style={{ fontSize: "1rem" }}>
                  Geospatial Study Map
                </h2>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#aaccd6" }}>
                Active: <strong style={{ color: "#ffffff" }}>{selectedArea?.location_name || selectedAreaId}</strong>
              </span>
            </div>

            <MapView
              areas={areas}
              selectedAreaId={selectedAreaId}
              onSelectArea={(id) => handleSelectArea(id)}
              activePrediction={prediction}
            />

            <div style={{ marginTop: "0.75rem" }}>
              <RiskLegend />
            </div>
          </div>

          {/* Historical Rainfall sequence */}
          <div className="glass-panel" style={{ padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <TrendingUp size={18} color="#4382df" />
              <h3 className="title-md" style={{ fontSize: "0.95rem" }}>
                Historical Rainfall Observations &amp; Inundation Record
              </h3>
            </div>
            <RainfallChart
              data={rainfallHistory}
              locationName={selectedArea?.location_name || selectedAreaId}
            />
          </div>
        </div>

        {/* Right Column: Prediction Controls & Risk Result Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {/* Feature Inputs Form */}
          <div className="glass-panel" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sliders size={18} color="#aaccd6" />
                <h2 className="title-md" style={{ fontSize: "1.05rem" }}>
                  Environmental Feature Parameters
                </h2>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#7f9bac" }}>
                8 Raw + 5 Domain
              </span>
            </div>

            {/* Location Selector */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.78rem", color: "#aaccd6", marginBottom: "0.35rem", fontWeight: 500 }}>
                Select Pilot Monitoring Station / Vulnerability Basin
              </label>
              <select
                className="input-field"
                value={selectedAreaId}
                onChange={(e) => handleSelectArea(e.target.value)}
                id="select-location"
                style={{ cursor: "pointer" }}
              >
                {areas.map((a) => (
                  <option key={a.location_id} value={a.location_id}>
                    {a.location_name} ({a.zone})
                  </option>
                ))}
              </select>
              {selectedArea && (
                <div style={{ fontSize: "0.75rem", color: "#aaccd6", marginTop: "4px", opacity: 0.85 }}>
                  {selectedArea.description}
                </div>
              )}
            </div>

            {/* Rainfall Simulation Presets */}
            <div style={{ marginBottom: "1.1rem" }}>
              <label style={{ display: "block", fontSize: "0.78rem", color: "#aaccd6", marginBottom: "0.4rem", fontWeight: 500 }}>
                Simulate Monsoon Rainfall Regimes:
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                  onClick={() => applyPreset("light")}
                >
                  🌦️ Light Shower (18mm)
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                  onClick={() => applyPreset("moderate")}
                >
                  🌧️ Moderate Rain (65mm)
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                  onClick={() => applyPreset("deluge")}
                >
                  ⛈️ Heavy Deluge (195mm)
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                  onClick={() => applyPreset("cloudburst")}
                >
                  🚨 Cloudburst (260mm)
                </button>
              </div>
            </div>

            {/* Numeric Feature Inputs Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#aaccd6", marginBottom: "2px" }}>
                  Rain 1-Hour Peak (mm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="250"
                  className="input-field"
                  value={features.rain_1h_mm}
                  onChange={(e) => setFeatures({ ...features, rain_1h_mm: parseFloat(e.target.value) || 0 })}
                  id="input-rain-1h"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#aaccd6", marginBottom: "2px" }}>
                  Rain 24-Hour Total (mm)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="800"
                  className="input-field"
                  value={features.rain_24h_mm}
                  onChange={(e) => setFeatures({ ...features, rain_24h_mm: parseFloat(e.target.value) || 0 })}
                  id="input-rain-24h"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#aaccd6", marginBottom: "2px" }}>
                  Rain 72-Hour Total (mm)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="1500"
                  className="input-field"
                  value={features.rain_72h_mm}
                  onChange={(e) => setFeatures({ ...features, rain_72h_mm: parseFloat(e.target.value) || 0 })}
                  id="input-rain-72h"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#aaccd6", marginBottom: "2px" }}>
                  Ground Elevation (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="100"
                  className="input-field"
                  value={features.elevation_m}
                  onChange={(e) => setFeatures({ ...features, elevation_m: parseFloat(e.target.value) || 0 })}
                  id="input-elevation"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#aaccd6", marginBottom: "2px" }}>
                  Surface Slope (deg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="45"
                  className="input-field"
                  value={features.slope_deg}
                  onChange={(e) => setFeatures({ ...features, slope_deg: parseFloat(e.target.value) || 0 })}
                  id="input-slope"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#aaccd6", marginBottom: "2px" }}>
                  Dist to Water Body (m)
                </label>
                <input
                  type="number"
                  step="10"
                  min="10"
                  max="20000"
                  className="input-field"
                  value={features.dist_water_m}
                  onChange={(e) => setFeatures({ ...features, dist_water_m: parseFloat(e.target.value) || 0 })}
                  id="input-dist-water"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#aaccd6", marginBottom: "2px" }}>
                  Impervious Surface (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="10"
                  max="100"
                  className="input-field"
                  value={features.impervious_pct}
                  onChange={(e) => setFeatures({ ...features, impervious_pct: parseFloat(e.target.value) || 0 })}
                  id="input-impervious"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#aaccd6", marginBottom: "2px" }}>
                  Drainage Index (0.0–1.0)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  max="1.0"
                  className="input-field"
                  value={features.drainage_index}
                  onChange={(e) => setFeatures({ ...features, drainage_index: parseFloat(e.target.value) || 0 })}
                  id="input-drainage"
                />
              </div>
            </div>

            {/* Error Message banner */}
            {errorMessage && (
              <div
                style={{
                  marginTop: "0.85rem",
                  padding: "0.65rem 0.85rem",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  borderRadius: "8px",
                  color: "#fca5a5",
                  fontSize: "0.78rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ marginTop: "1.25rem" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handlePredict}
                disabled={loading}
                id="btn-run-prediction"
                style={{ width: "100%", padding: "0.75rem" }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="spin-anim" />
                    <span>Evaluating Hydrological Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Request Model Prediction</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Prediction Result Display Card */}
          {prediction && (
            <div
              className="glass-panel"
              style={{
                padding: "1.25rem",
                border:
                  prediction.risk_class === "high"
                    ? "1px solid rgba(239, 68, 68, 0.6)"
                    : prediction.risk_class === "medium"
                    ? "1px solid rgba(245, 158, 11, 0.6)"
                    : "1px solid rgba(16, 185, 129, 0.6)",
                boxShadow:
                  prediction.risk_class === "high"
                    ? "0 0 25px rgba(239, 68, 68, 0.25)"
                    : prediction.risk_class === "medium"
                    ? "0 0 25px rgba(245, 158, 11, 0.25)"
                    : "0 0 25px rgba(16, 185, 129, 0.25)",
              }}
              id="prediction-result-panel"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#aaccd6", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                  Model Prediction Output
                </span>
                <span style={{ fontSize: "0.72rem", color: "#7f9bac" }}>
                  ID: {prediction.prediction_id.slice(0, 8)}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <h3 className="title-md" style={{ color: "#ffffff", fontSize: "1.2rem" }}>
                    {prediction.location_name}
                  </h3>
                  <div style={{ fontSize: "0.78rem", color: "#aaccd6", marginTop: "2px" }}>
                    Location ID:{" "}
                    <code
                      style={{
                        color: "#aaccd6",
                        background: "rgba(17, 46, 129, 0.5)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        border: "1px solid rgba(67, 130, 223, 0.3)",
                      }}
                    >
                      {prediction.location_id}
                    </code>
                  </div>
                </div>

                <RiskBadge riskClass={prediction.risk_class} size="lg" />
              </div>

              {/* Estimated Probability Progress Bar */}
              {prediction.estimated_probability !== null && (
                <div style={{ marginTop: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.35rem" }}>
                    <span style={{ color: "#aaccd6" }}>Calibrated Inundation Probability</span>
                    <strong style={{ color: "#ffffff" }}>
                      {(prediction.estimated_probability * 100).toFixed(1)}%
                    </strong>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "9px",
                      borderRadius: "999px",
                      background: "rgba(17, 46, 129, 0.5)",
                      border: "1px solid rgba(170, 204, 214, 0.15)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(0, prediction.estimated_probability * 100))}%`,
                        height: "100%",
                        background:
                          prediction.risk_class === "high"
                            ? "linear-gradient(90deg, #4382df 0%, #ef4444 100%)"
                            : prediction.risk_class === "medium"
                            ? "linear-gradient(90deg, #4647ae 0%, #f59e0b 100%)"
                            : "linear-gradient(90deg, #112e81 0%, #10b981 100%)",
                        borderRadius: "999px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Primary Contributing Factors */}
              <div style={{ marginTop: "1rem" }}>
                <span style={{ display: "block", fontSize: "0.76rem", color: "#aaccd6", marginBottom: "0.4rem", fontWeight: 600 }}>
                  Key Contributing Physical Factors:
                </span>
                <ul style={{ paddingLeft: "1.2rem", fontSize: "0.8rem", color: "#f1f5f9", lineHeight: 1.6 }}>
                  {prediction.contributing_factors.map((factor, idx) => (
                    <li key={idx}>{factor}</li>
                  ))}
                </ul>
              </div>

              {/* Prediction metadata */}
              <div
                style={{
                  marginTop: "1rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid rgba(170, 204, 214, 0.15)",
                  fontSize: "0.72rem",
                  color: "#aaccd6",
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  opacity: 0.85,
                }}
              >
                <span>Model: {prediction.model_version}</span>
                <span>Evaluated: {new Date(prediction.prediction_created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
