import * as React from "react";
import { getHazardInfo } from "@/config/hazards";
import { cn } from "@/lib/utils";

export interface HazardBadgeProps {
  hazard?: string | null;
  className?: string;
  showIcon?: boolean;
}

export function HazardBadge({ hazard, className, showIcon = true }: HazardBadgeProps) {
  const info = getHazardInfo(hazard);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors shadow-xs",
        info.colorClass.bg,
        info.colorClass.text,
        info.colorClass.border,
        className
      )}
      title={info.description}
    >
      {showIcon && <span className="text-xs leading-none">{info.iconText}</span>}
      <span>{info.shortName}</span>
    </span>
  );
}
