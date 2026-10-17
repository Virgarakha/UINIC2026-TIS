import * as React from "react";
import { Navbar } from "@/components/layouts/navbar";
import { MobileNav } from "@/components/layouts/mobile-nav";
import { Footer } from "@/components/layouts/footer";
import { LiveAlertTicker } from "@/components/shared/live-alert-ticker";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative selection:bg-emerald-500/20 selection:text-emerald-700">
      {/* 1. Live Breaking Alert Ticker */}
      <LiveAlertTicker />

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
