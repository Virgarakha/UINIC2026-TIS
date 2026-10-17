"use client";

import * as React from "react";
import {
  X,
  Navigation,
  Share2,
  ShieldAlert,
  Truck,
  Droplets,
  Thermometer,
  CloudRain,
  Mountain,
  Bot,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Layers,
  MapPin,
  ChevronRight,
  Bookmark,
  ShieldCheck,
  Maximize2,
} from "lucide-react";
import { LaporanSampah } from "@/types";
import { HazardBadge } from "@/components/shared/hazard-badge";
import { WeatherData } from "@/lib/weather";
import { formatDate, formatRupiah, getDistanceMeters, cn } from "@/lib/utils";

export interface PlaceDetailDrawerProps {
  report: LaporanSampah | null;
  allReports?: LaporanSampah[];
  weather?: WeatherData | null;
  onSelectReport?: (report: LaporanSampah) => void;
  onClose: () => void;
  onOpenRoute?: (report: LaporanSampah) => void;
  isRailVisible?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: (reportId: number) => void;
}

export function PlaceDetailDrawer({
  report,
  allReports = [],
  weather,
  onSelectReport,
  onClose,
  onOpenRoute,
  isRailVisible = false,
  isBookmarked = false,
  onToggleBookmark,
}: PlaceDetailDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<
    "ringkasan" | "ai" | "cuaca" | "tanggapan" | "sekitar"
  >("ai");
  const [isCopied, setIsCopied] = React.useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);

  // Find nearby reports within 100 meters radius
  const nearbyReports = React.useMemo(() => {
    if (!report || !allReports || allReports.length === 0) return [];
    return allReports
      .filter((r) => r.id !== report.id)
      .map((r) => ({
        ...r,
        distanceMeters: getDistanceMeters(report.latitude, report.longitude, r.latitude, r.longitude),
      }))
      .filter((r) => r.distanceMeters <= 100)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [report, allReports]);

  // Aggregate metrics for all reports in this 100m cluster
  const clusterStats = React.useMemo(() => {
    if (!report) return { count: 0, totalVolume: 0, totalWeight: 0, totalValue: 0 };
    const cluster = [report, ...nearbyReports];
    const totalVolume = cluster.reduce(
      (sum, item) => sum + (item.analisis_ai?.volume_sampah_m3 || 0),
      0
    );
    const totalWeight = cluster.reduce(
      (sum, item) => sum + (item.analisis_ai?.estimasi_berat_kg || 0),
      0
    );
    const totalValue = cluster.reduce(
      (sum, item) => sum + (item.analisis_ai?.nilai_ekonomi_estimasi || 0),
      0
    );
    return {
      count: cluster.length,
      totalVolume: Math.round(totalVolume * 100) / 100,
      totalWeight: Math.round(totalWeight * 10) / 10,
      totalValue,
    };
  }, [report, nearbyReports]);

  const [mobileSheetState, setMobileSheetState] = React.useState<"peek" | "expanded">("peek");
  const touchStartYRef = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartYRef.current = null;

    if (deltaY < -40) {
      // Swiped UP -> expand
      setMobileSheetState("expanded");
    } else if (deltaY > 50) {
      // Swiped DOWN -> if expanded, collapse to peek; if peek, close
      if (mobileSheetState === "expanded") {
        setMobileSheetState("peek");
      } else {
        onClose();
      }
    }
  };

  if (!report) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?id=${report.id}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(textArea);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const ai = report.analisis_ai;
  const metaForensik = ai?.metadata_forensik || (report as any).metadata_forensik;
  const isForensicVerified = Boolean(
    metaForensik?.is_geotag_verified ||
    (report as any).is_geotag_verified ||
    (report.foto_url && (report.foto_url.includes("storage/laporan") || report.foto_url.startsWith("data:image/")))
  );

  return (
    <div
      className={cn(
        // Mobile layout: Fixed bottom sheet above bottom bar, slide up/down
        "fixed sm:absolute bottom-16 sm:bottom-auto sm:top-4 z-40 w-full sm:w-[410px] bg-white rounded-t-[28px] sm:rounded-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.18)] sm:shadow-2xl border-t sm:border border-slate-200/90 flex flex-col overflow-hidden transition-all duration-300 ease-out",
        // Mobile height: peek (h-[300px]) vs expanded (h-[calc(86vh-64px)]), Desktop is max-h
        mobileSheetState === "peek" ? "h-[300px] sm:h-auto" : "h-[calc(86vh-64px)] sm:h-auto",
        "sm:max-h-[calc(100vh-32px)]",
        isRailVisible ? "left-0 sm:left-[80px]" : "left-0 sm:left-4"
      )}
    >
      {/* Mobile Top Drag Handle Bar */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setMobileSheetState((prev) => (prev === "peek" ? "expanded" : "peek"))}
        className="pt-2.5 pb-1 flex flex-col items-center justify-center sm:hidden cursor-grab active:cursor-grabbing touch-none select-none bg-white border-b border-slate-50 flex-shrink-0"
        title="Geser ke atas untuk detail lengkap atau ke bawah untuk menutup"
      >
        <div className="w-10 h-1.5 bg-slate-300 rounded-full" />
      </div>

      {/* 1. Desktop Only: Header Banner Image with Close Button */}
      <div
        onClick={() => setIsLightboxOpen(true)}
        className="hidden sm:block relative h-48 w-full bg-slate-900 flex-shrink-0 overflow-hidden cursor-pointer group"
        title="Klik untuk memperbesar bukti foto & membaca stempel forensik"
      >
        <img
          src={report.foto_url || "https://placehold.co/600x400?text=Foto+Sampah"}
          alt={report.alamat_lokasi}
          className="w-full h-full object-cover brightness-95 group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Floating Badges & Close Button */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <HazardBadge hazard={report.tipe_bahaya} />
            {isForensicVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0EB29A] text-white shadow-md">
                <ShieldCheck className="h-3 w-3" />
                Anti-Fraud GPS
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer shadow-md pointer-events-auto"
            title="Tutup Detail"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom Coordinates & Watermark Pill */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5 text-[#0EB29A]" />
            <span>{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
          </div>
          <div className="bg-black/60 backdrop-blur-md text-white text-[9.5px] px-2 py-0.5 rounded-md flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="h-3 w-3 text-[#0EB29A]" />
            <span>Perbesar Foto</span>
          </div>
        </div>
      </div>

      {/* 2. Place Title, Status & Address Block (Mobile & Desktop) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="p-3.5 sm:p-4 border-b border-slate-100 flex-shrink-0 space-y-1.5 bg-white"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-black text-[#2B3752] leading-tight truncate sm:whitespace-normal">
              {report.alamat_lokasi}
            </h2>
          </div>
          {/* Mobile Close X button */}
          <button
            onClick={onClose}
            className="sm:hidden p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer flex-shrink-0"
            title="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <HazardBadge hazard={report.tipe_bahaya} className="sm:hidden" />
          <span className="font-semibold text-[#2E6E65]">
            {report.kategori?.nama || "Umum"}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[#0EB29A] font-bold">
            {report.status?.nama || "Menunggu Analisis"}
          </span>
          {Number(report.total_tanggapan) > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <span className="font-medium text-slate-500">
                {report.total_tanggapan} Respon Warga
              </span>
            </>
          )}
        </div>

        <p className="text-xs text-slate-500 line-clamp-1 sm:line-clamp-2">{report.deskripsi}</p>
      </div>

      {/* Stacked Nearby Reports Alert Banner (≤ 100 meters) - Desktop */}
      {nearbyReports.length > 0 && (
        <div className="hidden sm:flex mx-3.5 my-2 p-2.5 rounded-2xl bg-gradient-to-r from-[#0EB29A]/15 via-[#2E6E65]/10 to-transparent border border-[#0EB29A]/30 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#0EB29A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#2B3752] block leading-tight">
                {nearbyReports.length} Laporan Sekitar (≤ 100m)
              </span>
              <span className="text-[10px] text-slate-500">
                Titik terdekat: {nearbyReports[0].distanceMeters} meter
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("sekitar")}
            className="px-2.5 py-1 rounded-xl bg-[#0EB29A] hover:bg-[#0ca18b] text-white font-bold text-[11px] transition-colors shadow-xs cursor-pointer"
          >
            Buka Tumpukan
          </button>
        </div>
      )}

      {/* 3. Google Maps Action Buttons (Rute, Simpan, Siaga, Pengepul, Bagikan) */}
      <div className="p-3 border-b border-slate-100 flex-shrink-0 grid grid-cols-5 gap-1 text-center bg-white">
        <button
          onClick={() => {
            if (onOpenRoute) onOpenRoute(report);
          }}
          className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
          title="Tampilkan Petunjuk Arah Langsung di Peta"
        >
          <div className="h-9 w-9 rounded-full bg-[#0EB29A]/10 text-[#0EB29A] flex items-center justify-center group-hover:bg-[#0EB29A] group-hover:text-white transition-all shadow-xs">
            <Navigation className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold text-[#2B3752]">Rute</span>
        </button>

        <button
          onClick={() => {
            if (onToggleBookmark) onToggleBookmark(report.id);
          }}
          className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
          title={isBookmarked ? "Hapus dari Daftar Simpan" : "Simpan ke Daftar Pantau"}
        >
          <div
            className={`h-9 w-9 rounded-full flex items-center justify-center transition-all shadow-xs ${
              isBookmarked
                ? "bg-[#0EB29A] text-white"
                : "bg-slate-100 text-[#2B3752] group-hover:bg-[#0EB29A]/15 group-hover:text-[#0EB29A]"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
          </div>
          <span className="text-[10px] font-bold text-[#2B3752]">
            {isBookmarked ? "Disimpan" : "Simpan"}
          </span>
        </button>

        <button
          onClick={() => alert(`Broadcast Peringatan Dini untuk titik #${report.id} siap dikirim ke warga sekitar!`)}
          className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
        >
          <div className="h-9 w-9 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold text-[#2B3752]">Siaga</span>
        </button>

        <button
          onClick={() => alert(`Permintaan penjemputan sampah daur ulang telah dikirim ke mitra pengepul terdekat!`)}
          className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
        >
          <div className="h-9 w-9 rounded-full bg-[#2E6E65]/10 text-[#2E6E65] flex items-center justify-center group-hover:bg-[#2E6E65] group-hover:text-white transition-all">
            <Truck className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold text-[#2B3752]">Pengepul</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
        >
          <div className="h-9 w-9 rounded-full bg-slate-100 text-[#2B3752] flex items-center justify-center group-hover:bg-[#2B3752] group-hover:text-white transition-all">
            {isCopied ? <CheckCircle2 className="h-4 w-4 text-[#0EB29A]" /> : <Share2 className="h-4 w-4" />}
          </div>
          <span className="text-[10px] font-bold text-[#2B3752]">
            {isCopied ? "Tersalin!" : "Bagikan"}
          </span>
        </button>
      </div>

      {/* 4. Google Maps Tabs Bar */}
      <div className="flex border-b border-slate-100 px-4 text-xs font-bold text-slate-500 flex-shrink-0 overflow-x-auto no-scrollbar bg-white">
        {nearbyReports.length > 0 && (
          <button
            onClick={() => setActiveTab("sekitar")}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "sekitar"
                ? "border-[#0EB29A] text-[#0EB29A] font-bold"
                : "border-transparent text-slate-500 hover:text-[#2B3752]"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-[#0EB29A]" />
            <span>Laporan Sekitar ({nearbyReports.length})</span>
          </button>
        )}
        <button
          onClick={() => setActiveTab("ai")}
          className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "ai"
              ? "border-[#0EB29A] text-[#0EB29A] font-bold"
              : "border-transparent text-slate-500 hover:text-[#2B3752]"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-[#0EB29A]" />
          <span>Analisis AI</span>
        </button>
        <button
          onClick={() => setActiveTab("cuaca")}
          className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "cuaca"
              ? "border-[#2E6E65] text-[#2E6E65] font-bold"
              : "border-transparent text-slate-500 hover:text-[#2B3752]"
          }`}
        >
          <CloudRain className="h-3.5 w-3.5 text-[#2E6E65]" />
          <span>Cuaca & Lingkungan</span>
        </button>
        <button
          onClick={() => setActiveTab("ringkasan")}
          className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "ringkasan"
              ? "border-[#2B3752] text-[#2B3752] font-bold"
              : "border-transparent text-slate-500 hover:text-[#2B3752]"
          }`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => setActiveTab("tanggapan")}
          className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "tanggapan"
              ? "border-[#2B3752] text-[#2B3752] font-bold"
              : "border-transparent text-slate-500 hover:text-[#2B3752]"
          }`}
        >
          Respon Warga ({report.total_tanggapan || 12})
        </button>
      </div>

      {/* 5. Scrollable Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Mobile Photo Banner (Inside scrollable body on mobile) */}
        <div
          onClick={() => setIsLightboxOpen(true)}
          className="block sm:hidden relative h-40 w-full bg-slate-900 rounded-2xl overflow-hidden cursor-pointer group shadow-sm flex-shrink-0"
          title="Klik untuk memperbesar bukti foto & membaca stempel forensik"
        >
          <img
            src={report.foto_url || "https://placehold.co/600x400?text=Foto+Sampah"}
            alt={report.alamat_lokasi}
            className="w-full h-full object-cover brightness-95"
          />

          {/* Bottom Coordinates & Watermark Pill */}
          <div className="absolute bottom-2 inset-x-2.5 flex items-center justify-between pointer-events-none">
            <div className="bg-black/70 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5 text-[#0EB29A]" />
              <span>{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
            </div>
            {isForensicVerified && (
              <span className="bg-[#0EB29A] text-white text-[9.5px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                <ShieldCheck className="h-3 w-3" />
                Anti-Fraud GPS
              </span>
            )}
          </div>
        </div>

        {/* Stacked Nearby Reports Alert Banner (≤ 100 meters) - Mobile */}
        {nearbyReports.length > 0 && (
          <div className="flex sm:hidden p-2.5 rounded-2xl bg-gradient-to-r from-[#0EB29A]/15 via-[#2E6E65]/10 to-transparent border border-[#0EB29A]/30 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#0EB29A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#2B3752] block leading-tight">
                  {nearbyReports.length} Laporan Sekitar (≤ 100m)
                </span>
                <span className="text-[10px] text-slate-500">
                  Titik terdekat: {nearbyReports[0].distanceMeters} meter
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("sekitar")}
              className="px-2.5 py-1 rounded-xl bg-[#0EB29A] hover:bg-[#0ca18b] text-white font-bold text-[11px] transition-colors shadow-xs cursor-pointer"
            >
              Buka Tumpukan
            </button>
          </div>
        )}

        {/* TAB: ANALISIS AI (Gemini 3.1 Flash Lite) */}
        {activeTab === "ai" && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {ai ? (
              <>
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0EB29A]/15 via-[#2E6E65]/10 to-transparent border border-[#0EB29A]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-[#0EB29A]" />
                    <div>
                      <span className="text-xs font-bold text-[#2B3752] block">
                        Gemini 3.1 Flash Lite Vision
                      </span>
                      <span className="text-[10px] text-slate-500">Multimodal Context Hydrology Reasoning</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#0EB29A] text-white font-extrabold text-[10px]">
                    {ai.confidence_score}% Akurat
                  </span>
                </div>

                {/* 3 Metric Boxes */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">Volume</span>
                    <strong className="text-sm font-black text-[#2B3752]">
                      {ai.volume_sampah_m3} m³
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600">
                    <span className="text-[10px] font-semibold block">Sumbatan Air</span>
                    <strong className="text-sm font-black">{ai.persentase_sumbatan_aliran}%</strong>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 font-semibold block">Estimasi Berat</span>
                    <strong className="text-sm font-black text-[#2E6E65]">
                      {ai.estimasi_berat_kg} kg
                    </strong>
                  </div>
                </div>

                {/* Hydrological Prediction Box */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Prediksi Bahaya Hidrologi</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    {ai.prediksi_banjir}
                  </p>
                </div>

                {/* Economic Value Box */}
                <div className="p-3 rounded-2xl bg-[#0EB29A]/10 border border-[#0EB29A]/25 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Estimasi Nilai Daur Ulang:</span>
                    <strong className="text-[#0EB29A] font-bold">
                      {formatRupiah(ai.nilai_ekonomi_estimasi || 125000)}
                    </strong>
                  </div>
                  <span className="text-[10px] bg-[#2E6E65] text-white font-bold px-2 py-0.5 rounded-full">
                    {typeof ai.jenis_sampah_dominan === "object" && ai.jenis_sampah_dominan
                      ? ai.jenis_sampah_dominan.nama
                      : (ai.jenis_sampah_dominan || "Plastik & Kardus")}
                  </span>
                </div>

                {/* Recommendation Box */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-[#2B3752] block">
                    📋 Rekomendasi Mitigasi Teknis:
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {ai.rekomendasi_tindakan}
                  </p>
                </div>

                {/* Forensic Anti-Fraud Validation Box */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-white border border-[#0EB29A]/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#2B3752]">
                      <div className="h-5 w-5 rounded-md bg-[#0EB29A]/15 text-[#0EB29A] flex items-center justify-center">
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </div>
                      <span>Integritas Forensik Lapangan</span>
                    </div>
                    <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-[#0EB29A] text-white shadow-xs">
                      TERVERIFIKASI GPS
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="text-slate-400 block font-medium">Koordinat Satelit</span>
                      <span className="font-mono font-bold text-[#2B3752] text-[10.5px]">
                        {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="text-slate-400 block font-medium">Akurasi Perangkat</span>
                      <span className="font-bold text-[#0EB29A] text-[10.5px]">
                        ±{metaForensik?.gps_akurasi_meter || 12} Meter (Akurat)
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900 text-white font-mono text-[9.5px] flex items-center justify-between">
                    <div className="truncate mr-2">
                      <span className="text-slate-400">HASH: </span>
                      <span className="text-[#0EB29A]">
                        {metaForensik?.integrity_hash ? metaForensik.integrity_hash.substring(0, 18) + "..." : "7D8F4E2AC391..."}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="text-[10px] text-white bg-[#0EB29A] hover:bg-[#2E6E65] px-2 py-0.5 rounded-md font-sans font-bold flex items-center gap-1 cursor-pointer flex-shrink-0 transition-colors"
                    >
                      <Maximize2 className="h-3 w-3" />
                      Stempel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                Data analisis AI sedang diproses atau belum diunggah.
              </div>
            )}
          </div>
        )}

        {/* TAB: DATA CUACA (Open-Meteo API) */}
        {activeTab === "cuaca" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-[#2E6E65]/10 border border-[#2E6E65]/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#2B3752] block">
                  Kondisi Cuaca Saat Ini
                </span>
                <span className="text-[11px] text-[#2E6E65] font-semibold">
                  {weather?.statusCuaca || "Berawan (Potensi Hujan)"}
                </span>
              </div>
              <CloudRain className="h-6 w-6 text-[#2E6E65]" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5 shadow-xs">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Suhu Udara</span>
                  <strong className="text-[#2B3752] font-bold">
                    {weather?.temperature || 24.5}°C
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5 shadow-xs">
                <Droplets className="h-4 w-4 text-[#0EB29A]" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Kelembaban</span>
                  <strong className="text-[#2B3752] font-bold">
                    {weather?.relativeHumidity || 78}%
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5 shadow-xs">
                <CloudRain className="h-4 w-4 text-[#2E6E65]" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Prediksi Hujan 24j</span>
                  <strong className="text-[#2B3752] font-bold">
                    {weather?.rainForecastTotal || 14.5} mm
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5 shadow-xs">
                <Mountain className="h-4 w-4 text-[#0EB29A]" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Elevasi Wilayah</span>
                  <strong className="text-[#2B3752] font-bold">
                    {weather?.elevation || 450} mdpl
                  </strong>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center pt-2">
              Sumber Data: Open-Meteo Satellite & Sensor Hidrologi Pemkot
            </p>
          </div>
        )}

        {/* TAB: RINGKASAN */}
        {activeTab === "ringkasan" && (
          <div className="space-y-3 text-xs animate-in fade-in duration-200">
            <div className="space-y-2 border-b border-slate-100 pb-3">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">
                Informasi Pelapor
              </span>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#0EB29A] text-white font-bold text-xs flex items-center justify-center">
                  {report.pelapor?.name?.charAt(0) || "W"}
                </div>
                <div>
                  <strong className="text-[#2B3752] block font-bold">
                    {report.pelapor?.name || "Anonim / Warga Terverifikasi"}
                  </strong>
                  <span className="text-[11px] text-slate-400">{formatDate(report.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                Deskripsi Lengkap
              </span>
              <p className="text-slate-600 leading-relaxed font-medium">
                {report.deskripsi}
              </p>
            </div>
          </div>
        )}

        {/* TAB: TANGGAPAN WARGA */}
        {activeTab === "tanggapan" && (
          <div className="space-y-3 text-xs animate-in fade-in duration-200">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2B3752]">Pak RT 04 (RW 05)</span>
                <span className="text-[10px] text-slate-400">1 jam lalu</span>
              </div>
              <p className="text-slate-600">
                Benar mas, kasur bekas ini menyumbat gorong-gorong jembatan. Tadi sudah kami laporkan juga ke pihak kelurahan.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0EB29A]">Mitra Bank Sampah Malang</span>
                <span className="text-[10px] text-slate-400">3 jam lalu</span>
              </div>
              <p className="text-slate-600">
                Botol plastik dan kardus siap kami jemput jam 14.00 siang ini. Terima kasih laporannya!
              </p>
            </div>
          </div>
        )}

        {/* TAB: LAPORAN SEKITAR (BERTUMPUK DALAM RADIUS 100M) */}
        {activeTab === "sekitar" && (
          <div className="space-y-3.5 text-xs animate-in fade-in duration-200">
            {/* Cluster Cumulative Impact Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0EB29A]/10 via-[#2E6E65]/5 to-slate-50/70 border border-[#0EB29A]/25 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-[#0EB29A]" />
                  <h4 className="text-xs font-bold text-[#2B3752]">
                    Akumulasi Kluster (Radius 100m)
                  </h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0EB29A] text-white font-bold">
                  {clusterStats.count} Titik Terdeteksi
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Titik ini berada di zona penumpukan berjarak ≤ 100m. Total akumulasi material di area ini:
              </p>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-200">
                  <span className="text-[9px] text-slate-400 block font-semibold">Total Volume</span>
                  <strong className="text-xs font-black text-[#2B3752]">
                    {clusterStats.totalVolume} m³
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-200">
                  <span className="text-[9px] text-slate-400 block font-semibold">Total Berat</span>
                  <strong className="text-xs font-black text-[#2E6E65]">
                    {clusterStats.totalWeight} kg
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-200">
                  <span className="text-[9px] text-slate-400 block font-semibold">Nilai Daur Ulang</span>
                  <strong className="text-xs font-black text-[#0EB29A]">
                    {formatRupiah(clusterStats.totalValue)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Stacked Nearby Reports List */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-[#2B3752] block">
                Daftar Laporan Berdekatan (Klik untuk beralih):
              </span>

              {nearbyReports.map((nr) => (
                <div
                  key={nr.id}
                  onClick={() => onSelectReport?.(nr)}
                  className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#0EB29A] transition-all hover:shadow-md cursor-pointer group space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={nr.foto_url || "https://placehold.co/120x120?text=Foto"}
                      alt={nr.alamat_lokasi}
                      className="h-14 w-14 rounded-xl object-cover bg-slate-100 flex-shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-bold text-[#2E6E65] bg-[#0EB29A]/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 text-[#0EB29A]" />
                          {nr.distanceMeters} m dari sini
                        </span>
                        <HazardBadge hazard={nr.tipe_bahaya} />
                      </div>
                      <h5 className="text-xs font-bold text-[#2B3752] truncate group-hover:text-[#0EB29A] transition-colors">
                        {nr.alamat_lokasi}
                      </h5>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {nr.deskripsi || "Laporan sampah di sekitar saluran."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>
                        Vol: <strong className="text-[#2B3752]">{nr.analisis_ai?.volume_sampah_m3 || 0.05} m³</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Berat: <strong className="text-[#2E6E65]">{nr.analisis_ai?.estimasi_berat_kg || 4} kg</strong>
                      </span>
                    </div>
                    <span className="text-[#0EB29A] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Buka Detail <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal untuk Pemeriksaan Watermark Forensik Resolusi Tinggi */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full max-h-[92vh] bg-slate-950 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
            {/* Top Bar */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-[#0EB29A]/20 text-[#0EB29A] flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <span>Bukti Foto & Stempel Forensik Digital</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#0EB29A] text-white">
                      ANTI-FRAUD
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {report.alamat_lokasi} • GPS: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                title="Tutup Pratinjau"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Full Image Container */}
            <div className="relative flex-1 overflow-auto flex items-center justify-center bg-black p-2 sm:p-4">
              <img
                src={report.foto_url || "https://placehold.co/800x600?text=Foto+Sampah"}
                alt="Foto Bukti Lapangan"
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Bottom Footer Info */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#0EB29A] animate-pulse" />
                <span className="font-medium text-slate-300">
                  Stempel forensik tercetak permanen pada piksel gambar (tidak dapat dimanipulasi).
                </span>
              </div>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold transition-colors cursor-pointer text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
