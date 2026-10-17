import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost" | "glow";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-[#0EB29A] hover:bg-[#0ca18b] text-white shadow-md shadow-[#0EB29A]/25 focus-visible:ring-[#0EB29A]",
      secondary:
        "bg-slate-100 hover:bg-slate-200 text-[#2B3752] focus-visible:ring-slate-400",
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 focus-visible:ring-red-500",
      outline:
        "border border-slate-200 bg-white hover:bg-slate-50 text-[#2B3752] focus-visible:ring-slate-400",
      ghost:
        "hover:bg-slate-100 text-[#2B3752] focus-visible:ring-slate-400",
      glow:
        "bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white shadow-lg shadow-[#0EB29A]/30 hover:shadow-[#0EB29A]/50 hover:brightness-105 border border-[#0EB29A]/40 focus-visible:ring-[#0EB29A]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
