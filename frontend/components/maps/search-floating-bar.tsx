"use client";

import * as React from "react";
import { Search, X, Menu, Navigation, User as UserIcon, Trash2, Recycle, Flame, Biohazard, AlertTriangle, Layers, Truck, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "@/types";

export interface SearchFloatingBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  onMenuToggle?: () => void;
  totalResults: number;
  user?: User | null;
  onOpenLogin?: () => void;
  isRailVisible?: boolean;
  roleViewMode?: "warga" | "pengepul";
  onOpenTrackerModal?: () => void;
}

export function SearchFloatingBar({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  onMenuToggle,
  totalResults,
  user,
  onOpenLogin,
  isRailVisible = false,
  roleViewMode = "warga",
  onOpenTrackerModal,
}: SearchFloatingBarProps) {
  const categories = roleViewMode === "pengepul" ? [
    { id: "all", label: `Semua Order (${totalResults})`, icon: Layers },
    { id: "pengepul", label: "📦 Kardus & Logam (Cuan)", icon: Recycle },
    { id: "banjir", label: "🌊 Sumbatan Saluran Air", icon: Trash2 },
    { id: "bau", label: "🛑 Timbunan TPS Liar", icon: AlertTriangle },
  ] : [
    { id: "all", label: `Semua Titik (${totalResults})`, icon: Layers },
    { id: "banjir", label: "Kritis Banjir", icon: Trash2 },
    { id: "wabah", label: "Wabah Sanitasi", icon: AlertTriangle },
    { id: "kebakaran", label: "Gas Metana & Api", icon: Flame },
    { id: "bau", label: "Bau Toksik", icon: Biohazard },
    { id: "pengepul", label: "Siap Pengepul", icon: Recycle },
  ];

  return (
    <div
      className={cn(
        "absolute top-3.5 z-20 flex flex-col gap-2 max-w-xl w-[calc(100vw-32px)] sm:w-auto transition-all duration-300",
        isRailVisible ? "left-4 sm:left-[88px]" : "left-4"
      )}
    >
      {/* Role Indicator & Citizen Tracking Beacon */}
      <div className="flex items-center gap-1.5 self-start">
        {roleViewMode === "pengepul" ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18231D] text-emerald-300 text-xs font-black shadow-md border border-emerald-900/40">
            <span>🚛</span>
            <span>Mitra Driver Pengepul</span>
          </div>
        ) : (
          onOpenTrackerModal && (
            <button
              type="button"
              onClick={onOpenTrackerModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs font-black backdrop-blur-md shadow-xs hover:bg-emerald-500/25 transition-all cursor-pointer animate-in fade-in"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Lacak Laporan Saya</span>
            </button>
          )
        )}
      </div>
      {/* 1. Google Maps Search Pill */}
      <div className="flex items-center h-12 w-full sm:w-[440px] bg-white rounded-full shadow-xl shadow-slate-200/70 border border-slate-200/90 px-3.5 gap-2 transition-all hover:shadow-2xl">
        {!isRailVisible && (
          <button
            onClick={onMenuToggle}
            className="p-1.5 text-[#2B3752] hover:text-[#0EB29A] rounded-full hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
            title="Menu Navigasi"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Telusuri titik sampah, sungai, parit..."
          className="flex-1 bg-transparent text-xs sm:text-sm font-medium text-[#2B3752] placeholder:text-slate-400 outline-none min-w-0"
        />

        {searchQuery ? (
          <button
            onClick={() => onSearchChange("")}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer flex-shrink-0"
            title="Hapus pencarian"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <div className="p-1 text-slate-400 flex-shrink-0">
            <Search className="h-4 w-4" />
          </div>
        )}

        {/* Login Button (Only when not logged in; when logged in, user profile is in the top navbar) */}
        {!user && (
          <>
            <div className="h-5 w-px bg-slate-200 mx-0.5 flex-shrink-0" />
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white text-xs font-bold hover:opacity-95 active:scale-95 transition-all shadow-md shadow-[#0EB29A]/20 cursor-pointer whitespace-nowrap flex-shrink-0"
              title="Masuk untuk memantau titik tersimpan"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Masuk</span>
            </button>
          </>
        )}
      </div>

      {/* 2. Google Maps Horizontal Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 pr-4 max-w-full">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const IconComp = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-md cursor-pointer select-none",
                isActive
                  ? "bg-[#0EB29A] text-white border border-transparent shadow-[#0EB29A]/30 scale-[1.02]"
                  : "bg-white text-[#2B3752] border border-slate-200/90 hover:bg-slate-50 hover:border-[#0EB29A]/40"
              )}
            >
              <IconComp className={cn("w-3.5 h-3.5 flex-shrink-0", isActive ? "text-white" : "text-[#0EB29A]")} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
