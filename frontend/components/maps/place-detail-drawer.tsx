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

  return (
    <div
      className={cn(
        "absolute top-4 z-30 w-[calc(100vw-32px)] sm:w-[410px] max-h-[calc(100vh-32px)] bg-white rounded-3xl shadow-2xl shadow-slate-300/50 border border-slate-200/90 flex flex-col overflow-hidden animate-in slide-in-from-left duration-300 transition-all",
        isRailVisible ? "left-4 sm:left-[80px]" : "left-4"
      )}
    >
      {/* 1. Header Banner Image with Close Button */}
      <div className="relative h-48 w-full bg-slate-900 flex-shrink-0 overflow-hidden">
        <img
          src={report.foto_url || "https://placehold.co/600x400?text=Foto+Sampah"}
          alt={report.alamat_lokasi}
          className="w-full h-full object-cover brightness-95"
        />

        {/* Top Floating Badge & Close Button */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <HazardBadge hazard={report.tipe_bahaya} />
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer shadow-md"
            title="Tutup Detail"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom Coordinates Capsule */}
        <div className="absolute bottom-2.5 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
          {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
        </div>
      </div>

      {/* 2. Place Title, Status & Address Block */}
      <div className="p-4 border-b border-slate-100 flex-shrink-0 space-y-1.5 bg-white">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base sm:text-lg font-black text-[#2B3752] leading-tight">
            {report.alamat_lokasi}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
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

        <p className="text-xs text-slate-500 line-clamp-2">{report.deskripsi}</p>
      </div>

      {/* Stacked Nearby Reports Alert Banner (≤ 100 meters) */}
      {nearbyReports.length > 0 && (
        <div className="mx-3.5 my-2 p-2.5 rounded-2xl bg-gradient-to-r from-[#0EB29A]/15 via-[#2E6E65]/10 to-transparent border border-[#0EB29A]/30 flex items-center justify-between">
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
    </div>
  );
}
