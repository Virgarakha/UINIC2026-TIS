import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: "emerald" | "red" | "amber" | "blue" | "purple";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = "emerald",
  className,
}: StatCardProps) {
  const accentStyles = {
    emerald: "bg-[#0EB29A]/15 text-[#2E6E65] border-[#0EB29A]/30",
    red: "bg-red-500/10 text-red-600 border-red-500/20",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        {icon && <div className={cn("p-2 rounded-xl border", accentStyles[accentColor])}>{icon}</div>}
      </div>

      <div className="mt-3">
        <h4 className="text-2xl font-black tracking-tight text-[#2B3752]">{value}</h4>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
          <span className={trend.isPositive ? "text-[#0EB29A]" : "text-red-600"}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </span>
          <span className="text-slate-400 text-[11px]">vs minggu lalu</span>
        </div>
      )}
    </div>
  );
}
