import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Globe, Layers, MapPin } from "lucide-react";
import type { AreaSummary, PredictionResponse } from "../types/prediction";

// Fix default Leaflet marker assets in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
  areas: AreaSummary[];
  selectedAreaId: string | null;
  onSelectArea: (areaId: string) => void;
  activePrediction: PredictionResponse | null;
}

type TileSource = "osm" | "satellite" | "topo";

const TILE_CONFIGS: Record<TileSource, { url: string; attribution: string; label: string; maxZoom: number }> = {
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    label: "Street Map (OSM)",
    maxZoom: 19,
  },
  topo: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, USGS",
    label: "Topographic Terrain",
    maxZoom: 18,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
    label: "Satellite Imagery",
    maxZoom: 18,
  },
};

export const MapView: React.FC<MapViewProps> = ({
  areas,
  selectedAreaId,
  onSelectArea,
  activePrediction,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [activeTileSource, setActiveTileSource] = useState<TileSource>("topo");

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Centered on Greater Mumbai (Mithi River corridor: 19.076, 72.8777)
    const map = L.map(mapContainerRef.current, {
      center: [19.076, 72.8777],
      zoom: 11,
      zoomControl: true,
      attributionControl: true,
      preferCanvas: true,
    });

    const cfg = TILE_CONFIGS[activeTileSource];
    const tileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      subdomains: ["a", "b", "c"],
      maxZoom: cfg.maxZoom,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tile layer when tile source changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = TILE_CONFIGS[activeTileSource];
    const newTileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      subdomains: ["a", "b", "c"],
      maxZoom: cfg.maxZoom,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
    tileLayerRef.current.bringToBack();
  }, [activeTileSource]);

  // Update area markers
  useEffect(() => {
    const layer = markersLayerRef.current;
    const map = mapInstanceRef.current;
    if (!layer || !map) return;

    layer.clearLayers();

    areas.forEach((area) => {
      const isSelected = area.location_id === selectedAreaId;

      let color = "#10b981"; // green low
      if (isSelected && activePrediction) {
        if (activePrediction.risk_class === "high") color = "#ef4444";
        else if (activePrediction.risk_class === "medium") color = "#f59e0b";
        else color = "#10b981";
      } else {
        if (area.elevation_m < 5.0 && area.drainage_index < 0.35) {
          color = "#ef4444"; // vulnerable low-lying
        } else if (area.elevation_m < 9.0) {
          color = "#f59e0b"; // moderate
        } else {
          color = "#10b981"; // well drained
        }
      }

      const marker = L.circleMarker([area.latitude, area.longitude], {
        radius: isSelected ? 13 : 8.5,
        fillColor: color,
        color: isSelected ? "#ffffff" : "#070e24",
        weight: isSelected ? 3.5 : 1.5,
        opacity: 1,
        fillOpacity: isSelected ? 0.95 : 0.85,
      });

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; line-height: 1.45; min-width: 210px; color: #f8fafc;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: #4382df; font-size: 13px;">${area.location_name}</strong>
            <span style="font-size: 10px; color: #aaccd6; background: rgba(17, 46, 129, 0.5); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(67, 130, 223, 0.3);">${area.zone}</span>
          </div>
          <div style="margin-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; color: #aaccd6;">
            <div>Elevation: <strong style="color: #ffffff;">${area.elevation_m}m</strong></div>
            <div>Slope: <strong style="color: #ffffff;">${area.slope_deg}°</strong></div>
            <div>Water Dist: <strong style="color: #ffffff;">${area.dist_water_m}m</strong></div>
            <div>Drainage: <strong style="color: #ffffff;">${area.drainage_index}</strong></div>
          </div>
          <div style="margin-top: 6px; font-size: 11px; color: #94a3b8; line-height: 1.3;">${area.description}</div>
          <button id="btn-select-${area.location_id}" style="
            margin-top: 10px; width: 100%; padding: 6px 10px; background: linear-gradient(135deg, #4647ae 0%, #4382df 100%);
            color: white; border: 1px solid rgba(170, 204, 214, 0.3); border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px;
            box-shadow: 0 4px 12px rgba(67, 130, 223, 0.35); transition: all 0.2s ease;
          ">Select This Station</button>
        </div>
      `);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`btn-select-${area.location_id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectArea(area.location_id);
            map.closePopup();
          };
        }
      });

      marker.on("click", () => {
        onSelectArea(area.location_id);
      });

      marker.addTo(layer);
    });

    map.invalidateSize();
  }, [areas, selectedAreaId, activePrediction, onSelectArea]);

  // Center smoothly on selected area
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedAreaId) return;

    const selected = areas.find((a) => a.location_id === selectedAreaId);
    if (selected) {
      map.flyTo([selected.latitude, selected.longitude], 13, {
        duration: 1.0,
      });
    }
  }, [selectedAreaId, areas]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "460px",
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid var(--border-medium)",
        background: "var(--bg-abyss)",
        boxShadow: "inset 0 0 20px rgba(4, 8, 23, 0.8)",
      }}
      id="geospatial-map-wrapper"
    >
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "460px",
        }}
      />

      {/* Floating Map HUD & Layer Switcher */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            background: "rgba(10, 22, 58, 0.92)",
            backdropFilter: "blur(14px)",
            border: "1px solid var(--border-medium)",
            borderRadius: "10px",
            padding: "4px",
            gap: "3px",
            boxShadow: "0 8px 24px rgba(4, 8, 23, 0.6)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTileSource("topo")}
            style={{
              padding: "5px 10px",
              fontSize: "11px",
              fontWeight: 600,
              fontFamily: "var(--font-display)",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: activeTileSource === "topo" ? "linear-gradient(135deg, #4647ae 0%, #4382df 100%)" : "transparent",
              color: activeTileSource === "topo" ? "#ffffff" : "#aaccd6",
              boxShadow: activeTileSource === "topo" ? "0 2px 8px rgba(67, 130, 223, 0.45)" : "none",
              transition: "all 0.18s ease",
            }}
          >
            Terrain
          </button>
          <button
            type="button"
            onClick={() => setActiveTileSource("osm")}
            style={{
              padding: "5px 10px",
              fontSize: "11px",
              fontWeight: 600,
              fontFamily: "var(--font-display)",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: activeTileSource === "osm" ? "linear-gradient(135deg, #4647ae 0%, #4382df 100%)" : "transparent",
              color: activeTileSource === "osm" ? "#ffffff" : "#aaccd6",
              boxShadow: activeTileSource === "osm" ? "0 2px 8px rgba(67, 130, 223, 0.45)" : "none",
              transition: "all 0.18s ease",
            }}
          >
            Street (OSM)
          </button>
          <button
            type="button"
            onClick={() => setActiveTileSource("satellite")}
            style={{
              padding: "5px 10px",
              fontSize: "11px",
              fontWeight: 600,
              fontFamily: "var(--font-display)",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: activeTileSource === "satellite" ? "linear-gradient(135deg, #4647ae 0%, #4382df 100%)" : "transparent",
              color: activeTileSource === "satellite" ? "#ffffff" : "#aaccd6",
              boxShadow: activeTileSource === "satellite" ? "0 2px 8px rgba(67, 130, 223, 0.45)" : "none",
              transition: "all 0.18s ease",
            }}
          >
            Satellite
          </button>
        </div>

        <div
          style={{
            background: "rgba(10, 22, 58, 0.92)",
            backdropFilter: "blur(14px)",
            border: "1px solid var(--border-medium)",
            borderRadius: "10px",
            padding: "6px 12px",
            fontSize: "11px",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            boxShadow: "0 8px 24px rgba(4, 8, 23, 0.6)",
          }}
        >
          <span className="live-beacon" />
          <span style={{ color: "#ffffff", fontWeight: 700, fontFamily: "var(--font-display)" }}>20 Stations</span>
        </div>
      </div>
    </div>
  );
};
