"use client";

import * as React from "react";
import {
  Menu,
  Bookmark,
  History,
  LogOut,
  User as UserIcon,
  Coins,
  LayoutDashboard,
  ExternalLink,
  Truck,
} from "lucide-react";
import { User } from "@/types";

export interface MiniRailSidebarProps {
  user: User;
  onToggleMenu: () => void;
  onOpenSaved: () => void;
  onOpenRecent: () => void;
  onFlyToLocation: (lat: number, lng: number, zoom?: number) => void;
  onLogout: () => void;
  onOpenEditProfile?: () => void;
  activePanel?: "saved" | "recent" | null;
  isPengepulOnline?: boolean;
  onTogglePengepulOnline?: () => void;
}

export function MiniRailSidebar({
  user,
  onToggleMenu,
  onOpenSaved,
  onOpenRecent,
  onFlyToLocation,
  onLogout,
  onOpenEditProfile,
  activePanel,
  isPengepulOnline = false,
  onTogglePengepulOnline,
}: MiniRailSidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  // Quick areas as shown in the Google Maps screenshot
  const savedAreas = [
    {
      id: "malang",
      name: "Malang",
      badge: "14",
      image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=120&q=80",
      lat: -7.9826,
      lng: 112.6308,
      zoom: 14,
    },
    {
      id: "bretten",
      name: "Bretten",
      badge: null,
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=120&q=80",
      lat: -7.9780,
      lng: 112.6280,
      zoom: 15,
    },
    {
      id: "arkatama",
      name: "Graha Arkatama",
      badge: null,
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&q=80",
      lat: -7.9540,
      lng: 112.6140,
      zoom: 16,
    },
  ];

  return (
    <aside className="hidden sm:flex w-[68px] h-full bg-white border-r border-slate-200/90 absolute left-0 top-0 bottom-0 z-30 flex-col items-center py-3 select-none shadow-xs">
      {/* 1. Hamburger Menu Button (Top) */}
      <button
        onClick={onToggleMenu}
        className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-700 hover:text-[#0EB29A] hover:bg-slate-100 transition-colors cursor-pointer mb-2"
        title="Menu Navigasi Peta"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* 2. Disimpan (Saved / Bookmark) */}
      <button
        onClick={onOpenSaved}
        className={`flex flex-col items-center justify-center gap-1 w-[60px] py-2 rounded-xl transition-all cursor-pointer group ${
          activePanel === "saved"
            ? "bg-[#0EB29A]/15 text-[#0EB29A] font-bold"
            : "text-slate-600 hover:text-[#2B3752] hover:bg-slate-50"
        }`}
        title="Laporan Disimpan & Dipantau"
      >
        <Bookmark
          className={`h-5 w-5 transition-transform group-hover:scale-110 ${
            activePanel === "saved" ? "fill-[#0EB29A] text-[#0EB29A]" : ""
          }`}
        />
        <span className="text-[10px] font-semibold tracking-tight leading-tight">Disimpan</span>
      </button>

      {/* 3. Terbaru (Recent / History) */}
      <button
        onClick={onOpenRecent}
        className={`flex flex-col items-center justify-center gap-1 w-[60px] py-2 rounded-xl transition-all cursor-pointer group mt-1 ${
          activePanel === "recent"
            ? "bg-[#0EB29A]/15 text-[#0EB29A] font-bold"
            : "text-slate-600 hover:text-[#2B3752] hover:bg-slate-50"
        }`}
        title="Aktivitas & Riwayat Terbaru"
      >
        <History className="h-5 w-5 transition-transform group-hover:scale-110" />
        <span className="text-[10px] font-semibold tracking-tight leading-tight">Terbaru</span>
      </button>

      {/* 4. Thin Divider Line */}
      <div className="w-8 h-px bg-slate-200 my-2.5" />

      {/* 5. Quick Location Image Cards (Malang, Bretten, Graha Arkatama) */}
      <div className="flex flex-col items-center gap-2.5 overflow-y-auto no-scrollbar max-h-[38vh]">
        {savedAreas.map((area) => (
          <button
            key={area.id}
            onClick={() => onFlyToLocation(area.lat, area.lng, area.zoom)}
            className="flex flex-col items-center gap-1 group cursor-pointer text-center"
            title={`Arahkan Peta ke ${area.name}`}
          >
            <div className="h-10 w-10 rounded-xl relative overflow-hidden border border-slate-200 shadow-xs group-hover:scale-105 group-hover:border-[#0EB29A] transition-all">
              <img
                src={area.image}
                alt={area.name}
                className="w-full h-full object-cover"
              />
              {area.badge && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-black text-[11px] backdrop-blur-[1px]">
                  {area.badge}
                </div>
              )}
            </div>
            <span className="text-[10px] font-medium text-slate-700 leading-tight max-w-[60px] truncate group-hover:text-[#0EB29A] transition-colors">
              {area.name}
            </span>
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Pengepul Quick Online/Offline Toggle in Rail */}
      {user.role === "pengepul" && (
        <button
          type="button"
          onClick={onTogglePengepulOnline}
          className={`flex flex-col items-center justify-center gap-0.5 w-[60px] py-2 mb-2 rounded-xl transition-all cursor-pointer group ${
            isPengepulOnline
              ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent"
          }`}
          title={
            isPengepulOnline
              ? "Mitra Online (Mobil aktif di peta). Klik untuk Offline"
              : "Mitra Offline. Klik untuk Online (Tampilkan mobil)"
          }
        >
          <div className="relative">
            <Truck className={`h-5 w-5 ${isPengepulOnline ? "text-[#0EB29A]" : "text-slate-400"}`} />
            <span
              className={`absolute -top-1 -right-1 h-2 w-2 rounded-full border border-white ${
                isPengepulOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
              }`}
            />
          </div>
          <span className="text-[9px] font-black tracking-tight leading-tight uppercase">
            {isPengepulOnline ? "Online" : "Offline"}
          </span>
        </button>
      )}

  
      
   
    </aside>
  );
}
