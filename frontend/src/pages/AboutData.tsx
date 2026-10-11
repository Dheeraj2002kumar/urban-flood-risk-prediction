import React from "react";
import {
  Database,
  ExternalLink,
  FileText,
  Globe,
  ShieldAlert,
} from "lucide-react";

export const AboutData: React.FC = () => {
  return (
    <div style={{ padding: "0 1.5rem 3rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Title */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 className="title-lg gradient-text">Data Provenance, Methodology &amp; Responsible Use</h2>
        <p style={{ color: "#aaccd6", fontSize: "0.88rem", marginTop: "4px" }}>
          Transparent documentation of pilot datasets, physical feature definitions, SDG alignment, and operational constraints.
        </p>
      </div>

      {/* Critical Responsible Use Banner */}
      <div
        className="glass-panel"
        style={{
          padding: "1.25rem",
          border: "1px solid rgba(67, 130, 223, 0.4)",
          background: "linear-gradient(90deg, rgba(17, 46, 129, 0.45) 0%, rgba(70, 71, 174, 0.3) 100%)",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <ShieldAlert size={22} color="#4382df" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#ffffff" }}>
              Educational Research Prototype — Non-Operational Advisory
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#aaccd6", marginTop: "4px", lineHeight: 1.5 }}>
              This system is an academic decision-support tool created to model relative urban flood vulnerability across
              the Greater Mumbai pilot region. <strong style={{ color: "#ffffff" }}>It is NOT an official early-warning service and must not be used as the sole basis
              for emergency, rescue, or evacuation decisions.</strong>
            </p>
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.8rem" }}>
              <a
                href="https://mausam.imd.gov.in/"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#aaccd6", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 600 }}
              >
                India Meteorological Department (IMD) <ExternalLink size={12} />
              </a>
              <a
                href="https://dm.mcgm.gov.in/"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#aaccd6", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 600 }}
              >
                MCGM Disaster Management Portal <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Provenance Catalog */}
      <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Database size={18} color="#4382df" />
          <h3 className="title-md" style={{ color: "#ffffff" }}>Primary Dataset Catalog</h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(170, 204, 214, 0.2)", color: "#aaccd6" }}>
                <th style={{ padding: "0.6rem 0.5rem" }}>Theme</th>
                <th style={{ padding: "0.6rem 0.5rem" }}>Candidate Public Source</th>
                <th style={{ padding: "0.6rem 0.5rem" }}>Temporal / Spatial Resolution</th>
                <th style={{ padding: "0.6rem 0.5rem" }}>License &amp; Access</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid rgba(170, 204, 214, 0.08)" }}>
                <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600, color: "#ffffff" }}>Precipitation</td>
                <td style={{ padding: "0.75rem 0.5rem" }}>India Meteorological Department (IMD) &amp; Municipal AWS</td>
                <td style={{ padding: "0.75rem 0.5rem", color: "#aaccd6" }}>Hourly / 24-Hour Station Observations</td>
                <td style={{ padding: "0.75rem 0.5rem", color: "#4382df", fontWeight: 600 }}>Open Government Data (OGD) India</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(170, 204, 214, 0.08)" }}>
                <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600, color: "#ffffff" }}>Topography &amp; Elevation</td>
                <td style={{ padding: "0.75rem 0.5rem" }}>Copernicus DEM (30m) &amp; Bhuvan NRSC</td>
                <td style={{ padding: "0.75rem 0.5rem", color: "#aaccd6" }}>30-metre Grid, WGS84 vertical datum</td>
                <td style={{ padding: "0.75rem 0.5rem", color: "#4382df", fontWeight: 600 }}>Copernicus Open Access / NRSC</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(170, 204, 214, 0.08)" }}>
                <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600, color: "#ffffff" }}>Hydrology &amp; Waterways</td>
                <td style={{ padding: "0.75rem 0.5rem" }}>OpenStreetMap (OSM) Waterways &amp; Mithi River Basin</td>
                <td style={{ padding: "0.75rem 0.5rem", color: "#aaccd6" }}>Vector Line/Polygon Features</td>
                <td style={{ padding: "0.75rem 0.5rem", color: "#4382df", fontWeight: 600 }}>ODbL Attribution Required</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(170, 204, 214, 0.08)" }}>
                <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600, color: "#ffffff" }}>Urban Land Cover</td>
                <td style={{ padding: "0.75rem 0.5rem" }}>ESA WorldCover (10m)</td>
                <td style={{ padding: "0.75rem 0.5rem", color: "#aaccd6" }}>10-metre Impervious Surface Map</td>
                <td style={{ padding: "0.75rem 0.5rem", color: "#4382df", fontWeight: 600 }}>CC-BY 4.0 International</td>
              </tr>
              <tr>
                <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600, color: "#ffffff" }}>Historical Inundation</td>
                <td style={{ padding: "0.75rem 0.5rem" }}>MCGM Monsoon Waterlogging Hotspot Inventory</td>
                <td style={{ padding: "0.75rem 0.5rem", color: "#aaccd6" }}>Chronic Flood Incident Locations (2018–2023)</td>
                <td style={{ padding: "0.75rem 0.5rem", color: "#4382df", fontWeight: 600 }}>Civic Public Disclosures</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Definitions Table */}
      <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <FileText size={18} color="#aaccd6" />
          <h3 className="title-md" style={{ color: "#ffffff" }}>Feature Dictionary &amp; Units</h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(170, 204, 214, 0.2)", color: "#aaccd6" }}>
                <th style={{ padding: "0.6rem 0.5rem" }}>Feature Name</th>
                <th style={{ padding: "0.6rem 0.5rem" }}>Type / Unit</th>
                <th style={{ padding: "0.6rem 0.5rem" }}>Description &amp; Physical Rationale</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid rgba(170, 204, 214, 0.08)" }}>
                <td style={{ padding: "0.65rem 0.5rem", fontWeight: 600, color: "#aaccd6" }}>rain_1h_mm</td>
                <td style={{ padding: "0.65rem 0.5rem" }}>Float (mm)</td>
                <td style={{ padding: "0.65rem 0.5rem", color: "#aaccd6" }}>Short-duration cloudburst intensity during peak hour.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(170, 204, 214, 0.08)" }}>
                <td style={{ padding: "0.65rem 0.5rem", fontWeight: 600, color: "#aaccd6" }}>rain_24h_mm</td>
                <td style={{ padding: "0.65rem 0.5rem" }}>Float (mm)</td>
                <td style={{ padding: "0.65rem 0.5rem", color: "#aaccd6" }}>Cumulative 24-hour daily monsoon deluge accumulation.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(170, 204, 214, 0.08)" }}>
                <td style={{ padding: "0.65rem 0.5rem", fontWeight: 600, color: "#aaccd6" }}>rain_72h_mm</td>
                <td style={{ padding: "0.65rem 0.5rem" }}>Float (mm)</td>
                <td style={{ padding: "0.65rem 0.5rem", color: "#aaccd6" }}>Antecedent 3-day precipitation determining ground saturation.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(170, 204, 214, 0.08)" }}>
                <td style={{ padding: "0.65rem 0.5rem", fontWeight: 600, color: "#4382df" }}>elevation_m</td>
                <td style={{ padding: "0.65rem 0.5rem" }}>Float (metres)</td>
                <td style={{ padding: "0.65rem 0.5rem", color: "#aaccd6" }}>Surface elevation above mean sea level; lower elevation collects runoff.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(170, 204, 214, 0.08)" }}>
                <td style={{ padding: "0.65rem 0.5rem", fontWeight: 600, color: "#4382df" }}>slope_deg</td>
                <td style={{ padding: "0.65rem 0.5rem" }}>Float (degrees)</td>
                <td style={{ padding: "0.65rem 0.5rem", color: "#aaccd6" }}>Local terrain slope; flat gradients (&lt;1°) delay stormwater discharge.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(170, 204, 214, 0.08)" }}>
                <td style={{ padding: "0.65rem 0.5rem", fontWeight: 600, color: "#4382df" }}>dist_water_m</td>
                <td style={{ padding: "0.65rem 0.5rem" }}>Float (metres)</td>
                <td style={{ padding: "0.65rem 0.5rem", color: "#aaccd6" }}>Distance to Mithi river, Mahim Creek, or Arabian sea outfall.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(170, 204, 214, 0.08)" }}>
                <td style={{ padding: "0.65rem 0.5rem", fontWeight: 600, color: "#8b9bf7" }}>impervious_pct</td>
                <td style={{ padding: "0.65rem 0.5rem" }}>Float (0–100%)</td>
                <td style={{ padding: "0.65rem 0.5rem", color: "#aaccd6" }}>Percentage of concrete, asphalt, and roof coverage preventing infiltration.</td>
              </tr>
              <tr>
                <td style={{ padding: "0.65rem 0.5rem", fontWeight: 600, color: "#8b9bf7" }}>drainage_index</td>
                <td style={{ padding: "0.65rem 0.5rem" }}>Float (0.0–1.0)</td>
                <td style={{ padding: "0.65rem 0.5rem", color: "#aaccd6" }}>Relative stormwater culvert and pumping maintenance capacity.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sustainable Development Goals Section */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <Globe size={18} color="#4382df" />
          <h3 className="title-md" style={{ color: "#ffffff" }}>Alignment with United Nations Sustainable Development Goals</h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div
            style={{
              background: "rgba(17, 46, 129, 0.35)",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid rgba(67, 130, 223, 0.3)",
            }}
          >
            <h4 style={{ color: "#ffffff", fontSize: "0.95rem", fontWeight: 600 }}>
              SDG 11: Sustainable Cities &amp; Communities
            </h4>
            <p style={{ fontSize: "0.78rem", color: "#aaccd6", marginTop: "4px", lineHeight: 1.5 }}>
              Target 11.5: By 2030, significantly reduce the number of deaths and people affected by disasters,
              including water-related disasters, with a focus on protecting the vulnerable and reducing economic losses.
            </p>
          </div>

          <div
            style={{
              background: "rgba(70, 71, 174, 0.25)",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid rgba(70, 71, 174, 0.4)",
            }}
          >
            <h4 style={{ color: "#ffffff", fontSize: "0.95rem", fontWeight: 600 }}>
              SDG 13: Climate Action
            </h4>
            <p style={{ fontSize: "0.78rem", color: "#aaccd6", marginTop: "4px", lineHeight: 1.5 }}>
              Target 13.1: Strengthen resilience and adaptive capacity to climate-related hazards and natural disasters
              in all urban settlements through transparent data science and vulnerability modeling.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
