"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, ShieldAlert } from "lucide-react";
import { MOCK_PERINGATAN_DINI } from "@/lib/api-client";
import { PeringatanDini } from "@/types";

export function LiveAlertTicker() {
  const [alerts] = React.useState<PeringatanDini[]>(MOCK_PERINGATAN_DINI);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (alerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [alerts.length]);

  if (!alerts.length) return null;

  const currentAlert = alerts[currentIndex];

  const levelColor =
    currentAlert.level_peringatan === "AWAS"
      ? "bg-red-600 text-white"
      : currentAlert.level_peringatan === "SIAGA"
      ? "bg-amber-500 text-white"
      : "bg-yellow-400 text-slate-900";

  return (
    <div className="relative z-40 bg-white text-[#2B3752] text-xs border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
        {/* Left Indicator */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="font-extrabold uppercase tracking-wider text-[11px] text-red-600 flex items-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5" />
            Live Siaga
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${levelColor}`}>
            {currentAlert.level_peringatan}
          </span>
        </div>

        {/* Center Alert Message Slider */}
        <div className="flex-1 truncate text-slate-600 font-medium">
          <span className="font-bold text-[#2B3752] mr-1.5">[{currentAlert.tipe_bahaya}]:</span>
          <span>{currentAlert.pesan_broadcast}</span>
        </div>

        {/* Right CTA */}
        <Link
          href="/peringatan"
          className="flex-shrink-0 flex items-center gap-1 font-semibold text-[#0EB29A] hover:text-[#2E6E65] transition-colors text-[11px] ml-2"
        >
          Lihat Peta Radius
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
