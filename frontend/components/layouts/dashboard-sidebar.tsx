"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Coins,
  LayoutDashboard,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { dashboardNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-white text-[#2B3752] border-r border-slate-200 flex flex-col transition-all duration-300 z-30 shadow-xs",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar Header Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0EB29A] to-[#2E6E65] text-white shadow-sm shadow-[#0EB29A]/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-[#2B3752]">{siteConfig.name}</span>
              <span className="text-[10px] text-[#2E6E65] font-semibold">Citizen Portal</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#2B3752] transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className={cn("px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400", isCollapsed && "sr-only")}>
          Menu Utama
        </div>

        {dashboardNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors",
                isActive
                  ? "bg-[#0EB29A]/15 text-[#2E6E65] border border-[#0EB29A]/30 font-bold"
                  : "text-slate-600 hover:text-[#2B3752] hover:bg-slate-100"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}

        <div className={cn("pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400", isCollapsed && "sr-only")}>
          Sistem & Publik
        </div>

        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#2B3752] hover:bg-slate-100 rounded-xl transition-colors"
          title={isCollapsed ? "Kembali ke Beranda" : undefined}
        >
          <Compass className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Halaman Utama</span>}
        </Link>

        <a
          href={siteConfig.links.backendAdmin}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#2B3752] hover:bg-slate-100 rounded-xl transition-colors"
          title={isCollapsed ? "Admin Backend" : undefined}
        >
          <ExternalLink className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Admin Command Center</span>}
        </a>
      </div>

      {/* Bottom User Card */}
      <div className="p-3 border-t border-slate-200">
        <div className={cn("flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200", isCollapsed && "justify-center")}>
          <div className="h-8 w-8 rounded-full bg-[#0EB29A] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
            BS
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#2B3752] truncate">Budi Santoso</p>
              <div className="flex items-center gap-1 text-[11px] text-[#2E6E65] font-semibold">
                <Coins className="h-3 w-3 text-amber-500" />
                <span>240 Poin</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
