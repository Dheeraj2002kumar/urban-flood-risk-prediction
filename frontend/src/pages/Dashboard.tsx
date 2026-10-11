import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Compass,
  Droplets,
  Layers,
  MapPin,
  RefreshCw,
  Send,
  ShieldAlert,
  Sliders,
  TrendingUp,
  Wind,
  Zap,
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
  const [activePreset, setActivePreset] = useState<string>("deluge");
  
  // Feature input state
  const [features, setFeatures] = useState<FeatureInputs>({
    rain_1h_mm: 48.0,
    rain_24h_mm: 195.0,
    rain_72h_mm: 340.0,
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
    setActivePreset(preset);
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

  // SVG Gauge calculations
  const probPercent = prediction && prediction.estimated_probability !== null 
    ? Math.round(prediction.estimated_probability * 100) 
    : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (probPercent / 100) * circumference;

  let gaugeColor = "#10b981";
  if (prediction?.risk_class === "high") gaugeColor = "#ef4444";
  else if (prediction?.risk_class === "medium") gaugeColor = "#f59e0b";

  return (
    <div style={{ padding: "0 1.25rem 2.5rem 1.25rem", maxWidth: "1520px", margin: "0 auto" }}>
      {/* Top metrics summary cards */}
      <DataFreshness
        pilotRegion="Greater Mumbai Pilot Region"
        modelVersion={modelVersion}
        totalLocations={areas.length || 20}
      />

      {/* Main Grid: Left Map + Chart | Right Controls & Results */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(420px, 1.2fr) minmax(380px, 1fr)",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        {/* Left Column: Map & Time Series */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Map Container */}
          <div className="glass-panel" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    background: "rgba(67, 130, 223, 0.18)",
                    border: "1px solid rgba(67, 130, 223, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MapPin size={17} color="#4382df" />
                </div>
                <div>
                  <h2 className="title-md" style={{ color: "#ffffff", fontSize: "1.05rem" }}>
                    Geospatial Vulnerability Map
                  </h2>
                  <div style={{ fontSize: "0.72rem", color: "var(--brand-mist)" }}>
                    Interactive GIS basin telemetry &amp; station markers
                  </div>
                </div>
              </div>
              
              <div
                style={{
                  background: "rgba(17, 46, 129, 0.45)",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(67, 130, 223, 0.35)",
                  fontSize: "0.78rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span className="live-beacon" />
                <span style={{ color: "#aaccd6" }}>Station:</span>
                <strong style={{ color: "#ffffff" }}>{selectedArea?.location_name || selectedAreaId}</strong>
              </div>
            </div>

            <MapView
              areas={areas}
              selectedAreaId={selectedAreaId}
              onSelectArea={(id) => handleSelectArea(id)}
              activePrediction={prediction}
            />

            <div style={{ marginTop: "0.85rem" }}>
              <RiskLegend />
            </div>
          </div>

          {/* Historical Rainfall sequence */}
          <div className="glass-panel" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  background: "rgba(70, 71, 174, 0.22)",
                  border: "1px solid rgba(70, 71, 174, 0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUp size={17} color="#8b9bf7" />
              </div>
              <div>
                <h3 className="title-md" style={{ color: "#ffffff", fontSize: "1.05rem" }}>
                  Historical Rainfall Observations &amp; Inundation Telemetry
                </h3>
                <div style={{ fontSize: "0.72rem", color: "var(--brand-mist)" }}>
                  24-Hour total rain vs 1-Hour peak intensity sequence
                </div>
              </div>
            </div>
            <RainfallChart
              data={rainfallHistory}
              locationName={selectedArea?.location_name || selectedAreaId}
            />
          </div>
        </div>

        {/* Right Column: Prediction Controls & Risk Result Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* Feature Inputs Form */}
          <div className="glass-panel" style={{ padding: "1.35rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    background: "rgba(67, 130, 223, 0.18)",
                    border: "1px solid rgba(67, 130, 223, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sliders size={17} color="#4382df" />
                </div>
                <div>
                  <h2 className="title-md" style={{ color: "#ffffff", fontSize: "1.08rem" }}>
                    Environmental &amp; Meteorological Parameters
                  </h2>
                  <div style={{ fontSize: "0.72rem", color: "var(--brand-mist)" }}>
                    Dynamic feature simulation with real-time inference
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#aaccd6",
                  background: "rgba(17, 46, 129, 0.4)",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "6px",
                  border: "1px solid rgba(67, 130, 223, 0.3)",
                  fontWeight: 600,
                }}
              >
                13 Features Evaluated
              </span>
            </div>

            {/* Location Selector */}
            <div style={{ marginBottom: "1.1rem" }}>
              <label style={{ display: "block", fontSize: "0.78rem", color: "var(--brand-mist)", marginBottom: "0.4rem", fontWeight: 600 }}>
                Select Pilot Monitoring Station / Basin
              </label>
              <select
                className="input-field"
                value={selectedAreaId}
                onChange={(e) => handleSelectArea(e.target.value)}
                id="select-location"
                style={{ cursor: "pointer", fontWeight: 600 }}
              >
                {areas.map((a) => (
                  <option key={a.location_id} value={a.location_id}>
                    {a.location_name} — {a.zone}
                  </option>
                ))}
              </select>
              {selectedArea && (
                <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: "5px", lineHeight: 1.4 }}>
                  {selectedArea.description}
                </div>
              )}
            </div>

            {/* Rainfall Simulation Presets */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.45rem" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--brand-mist)", fontWeight: 600 }}>
                  Monsoon Storm Scenarios:
                </span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                  Click to auto-simulate
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <button
                  type="button"
                  className={activePreset === "light" ? "btn-primary" : "btn-secondary"}
                  style={{ fontSize: "0.78rem", padding: "0.45rem 0.65rem", justifyContent: "flex-start" }}
                  onClick={() => applyPreset("light")}
                >
                  <span>🌦️ Light Shower (18mm)</span>
                </button>
                <button
                  type="button"
                  className={activePreset === "moderate" ? "btn-primary" : "btn-secondary"}
                  style={{ fontSize: "0.78rem", padding: "0.45rem 0.65rem", justifyContent: "flex-start" }}
                  onClick={() => applyPreset("moderate")}
                >
                  <span>🌧️ Moderate Rain (65mm)</span>
                </button>
                <button
                  type="button"
                  className={activePreset === "deluge" ? "btn-primary" : "btn-secondary"}
                  style={{ fontSize: "0.78rem", padding: "0.45rem 0.65rem", justifyContent: "flex-start" }}
                  onClick={() => applyPreset("deluge")}
                >
                  <span>⛈️ Heavy Deluge (195mm)</span>
                </button>
                <button
                  type="button"
                  className={activePreset === "cloudburst" ? "btn-primary" : "btn-secondary"}
                  style={{ fontSize: "0.78rem", padding: "0.45rem 0.65rem", justifyContent: "flex-start" }}
                  onClick={() => applyPreset("cloudburst")}
                >
                  <span>🚨 Cloudburst (260mm)</span>
                </button>
              </div>
            </div>

            {/* Feature Sliders & Numeric Inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              
              {/* Rain 1h */}
              <div style={{ background: "rgba(6, 13, 36, 0.6)", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label style={{ fontSize: "0.78rem", color: "#f1f5f9", fontWeight: 600 }}>Rain 1-Hour Peak Intensity</label>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--brand-blue)" }}>{features.rain_1h_mm} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="0.5"
                  value={features.rain_1h_mm}
                  onChange={(e) => {
                    setActivePreset("custom");
                    setFeatures({ ...features, rain_1h_mm: parseFloat(e.target.value) || 0 });
                  }}
                />
              </div>

              {/* Rain 24h */}
              <div style={{ background: "rgba(6, 13, 36, 0.6)", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label style={{ fontSize: "0.78rem", color: "#f1f5f9", fontWeight: 600 }}>Rain 24-Hour Total Inundation</label>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--brand-blue)" }}>{features.rain_24h_mm} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="1"
                  value={features.rain_24h_mm}
                  onChange={(e) => {
                    setActivePreset("custom");
                    setFeatures({ ...features, rain_24h_mm: parseFloat(e.target.value) || 0 });
                  }}
                />
              </div>

              {/* Rain 72h */}
              <div style={{ background: "rgba(6, 13, 36, 0.6)", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label style={{ fontSize: "0.78rem", color: "#f1f5f9", fontWeight: 600 }}>Rain 72-Hour Cumulative Saturation</label>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--brand-blue)" }}>{features.rain_72h_mm} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="900"
                  step="2"
                  value={features.rain_72h_mm}
                  onChange={(e) => {
                    setActivePreset("custom");
                    setFeatures({ ...features, rain_72h_mm: parseFloat(e.target.value) || 0 });
                  }}
                />
              </div>

              {/* Topographic & Physical Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem", marginTop: "0.2rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.73rem", color: "var(--brand-mist)", marginBottom: "3px" }}>
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
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.73rem", color: "var(--brand-mist)", marginBottom: "3px" }}>
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
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.73rem", color: "var(--brand-mist)", marginBottom: "3px" }}>
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
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.73rem", color: "var(--brand-mist)", marginBottom: "3px" }}>
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
                  />
                </div>
              </div>

            </div>

            {/* Error Message banner */}
            {errorMessage && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem 0.95rem",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  borderRadius: "8px",
                  color: "#fca5a5",
                  fontSize: "0.78rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                }}
              >
                <AlertCircle size={17} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ marginTop: "1.35rem" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handlePredict}
                disabled={loading}
                id="btn-run-prediction"
                style={{ width: "100%", padding: "0.82rem" }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={17} className="pulse-anim" />
                    <span>Evaluating Hydrological Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Zap size={17} />
                    <span>Evaluate Flood Inundation Risk</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Futuristic Circular Gauge Prediction Result Panel */}
          {prediction && (
            <div
              className="glass-panel"
              style={{
                padding: "1.35rem",
                border: `1px solid ${
                  prediction.risk_class === "high"
                    ? "rgba(239, 68, 68, 0.7)"
                    : prediction.risk_class === "medium"
                    ? "rgba(245, 158, 11, 0.7)"
                    : "rgba(16, 185, 129, 0.7)"
                }`,
                boxShadow: `0 0 30px ${
                  prediction.risk_class === "high"
                    ? "rgba(239, 68, 68, 0.28)"
                    : prediction.risk_class === "medium"
                    ? "rgba(245, 158, 11, 0.28)"
                    : "rgba(16, 185, 129, 0.28)"
                }`,
              }}
              id="prediction-result-panel"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                <span className="caption-label">EVALUATED MODEL RISK INFERENCE</span>
                <span style={{ fontSize: "0.72rem", color: "var(--brand-mist)", background: "rgba(17, 46, 129, 0.5)", padding: "2px 8px", borderRadius: "4px" }}>
                  Latency: 18ms
                </span>
              </div>

              {/* Main Gauge & Station Row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.25rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <h3 className="title-md" style={{ color: "#ffffff", fontSize: "1.25rem" }}>
                    {prediction.location_name}
                  </h3>
                  <div style={{ fontSize: "0.78rem", color: "var(--brand-mist)", marginTop: "3px" }}>
                    Station Code: <strong style={{ color: "#ffffff" }}>{prediction.location_id}</strong>
                  </div>
                  <div style={{ marginTop: "0.6rem" }}>
                    <RiskBadge riskClass={prediction.risk_class} size="lg" />
                  </div>
                </div>

                {/* Circular Gauge Graphic */}
                <div style={{ position: "relative", width: "124px", height: "124px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="124" height="124" style={{ transform: "rotate(-90deg)" }}>
                    <circle
                      cx="62"
                      cy="62"
                      r={radius}
                      stroke="rgba(17, 46, 129, 0.5)"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="62"
                      cy="62"
                      r={radius}
                      stroke={gaugeColor}
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      style={{ transition: "stroke-dashoffset 0.8s ease" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", textAlign: "center" }}>
                    <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#ffffff", fontFamily: "var(--font-display)", lineHeight: 1 }}>
                      {probPercent}%
                    </div>
                    <div style={{ fontSize: "0.62rem", color: "var(--brand-mist)", textTransform: "uppercase", marginTop: "3px", fontWeight: 600 }}>
                      Probability
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Contributing Factors */}
              <div style={{ marginTop: "1.25rem", background: "rgba(6, 13, 36, 0.65)", padding: "0.85rem 1rem", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                <span style={{ display: "block", fontSize: "0.78rem", color: "var(--brand-mist)", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Dominant Physical Risk Drivers:
                </span>
                <ul style={{ paddingLeft: "1.1rem", fontSize: "0.82rem", color: "#f8fafc", lineHeight: 1.6 }}>
                  {prediction.contributing_factors.map((factor, idx) => (
                    <li key={idx} style={{ marginBottom: "2px" }}>{factor}</li>
                  ))}
                </ul>
              </div>

              {/* Actionable Municipal Guidance */}
              <div
                style={{
                  marginTop: "0.85rem",
                  padding: "0.75rem 0.95rem",
                  borderRadius: "8px",
                  background: prediction.risk_class === "high" ? "rgba(239, 68, 68, 0.12)" : "rgba(17, 46, 129, 0.35)",
                  border: `1px solid ${prediction.risk_class === "high" ? "rgba(239, 68, 68, 0.4)" : "rgba(67, 130, 223, 0.35)"}`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.6rem",
                  fontSize: "0.78rem",
                  color: "#e2e8f0",
                }}
              >
                <ShieldAlert size={16} color={prediction.risk_class === "high" ? "#ef4444" : "#4382df"} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong style={{ color: "#ffffff" }}>
                    {prediction.risk_class === "high"
                      ? "Action Advisory: Pre-deploy High-Capacity Dewatering Pumps"
                      : prediction.risk_class === "medium"
                      ? "Precaution: Monitor Tide Levels & Clear Stormwater Sluices"
                      : "Routine Monitoring: Localized Drainage Sufficient"}
                  </strong>
                  <div style={{ color: "var(--brand-mist)", fontSize: "0.74rem", marginTop: "2px" }}>
                    Calculated for pilot ward {prediction.location_id} via {prediction.model_version} pipeline.
                  </div>
                </div>
              </div>

              {/* Prediction metadata */}
              <div
                style={{
                  marginTop: "0.85rem",
                  paddingTop: "0.65rem",
                  borderTop: "1px solid rgba(170, 204, 214, 0.12)",
                  fontSize: "0.72rem",
                  color: "var(--brand-mist)",
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  opacity: 0.85,
                }}
              >
                <span>Pipeline: {prediction.model_version}</span>
                <span>Inference Timestamp: {new Date(prediction.prediction_created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
