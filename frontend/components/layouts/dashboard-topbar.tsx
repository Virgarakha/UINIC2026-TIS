"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Camera, ChevronRight, Coins, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardTopbar() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Breadcrumb Info */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/dashboard" className="hover:text-[#0EB29A] font-medium">
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5 opacity-40" />
        <span className="font-bold text-[#2B3752]">Ikhtisar Aktivitas</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live Warning Status Pill */}
        <Link
          href="/peringatan"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-600 text-xs font-bold hover:bg-red-500/15 transition-colors"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Status: 1 Titik Siaga</span>
        </Link>

        {/* User Points Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 text-xs font-bold">
          <Coins className="h-3.5 w-3.5" />
          <span>240 Poin</span>
        </div>

        {/* Action Button: Lapor Cepat */}
        <Link href="/lapor">
          <Button variant="glow" size="sm" className="gap-1.5 text-xs">
            <Camera className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lapor Titik Baru</span>
          </Button>
        </Link>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}
