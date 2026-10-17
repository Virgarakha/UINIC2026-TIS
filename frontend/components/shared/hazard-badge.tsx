import * as React from "react";
import { getHazardInfo } from "@/config/hazards";
import { cn } from "@/lib/utils";
import { Trash2, AlertTriangle, Flame, Biohazard, ShieldAlert, AlertOctagon } from "lucide-react";

export interface HazardBadgeProps {
  hazard?: string | null;
  className?: string;
  showIcon?: boolean;
}

const HAZARD_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  banjir: Trash2,
  wabah: AlertTriangle,
  kebakaran: Flame,
  bau: Biohazard,
  longsor: AlertTriangle,
  jalan: AlertOctagon,
  publik: ShieldAlert,
};

export function HazardBadge({ hazard, className, showIcon = true }: HazardBadgeProps) {
  const info = getHazardInfo(hazard);
  const IconComp = (hazard && HAZARD_ICON_MAP[hazard.toLowerCase()]) || Trash2;

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
      {showIcon && <IconComp className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{info.shortName}</span>
    </span>
  );
}
