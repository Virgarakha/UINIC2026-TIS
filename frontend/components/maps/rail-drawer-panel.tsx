"use client";

import * as React from "react";
import { X, Bookmark, History, MapPin, ChevronRight, Sparkles, Trash2 } from "lucide-react";
import { LaporanSampah } from "@/types";
import { HazardBadge } from "@/components/shared/hazard-badge";
import { formatDate } from "@/lib/utils";

export interface RailDrawerPanelProps {
  type: "saved" | "recent";
  reports: LaporanSampah[];
  onSelectReport: (report: LaporanSampah) => void;
  onClose: () => void;
  bookmarkedIds: number[];
  onToggleBookmark: (id: number) => void;
}

export function RailDrawerPanel({
  type,
  reports,
  onSelectReport,
  onClose,
  bookmarkedIds,
  onToggleBookmark,
}: RailDrawerPanelProps) {
  const isSaved = type === "saved";

  // Filter reports according to panel type
  const displayedReports = isSaved
    ? reports.filter((r) => bookmarkedIds.includes(r.id))
    : reports.slice(0, 5);

  return (
    <div className="absolute top-0 left-[68px] bottom-0 z-30 w-full sm:w-[390px] bg-white shadow-2xl border-r border-slate-200/90 flex flex-col animate-in slide-in-from-left-4 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5">
          <div
            className={`h-9 w-9 rounded-2xl flex items-center justify-center font-bold ${
              isSaved ? "bg-[#0EB29A]/15 text-[#0EB29A]" : "bg-[#2E6E65]/15 text-[#2E6E65]"
            }`}
          >
            {isSaved ? <Bookmark className="h-5 w-5 fill-[#0EB29A]" /> : <History className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-sm font-black text-[#2B3752]">
              {isSaved ? "Titik Disimpan & Dipantau" : "Riwayat Laporan Terbaru"}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isSaved
                ? `${displayedReports.length} lokasi dalam daftar pantau Anda`
                : "Aktivitas pelaporan dan verifikasi terkini"}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#2B3752] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* List of Reports */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100">
        {displayedReports.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Bookmark className="h-8 w-8 mx-auto opacity-30" />
            <p className="text-xs font-semibold">Belum ada titik laporan yang disimpan.</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Buka salah satu titik laporan sampah di peta lalu klik ikon "Simpan" untuk memantaunya di sini.
            </p>
          </div>
        ) : (
          displayedReports.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="pt-2.5 first:pt-0 flex items-start gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-200"
            >
              <img
                src={report.foto_url}
                alt="Foto"
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-200 group-hover:scale-105 transition-transform"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-[#2B3752] truncate group-hover:text-[#0EB29A] transition-colors">
                    {report.alamat_lokasi}
                  </span>
                  {isSaved && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(report.id);
                      }}
                      className="text-[#0EB29A] hover:text-red-500 p-0.5"
                      title="Hapus dari daftar simpan"
                    >
                      <Bookmark className="h-3.5 w-3.5 fill-current" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{report.deskripsi}</p>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <HazardBadge hazard={report.tipe_bahaya} className="text-[10px] py-0 px-2" />
                  {report.analisis_ai && (
                    <span className="text-[10px] font-bold text-[#2E6E65]">
                      {report.analisis_ai.persentase_sumbatan_aliran}% Sumbatan
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#0EB29A] group-hover:translate-x-0.5 transition-all self-center flex-shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
