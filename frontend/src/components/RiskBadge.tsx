import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { RiskClass } from "../types/prediction";

interface RiskBadgeProps {
  riskClass: RiskClass;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  riskClass,
  size = "md",
  showIcon = true,
}) => {
  const configs = {
    low: {
      label: "LOW RISK",
      className: "badge-risk-low",
      icon: <CheckCircle2 size={size === "lg" ? 18 : 14} />,
      description: "Low probability of stormwater inundation",
    },
    medium: {
      label: "MEDIUM RISK",
      className: "badge-risk-med",
      icon: <AlertTriangle size={size === "lg" ? 18 : 14} />,
      description: "Moderate waterlogging vulnerability",
    },
    high: {
      label: "HIGH RISK",
      className: "badge-risk-high",
      icon: <AlertCircle size={size === "lg" ? 18 : 14} />,
      description: "Severe urban flood potential",
    },
  };

  const current = configs[riskClass] || configs.low;

  const fontSizes = {
    sm: "0.72rem",
    md: "0.82rem",
    lg: "0.95rem",
  };

  const paddings = {
    sm: "0.2rem 0.5rem",
    md: "0.3rem 0.75rem",
    lg: "0.45rem 1rem",
  };

  return (
    <span
      className={current.className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: paddings[size],
        fontSize: fontSizes[size],
        fontWeight: 700,
        borderRadius: "999px",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
      title={current.description}
      aria-label={`${current.label}: ${current.description}`}
    >
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
};
