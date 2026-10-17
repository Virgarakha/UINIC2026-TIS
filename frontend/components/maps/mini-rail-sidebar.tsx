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
    <aside className="hidden sm:flex w-[68px] h-screen bg-white border-r border-slate-200/90 fixed left-0 top-0 z-30 flex-col items-center py-3 select-none shadow-xs">
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

      {/* 6. User Profile Button & Popup (Bottom) */}
      <div className="relative">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#0EB29A] to-[#2E6E65] text-white font-bold text-xs flex items-center justify-center shadow-md shadow-[#0EB29A]/30 border-2 border-white hover:scale-105 transition-all cursor-pointer relative overflow-hidden"
          title={`Akun: ${user.name}`}
        >
          {user.avatar_url || user.foto_profil ? (
            <img
              src={user.avatar_url || user.foto_profil || ""}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            user.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
          )}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white z-10" />
        </button>

        {/* Profile Dropdown Popover */}
        {showProfileMenu && (
          <div className="absolute bottom-12 left-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in zoom-in-95 duration-150 text-[#2B3752]">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
              <div className="h-9 w-9 rounded-full bg-[#0EB29A] text-white font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                {user.avatar_url || user.foto_profil ? (
                  <img
                    src={user.avatar_url || user.foto_profil || ""}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#2B3752] truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <div className="py-2 space-y-1">
              <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  <span>Poin Reward</span>
                </span>
                <span>{user.poin || 240} Pts</span>
              </div>

              {/* Status Armada Mitra Pengepul Switch */}
              {user.role === "pengepul" && (
                <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200/90 my-1">
                  <div className="flex items-center gap-2">
                    <Truck className={`h-4 w-4 ${isPengepulOnline ? "text-[#0EB29A]" : "text-slate-400"}`} />
                    <div className="text-left">
                      <span className="text-xs font-bold text-[#2B3752] block">Status Mitra</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {isPengepulOnline ? "🟢 Online di Peta" : "⚪ Offline"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onTogglePengepulOnline}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      isPengepulOnline ? "bg-[#0EB29A]" : "bg-slate-300"
                    }`}
                    title={isPengepulOnline ? "Klik untuk Offline" : "Klik untuk Online"}
                  >
                    <div
                      className={`h-4.5 w-4.5 rounded-full bg-white shadow-sm transform transition-transform ${
                        isPengepulOnline ? "translate-x-4.5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Edit Profil Akun Trigger */}
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onOpenEditProfile?.();
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <UserIcon className="h-3.5 w-3.5 text-[#0EB29A]" />
                  <span>Edit Profil Saya</span>
                </span>
                <span className="text-[10px] text-[#0EB29A] font-bold">Ubah</span>
              </button>

              <a
                href="/dashboard"
                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="h-3.5 w-3.5 text-[#0EB29A]" />
                  <span>Portal Warga</span>
                </span>
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
