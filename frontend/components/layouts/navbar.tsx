"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  Menu,
  ShieldCheck,
  X,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { publicNavItems } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0EB29A] to-[#2E6E65] text-white shadow-md shadow-[#0EB29A]/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-[#2B3752]">
                  {siteConfig.name}
                </span>
                <span className="rounded-md bg-[#0EB29A]/15 px-1.5 py-0.5 text-[10px] font-extrabold text-[#2E6E65]">
                  AI v2.0
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Multi-Hazard Early Warning
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {publicNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5",
                    isActive
                      ? "text-[#0EB29A] bg-[#0EB29A]/10 font-bold"
                      : "text-slate-600 hover:text-[#2B3752] hover:bg-slate-100"
                  )}
                >
                  {item.title}
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Quick Report CTA Button */}
            <Link href="/lapor" className="hidden sm:inline-flex">
              <Button variant="glow" size="sm" className="gap-1.5">
                <Camera className="h-4 w-4" />
                <span>Lapor Sampah</span>
              </Button>
            </Link>

            {/* Portal Dashboard Button */}
            <Link href="/dashboard" className="hidden sm:inline-flex">
              <Button variant="outline" size="sm" className="gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Button>
            </Link>

            {/* Admin Command Center Link */}
            <a
              href={siteConfig.links.backendAdmin}
              target="_blank"
              rel="noreferrer"
              title="Akses Command Center Admin Laravel"
              className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#2B3752] border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 transition-colors"
            >
              <span>Admin Panel</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/98 px-4 pt-3 pb-6 backdrop-blur-lg shadow-lg animate-in slide-in-from-top-2">
          <div className="space-y-1">
            {publicNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-[#0EB29A]/10 text-[#0EB29A]"
                      : "text-[#2B3752] hover:bg-slate-100"
                  )}
                >
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/lapor" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="glow" className="w-full gap-2">
                <Camera className="h-4 w-4" />
                <span>Lapor Titik Sampah (Kamera/GPS)</span>
              </Button>
            </Link>
            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Portal Dashboard Warga</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
