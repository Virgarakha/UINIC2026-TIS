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
  Compass,
  ExternalLink,
  User as UserIcon,
  LogIn,
  UserPlus,
  Truck,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { publicNavItems } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getStoredUser, isGuestUser } from "@/lib/auth-storage";
import { User } from "@/types";

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser());
    };
    syncUser();

    if (typeof window !== "undefined") {
      window.addEventListener("uinic_auth_changed", syncUser);
      window.addEventListener("storage", syncUser);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("uinic_auth_changed", syncUser);
        window.removeEventListener("storage", syncUser);
      }
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E7EDE5] bg-[#FBFBF8]/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center py-1 group" title="TRINFO - Trash Information System">
              <img
                src="/images/logo-text.png"
                alt="TRINFO - Trash Information System"
                className="h-9 sm:h-10 md:h-11 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Center: Modern Floating Pill Navigation */}
          <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#DFE7DD] shadow-2xs">
            <Link
              href="/"
              className={cn(
                "px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all",
                pathname === "/"
                  ? "bg-[#1E5345] text-white shadow-2xs"
                  : "text-slate-600 hover:text-[#18231D]"
              )}
            >
              Beranda
            </Link>
            <span className="text-slate-300 text-xs">•</span>
            <Link
              href="/peta"
              className={cn(
                "px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all",
                pathname === "/peta"
                  ? "bg-[#1E5345] text-white shadow-2xs"
                  : "text-slate-600 hover:text-[#18231D]"
              )}
            >
              Peta Radar
            </Link>
            <span className="text-slate-300 text-xs">•</span>
            {!user || isGuestUser(user) ? (
              <Link
                href="/laporan-saya"
                className={cn(
                  "px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all",
                  pathname.startsWith("/laporan-saya")
                    ? "bg-[#1E5345] text-white shadow-2xs"
                    : "text-slate-600 hover:text-[#18231D]"
                )}
              >
                Laporan Warga
              </Link>
            ) : user?.role === "warga" ? (
              <Link
                href="/laporan-saya"
                className={cn(
                  "px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all",
                  pathname.startsWith("/laporan-saya")
                    ? "bg-[#1E5345] text-white shadow-2xs"
                    : "text-slate-600 hover:text-[#18231D]"
                )}
              >
                Laporan Saya
              </Link>
            ) : (
              <Link
                href="/peringatan"
                className={cn(
                  "px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all",
                  pathname === "/peringatan"
                    ? "bg-[#1E5345] text-white shadow-2xs"
                    : "text-slate-600 hover:text-[#18231D]"
                )}
              >
                Peringatan Dini
              </Link>
            )}
            <span className="text-slate-300 text-xs">•</span>
            <Link
              href="/rewards"
              className={cn(
                "px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all",
                pathname === "/rewards"
                  ? "bg-[#1E5345] text-white shadow-2xs"
                  : "text-slate-600 hover:text-[#18231D]"
              )}
            >
              Poin & Hadiah
            </Link>
            <span className="text-slate-300 text-xs">•</span>
            <Link
              href="/dokumentasi-api"
              className={cn(
                "px-3.5 py-1.5 text-xs font-extrabold rounded-full transition-all",
                pathname.startsWith("/dokumentasi-api")
                  ? "bg-[#1E5345] text-white shadow-2xs"
                  : "text-slate-600 hover:text-[#18231D]"
              )}
            >
              Dokumentasi API
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            {/* User Session or Login Button */}
            {user && !isGuestUser(user) ? (
              <Link
                href="/profil"
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#18231D] text-white font-extrabold text-xs shadow-sm hover:bg-[#25362D] transition-all"
                title={`Masuk sebagai ${user.name}`}
              >
                <div className="h-5 w-5 rounded-full bg-emerald-400 text-[#18231D] flex items-center justify-center font-black text-[10px]">
                  {user.name.charAt(0)}
                </div>
                <span className="truncate max-w-[100px]">{user.name.split(" ")[0]}</span>
                {user.role === "pengepul" && <Truck className="h-3 w-3 text-emerald-300" />}
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 rounded-2xl border-2 border-[#18231D] bg-white text-[#18231D] font-extrabold text-xs hover:bg-[#18231D] hover:text-white transition-all shadow-2xs"
              >
                Masuk
              </Link>
            )}

            {/* Admin Link */}
            <a
              href={siteConfig.links.backendAdmin}
              target="_blank"
              rel="noreferrer"
              title="Akses panel admin"
              className="hidden lg:inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#18231D] border border-[#DFE7DD] rounded-xl px-2.5 py-1.5 hover:bg-slate-50 transition-colors"
            >
              <span>Admin</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden rounded-xl p-2 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Buka menu"
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
            {!user || isGuestUser(user) ? (
              <div className="grid grid-cols-2 gap-2 mb-1">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-xs font-bold gap-1.5">
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Masuk</span>
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full text-xs font-bold gap-1.5 bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white">
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Daftar</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <Link
                href="/profil"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-100 text-[#2B3752]"
              >
                <div className="h-8 w-8 rounded-full bg-[#0EB29A] text-white font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold block">{user.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{user.role} • {user.poin || user.poin_reward || 0} Poin</span>
                </div>
              </Link>
            )}

            <Link href="/lapor" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="glow" className="w-full gap-2">
                <Camera className="h-4 w-4" />
                <span>Lapor Titik Sampah (Kamera/GPS)</span>
              </Button>
            </Link>
            <Link href="/peta" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full gap-2">
                <Compass className="h-4 w-4" />
                <span>Radar Titik Sampah</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
