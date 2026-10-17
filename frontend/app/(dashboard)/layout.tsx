import * as React from "react";
import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layouts/dashboard-topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 text-[#2B3752] overflow-hidden">
      {/* 1. Dashboard Sidebar */}
      <DashboardSidebar />

      {/* 2. Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar with live status and profile */}
        <DashboardTopbar />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
