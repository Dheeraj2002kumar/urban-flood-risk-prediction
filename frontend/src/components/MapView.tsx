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
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey",
    label: "Topographic Terrain",
    maxZoom: 18,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
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
  }, [activeTileSource]);

  // Update hotspot markers when areas or selected hotspot change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    areas.forEach((area) => {
      const isSelected = area.location_id === selectedAreaId;

      // Color coding: prediction result if active, or baseline topographical vulnerability
      let color = "#38bdf8"; // default blue
      if (isSelected && activePrediction) {
        if (activePrediction.risk_class === "high") color = "#ef4444";
        else if (activePrediction.risk_class === "medium") color = "#f59e0b";
        else color = "#10b981";
      } else {
        if (area.elevation_m < 3.5 || area.drainage_index < 0.3) {
          color = "#ef4444"; // high vulnerability basin
        } else if (area.elevation_m < 8.0) {
          color = "#f59e0b"; // moderate
        } else {
          color = "#10b981"; // well drained
        }
      }

      const marker = L.circleMarker([area.latitude, area.longitude], {
        radius: isSelected ? 13 : 8.5,
        fillColor: color,
        color: isSelected ? "#ffffff" : "#0f172a",
        weight: isSelected ? 3.5 : 1.5,
        opacity: 1,
        fillOpacity: isSelected ? 0.95 : 0.85,
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; min-width: 200px;">
          <strong style="color: #0284c7; font-size: 13px;">${area.location_name}</strong>
          <div style="color: #64748b; margin: 4px 0;">Zone: <strong>${area.zone}</strong></div>
          <div style="margin-top: 4px; display: flex; justify-content: space-between;">
            <span>Elev: <strong>${area.elevation_m}m</strong></span>
            <span>Slope: <strong>${area.slope_deg}°</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 2px;">
            <span>Water Dist: <strong>${area.dist_water_m}m</strong></span>
            <span>Drainage: <strong>${area.drainage_index}</strong></span>
          </div>
          <div style="margin-top: 6px; font-size: 11px; color: #475569; line-height: 1.3;">${area.description}</div>
          <button id="btn-select-${area.location_id}" style="
            margin-top: 8px; width: 100%; padding: 5px 8px; background: #0284c7; color: white;
            border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 11px;
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
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid var(--border-subtle)",
        background: "#0a0f1d",
      }}
      id="geospatial-map-wrapper"
    >
      <div
        ref={mapContainerRef}
        id="leaflet-study-map"
        style={{
          width: "100%",
          height: "100%",
          minHeight: "460px",
        }}
      />

      {/* Map layer switcher controls */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(10px)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "8px",
            padding: "3px",
            gap: "2px",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTileSource("topo")}
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              background: activeTileSource === "topo" ? "#0284c7" : "transparent",
              color: activeTileSource === "topo" ? "#ffffff" : "#94a3b8",
              transition: "all 0.15s ease",
            }}
          >
            Terrain
          </button>
          <button
            type="button"
            onClick={() => setActiveTileSource("osm")}
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              background: activeTileSource === "osm" ? "#0284c7" : "transparent",
              color: activeTileSource === "osm" ? "#ffffff" : "#94a3b8",
              transition: "all 0.15s ease",
            }}
          >
            Street (OSM)
          </button>
          <button
            type="button"
            onClick={() => setActiveTileSource("satellite")}
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              background: activeTileSource === "satellite" ? "#0284c7" : "transparent",
              color: activeTileSource === "satellite" ? "#ffffff" : "#94a3b8",
              transition: "all 0.15s ease",
            }}
          >
            Satellite
          </button>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(8px)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "8px",
            padding: "5px 10px",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}
        >
          <span style={{ color: "#38bdf8", fontWeight: 600 }}>20 Stations</span>
        </div>
      </div>
    </div>
  );
};
