import type {
  AreaSummary,
  DriftReportResponse,
  HealthStatus,
  IngestionStatusResponse,
  ModelComparisonItem,
  ModelInfo,
  ModelMetrics,
  PredictionRequest,
  PredictionResponse,
  RainfallHistoryItem,
} from "../types/prediction";

const isVercel = typeof window !== "undefined" && window.location.hostname.endsWith("vercel.app");
const rawBase = import.meta.env.VITE_API_BASE_URL;

// On Vercel, use same-origin Edge Proxy ("") to bypass ISP/DNS/adblock cross-origin restrictions
const API_BASE_URL = isVercel
  ? ""
  : rawBase
  ? rawBase.replace(/\/+$/, "")
  : import.meta.env.DEV
  ? "http://127.0.0.1:8000"
  : "";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorMsg = typeof errorJson.detail === "string" ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function getHealth(): Promise<HealthStatus> {
  return request<HealthStatus>("/health");
}

export async function getAreas(): Promise<AreaSummary[]> {
  return request<AreaSummary[]>("/api/v1/areas");
}

export async function getAreaDetail(locationId: string): Promise<AreaSummary> {
  return request<AreaSummary>(`/api/v1/areas/${encodeURIComponent(locationId)}`);
}

export async function getRainfallHistory(locationId: string): Promise<RainfallHistoryItem[]> {
  return request<RainfallHistoryItem[]>(`/api/v1/areas/${encodeURIComponent(locationId)}/rainfall-history`);
}

export async function getAreaGeoJSON(): Promise<any> {
  return request<any>("/api/v1/areas/geojson");
}

export async function predictFloodRisk(req: PredictionRequest): Promise<PredictionResponse> {
  return request<PredictionResponse>("/api/v1/predictions", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function getModelInfo(): Promise<ModelInfo> {
  return request<ModelInfo>("/api/v1/model-info");
}

export async function getModelMetrics(): Promise<ModelMetrics> {
  return request<ModelMetrics>("/api/v1/metrics");
}

export async function getModelComparison(): Promise<ModelComparisonItem[]> {
  return request<ModelComparisonItem[]>("/api/v1/metrics/comparison");
}

export async function getIngestionStatus(): Promise<IngestionStatusResponse> {
  return request<IngestionStatusResponse>("/api/v1/ingestion/status");
}

export async function triggerIngestionSync(feedId?: string): Promise<any> {
  const url = feedId ? `/api/v1/ingestion/trigger?feed_id=${encodeURIComponent(feedId)}` : "/api/v1/ingestion/trigger";
  return request<any>(url, { method: "POST" });
}

export async function getDriftReport(): Promise<DriftReportResponse> {
  return request<DriftReportResponse>("/api/v1/drift/report");
}

