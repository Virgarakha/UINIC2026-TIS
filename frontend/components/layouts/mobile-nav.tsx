"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Compass, Gift, Home, ShieldAlert, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStoredUser, isGuestUser } from "@/lib/auth-storage";
import { User } from "@/types";

export interface MobileNavProps {
  onLaporClick?: () => void;
  className?: string;
}

export function MobileNav({ onLaporClick, className }: MobileNavProps = {}) {
  const pathname = usePathname();
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  const isPengepul = user?.role === "pengepul";
  const isWarga = user?.role === "warga";
  const isGuest = isGuestUser(user);

  const navItems = [
    { title: "Beranda", href: "/", icon: Home },
    { title: "Radar", href: "/peta", icon: Compass },
    { title: "Lapor", href: "/lapor", icon: Camera, isAction: true },
    isPengepul
      ? { title: "Siaga", href: "/peringatan", icon: ShieldAlert }
      : { title: "Laporan Warga", href: "/laporan-saya", icon: ClipboardList },
    { title: "Rewards", href: "/rewards", icon: Gift },
  ];

  return (
    <div
      className={cn(
        "sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none",
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/laporan-saya" && pathname.startsWith("/laporan-saya"));
          const Icon = item.icon;

          if (item.isAction) {
            return onLaporClick ? (
              <button
                key={item.href}
                type="button"
                onClick={onLaporClick}
                className="flex flex-col items-center justify-center -mt-5 group cursor-pointer"
                title="Laporkan Titik Timbunan Sampah Baru"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0EB29A] to-[#2E6E65] text-white shadow-lg shadow-[#0EB29A]/40 group-active:scale-95 transition-transform border-2 border-white">
                  <Camera className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold text-[#0EB29A] mt-1">
                  {item.title}
                </span>
              </button>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5 group"
                title="Laporkan Titik Timbunan Sampah Baru"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0EB29A] to-[#2E6E65] text-white shadow-lg shadow-[#0EB29A]/40 group-active:scale-95 transition-transform border-2 border-white">
                  <Camera className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold text-[#0EB29A] mt-1">
                  {item.title}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors flex-1 text-center",
                isActive
                  ? "text-[#0EB29A] font-bold"
                  : "text-slate-500 hover:text-[#2B3752]"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-0.5", isActive ? "stroke-[2.5]" : "stroke-[1.8]")} />
              <span className="text-[10px] tracking-tight">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
