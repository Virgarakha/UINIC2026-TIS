"use client";

import * as React from "react";
import {
  AlertTriangle,
  Flame,
  Waves,
  Crosshair,
  Volume2,
  ChevronRight,
  ChevronLeft,
  X,
  ChevronDown,
} from "lucide-react";
import { PeringatanDini } from "@/types";
import { cn } from "@/lib/utils";
import { voiceNavigator } from "@/lib/voice-navigation";

interface EarlyWarningBannerProps {
  warnings: PeringatanDini[];
  onFlyToHazard: (warning: PeringatanDini) => void;
  className?: string;
}

export function EarlyWarningBanner({
  warnings,
  onFlyToHazard,
  className,
}: EarlyWarningBannerProps) {
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [isMinimized, setIsMinimized] = React.useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = React.useState<boolean>(false);

  // Subscribe to voice speaker states
  React.useEffect(() => {
    return voiceNavigator.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
  }, []);

  if (!warnings || warnings.length === 0) return null;

  const currentWarning = warnings[currentIndex] || warnings[0];
  const total = warnings.length;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handlePlayVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    const loc =
      currentWarning.laporan?.alamat_lokasi ||
      (currentWarning.id === 1 ? "Pintu Air Sungai Brantas, Klojen, Malang" : "Kota Malang");

    voiceNavigator.announceEmergencyWarning(
      currentWarning.level_peringatan,
      currentWarning.tipe_bahaya,
      loc,
      currentWarning.radius_terdampak_meter
    );
  };

  const getHazardIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("banjir") || t.includes("air") || t.includes("luapan")) {
      return <Waves className="h-4 w-4" />;
    }
    if (t.includes("api") || t.includes("gas") || t.includes("metana") || t.includes("bakar")) {
      return <Flame className="h-4 w-4" />;
    }
    return <AlertTriangle className="h-4 w-4" />;
  };

  const levelColor = {
    AWAS: {
      border: "border-rose-400 bg-rose-50/95",
      badge: "bg-rose-500 text-white shadow-rose-500/30",
      text: "text-rose-950",
      subtext: "text-rose-700",
      btn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30",
    },
    SIAGA: {
      border: "border-amber-400 bg-amber-50/95",
      badge: "bg-amber-500 text-white shadow-amber-500/30",
      text: "text-amber-950",
      subtext: "text-amber-700",
      btn: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30",
    },
    WASPADA: {
      border: "border-yellow-400 bg-yellow-50/95",
      badge: "bg-yellow-500 text-slate-900 shadow-yellow-500/30",
      text: "text-yellow-950",
      subtext: "text-yellow-800",
      btn: "bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-600/30",
    },
  }[currentWarning.level_peringatan] || {
    border: "border-rose-400 bg-rose-50/95",
    badge: "bg-rose-500 text-white shadow-rose-500/30",
    text: "text-rose-950",
    subtext: "text-rose-700",
    btn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30",
  };

  // Minimized Pill Mode
  if (isMinimized) {
    return (
      <div
        className={cn(
          "absolute top-[114px] sm:top-4 right-4 sm:right-6 z-20 animate-in fade-in slide-in-from-top-2 duration-200",
          className
        )}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow-xl shadow-rose-500/40 hover:scale-105 transition-all cursor-pointer border-2 border-white"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>
            {total} Peringatan Bencana ({currentWarning.level_peringatan})
          </span>
          <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-80" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute top-[114px] sm:top-4 left-4 sm:left-auto sm:right-6 z-20 w-[calc(100vw-32px)] sm:w-[470px] animate-in fade-in slide-in-from-top-3 duration-300",
        className
      )}
    >
      <div
        className={cn(
          "p-3 sm:p-3.5 rounded-2xl shadow-2xl backdrop-blur-md border transition-all relative overflow-hidden",
          levelColor.border
        )}
      >
        {/* Animated Emergency Beacon Background Effect */}
        <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-rose-400/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Left: Hazard Level Badge & Message */}
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div
              className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-md relative",
                levelColor.badge
              )}
            >
              {getHazardIcon(currentWarning.tipe_bahaya)}
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md shadow-xs",
                    levelColor.badge
                  )}
                >
                  STATUS {currentWarning.level_peringatan}
                </span>
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                  <span>{currentWarning.tipe_bahaya}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-rose-600 font-extrabold">
                    Radius {currentWarning.radius_terdampak_meter}m
                  </span>
                </span>
              </div>

              <p className={cn("text-xs font-semibold leading-snug line-clamp-2 mt-0.5", levelColor.text)}>
                {currentWarning.pesan_broadcast}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-1.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-rose-200/60">
            {/* Fly to epicenter button */}
            <button
              type="button"
              onClick={() => onFlyToHazard(currentWarning)}
              className={cn(
                "h-8 px-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer",
                levelColor.btn
              )}
              title="Sorot Titik Pusat Bahaya di Peta"
            >
              <Crosshair className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Sorot Peta</span>
            </button>

            {/* Audio Alert Button */}
            <button
              type="button"
              onClick={handlePlayVoice}
              className={cn(
                "h-8 px-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border",
                isSpeaking
                  ? "bg-rose-500 text-white border-rose-500 shadow-md animate-pulse"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs"
              )}
              title="Dengarkan Siaran Suara Peringatan"
            >
              <Volume2 className={cn("h-3.5 w-3.5", isSpeaking ? "text-white" : "text-rose-500")} />
              <span className="hidden sm:inline">
                {isSpeaking ? "Menyiarkan..." : "Suara Alert"}
              </span>
            </button>

            {/* Multiple Warning Controls */}
            {total > 1 && (
              <div className="flex items-center bg-white/80 rounded-xl border border-slate-200 p-0.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
                  title="Peringatan Sebelumnya"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] font-bold text-slate-600 px-1">
                  {currentIndex + 1}/{total}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
                  title="Peringatan Berikutnya"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Minimize button */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors cursor-pointer"
              title="Kecilkan Banner Peringatan"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
