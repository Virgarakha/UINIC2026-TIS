"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layouts/navbar";
import { MobileNav } from "@/components/layouts/mobile-nav";
import { Footer } from "@/components/layouts/footer";
import { LiveAlertTicker } from "@/components/shared/live-alert-ticker";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPeta = pathname === "/peta";

  if (isPeta) {
    return (
      <div className="h-dvh max-h-dvh w-full flex flex-col overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-700">
        {/* Desktop Navbar only (hidden on mobile in /peta for fullscreen map) */}
        <div className="hidden md:block">
          <Navbar />
        </div>

        {/* Fullscreen Map Viewport with 0 padding/margin and no scroll */}
        <main className="flex-1 h-full w-full overflow-hidden p-0 m-0">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-emerald-500/20 selection:text-emerald-700">
      {/* 1. Live Breaking Alert Ticker */}

      {/* 2. Glassmorphic Sticky Header */}
      <Navbar />

      {/* 3. Main Content Viewport */}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      {/* 4. Mobile Bottom Navigation Bar (PWA Feel) */}
      <MobileNav />

      {/* 5. Comprehensive Multi-column Footer */}
      <Footer />
    </div>
  );
}
