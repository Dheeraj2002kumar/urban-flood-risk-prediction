export interface FeatureInputs {
  rain_1h_mm: number;
  rain_24h_mm: number;
  rain_72h_mm: number;
  elevation_m: number;
  slope_deg: number;
  dist_water_m: number;
  impervious_pct: number;
  drainage_index: number;
}

export interface PredictionRequest {
  location_id: string;
  location_name?: string;
  features: FeatureInputs;
}

export type RiskClass = "low" | "medium" | "high";

export interface PredictionResponse {
  prediction_id: string;
  location_id: string;
  location_name: string;
  risk_class: RiskClass;
  risk_label: string;
  estimated_probability: number | null;
  binary_prediction: number;
  probability_is_calibrated: boolean;
  contributing_factors: string[];
  model_version: string;
  prediction_created_at: string;
  input_data_timestamp?: string;
  warnings: string[];
}

export interface AreaSummary {
  location_id: string;
  location_name: string;
  zone: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  slope_deg: number;
  dist_water_m: number;
  impervious_pct: number;
  drainage_index: number;
  description: string;
}

export interface RainfallHistoryItem {
  date: string;
  rain_1h_mm: number;
  rain_24h_mm: number;
  rain_72h_mm: number;
  flood_observed: number;
}

export interface ModelMetrics {
  model_name: string;
  test_samples: number;
  flood_prevalence_pct: number;
  precision: number;
  recall: number;
  f1_score: number;
  accuracy: number;
  pr_auc: number | null;
  roc_auc: number | null;
  brier_score: number | null;
  confusion_matrix: number[][];
}

export interface ModelComparisonItem {
  model_name: string;
  test_samples: number;
  precision: number;
  recall: number;
  f1_score: number;
  accuracy: number;
  pr_auc: number | null;
  roc_auc: number | null;
  brier_score: number | null;
  confusion_matrix: number[][];
}

export interface ModelInfo {
  model_version?: string;
  algorithm?: string;
  pilot_region?: string;
  created_at?: string;
  train_samples?: number;
  test_samples?: number;
  train_years?: string;
  held_out_test_year?: number;
  features?: string[];
  feature_importances?: { feature: string; importance: number }[];
  limitations?: string[];
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  model_loaded: boolean;
  model_version?: string;
  environment: string;
}

export interface IngestionFeed {
  id: string;
  name: string;
  provider: string;
  schedule_cron: string;
  interval_minutes: number;
  status: string;
  last_sync: string;
  next_sync: string;
  records_ingested_last_batch: number;
  data_types: string[];
  coverage: string;
}

export interface IngestionStatusResponse {
  status: string;
  scheduler_running: boolean;
  engine: string;
  total_feeds: number;
  total_records_ingested_24h: number;
  feeds: IngestionFeed[];
  system_time_utc: string;
}

export interface FeatureDriftItem {
  feature: string;
  display_name: string;
  psi_score: number;
  ks_statistic: number;
  p_value: number;
  status: string;
  drift_detected: boolean;
  threshold: number;
  baseline_mean: number;
  current_mean: number;
}

export interface DataQualityAudit {
  missing_value_pct: number;
  null_records_detected: number;
  schema_anomalies: number;
  outlier_rate_pct: number;
  integrity_score_pct: number;
  status: string;
  last_audited: string;
}

export interface DriftReportResponse {
  status: string;
  drift_overall_status: string;
  monitoring_window_days: number;
  evaluation_metric: string;
  feature_drift: FeatureDriftItem[];
  model_prediction_drift: {
    target: string;
    psi_score: number;
    ks_statistic: number;
    p_value: number;
    drift_detected: boolean;
    status: string;
    baseline_high_risk_share_pct: number;
    current_high_risk_share_pct: number;
    recommendation: string;
  };
  data_quality: DataQualityAudit;
  total_features_tracked: number;
  drifted_features_count: number;
  system_time_utc: string;
}

