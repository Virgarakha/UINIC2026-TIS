import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "info" | "purple" | "outline";
  hasDot?: boolean;
}

export function Badge({ className, variant = "default", hasDot = false, children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-[#0EB29A]/15 text-[#2E6E65] border-[#0EB29A]/30",
    secondary: "bg-slate-100 text-[#2B3752] border-slate-200",
    success: "bg-[#0EB29A]/20 text-[#2E6E65] border-[#0EB29A]/40",
    warning: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    danger: "bg-red-500/15 text-red-700 border-red-500/30",
    info: "bg-blue-500/15 text-blue-700 border-blue-500/30",
    purple: "bg-purple-500/15 text-purple-700 border-purple-500/30",
    outline: "bg-transparent text-[#2B3752] border-slate-300",
  };

  const dotColors = {
    default: "bg-[#0EB29A]",
    secondary: "bg-slate-400",
    success: "bg-[#0EB29A]",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    purple: "bg-purple-500",
    outline: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {hasDot && (
        <span className="relative flex h-2 w-2">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", dotColors[variant])} />
          <span className={cn("relative inline-flex rounded-full h-2 w-2", dotColors[variant])} />
        </span>
      )}
      {children}
    </span>
  );
}
