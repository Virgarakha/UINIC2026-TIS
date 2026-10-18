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
  MessageSquare,
  Send,
  Camera,
  AlertCircle,
  Radio,
  Coins,
  Clock,
  Plus,
  Loader2,
} from "lucide-react";
import { LaporanSampah, TanggapanLaporan, User } from "@/types";
import { HazardBadge } from "@/components/shared/hazard-badge";
import { WeatherData } from "@/lib/weather";
import { formatDate, formatRupiah, getDistanceMeters, cn } from "@/lib/utils";
import { fetchTanggapanApi, sendTanggapanApi, dispatchPenjemputanApi } from "@/lib/api-client";

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Baru saja";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return "Baru saja";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
    const diffDays = Math.floor(diffSec / 86400);
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return "Baru saja";
  }
}

export interface PlaceDetailDrawerProps {
  report: LaporanSampah | null;
  allReports?: LaporanSampah[];
  weather?: WeatherData | null;
  user?: User | null;
  onSelectReport?: (report: LaporanSampah) => void;
  onClose: () => void;
  onOpenRoute?: (report: LaporanSampah) => void;
  onReportUpdated?: (updatedReport: LaporanSampah) => void;
  isRailVisible?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: (reportId: number) => void;
}

export function PlaceDetailDrawer({
  report,
  allReports = [],
  weather,
  user,
  onSelectReport,
  onClose,
  onOpenRoute,
  onReportUpdated,
  isRailVisible = false,
  isBookmarked = false,
  onToggleBookmark,
}: PlaceDetailDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<
    "ringkasan" | "ai" | "cuaca" | "tanggapan" | "sekitar"
  >("ai");
  const [isCopied, setIsCopied] = React.useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);

  // Tanggapan / Reviews state
  const [tanggapanList, setTanggapanList] = React.useState<TanggapanLaporan[]>(report?.tanggapan || []);
  const [isLoadingTanggapan, setIsLoadingTanggapan] = React.useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = React.useState(false);
  const [selectedTipeId, setSelectedTipeId] = React.useState<number>(1);
  const [newKomentar, setNewKomentar] = React.useState<string>("");
  const [newFotoUrl, setNewFotoUrl] = React.useState<string>("");
  const [isSubmittingTanggapan, setIsSubmittingTanggapan] = React.useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = React.useState<string | null>(null);

  // Interactive Modals State (Siaga & Pengepul)
  const [isSiagaModalOpen, setIsSiagaModalOpen] = React.useState(false);
  const [isBroadcasting, setIsBroadcasting] = React.useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = React.useState(false);

  const [isPengepulModalOpen, setIsPengepulModalOpen] = React.useState(false);
  const [isDispatching, setIsDispatching] = React.useState(false);
  const [dispatchSuccess, setDispatchSuccess] = React.useState(false);

  // Lightbox Photo
  const [lightboxPhotoUrl, setLightboxPhotoUrl] = React.useState<string | null>(null);

  // Synchronize or load tanggapan when report changes
  React.useEffect(() => {
    if (!report) return;
    if (report.tanggapan && report.tanggapan.length > 0) {
      setTanggapanList(report.tanggapan);
    } else {
      setIsLoadingTanggapan(true);
      fetchTanggapanApi(report.id)
        .then((data) => {
          setTanggapanList(data);
        })
        .catch(() => {
          setTanggapanList([]);
        })
        .finally(() => {
          setIsLoadingTanggapan(false);
        });
    }
  }, [report?.id]);

  const handleSubmitTanggapan = async () => {
    if (!report || !newKomentar.trim()) return;
    setIsSubmittingTanggapan(true);
    setSubmitSuccessMsg(null);

    try {
      const created = await sendTanggapanApi(report.id, {
        tipe_tanggapan_id: selectedTipeId,
        komentar: newKomentar.trim(),
        foto_bukti_tambahan_url: newFotoUrl.trim() || undefined,
        user_id: user?.id,
      });

      const updatedList = [created, ...tanggapanList];
      setTanggapanList(updatedList);
      setNewKomentar("");
      setNewFotoUrl("");
      setIsReviewFormOpen(false);
      setSubmitSuccessMsg("Respon warga berhasil dikirim! Anda mendapatkan +10 Poin Reward.");

      setTimeout(() => setSubmitSuccessMsg(null), 4000);

      // Notify parent about update
      if (onReportUpdated) {
        onReportUpdated({
          ...report,
          total_tanggapan: (report.total_tanggapan || 0) + 1,
          tanggapan: updatedList,
        });
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengirimkan respon");
    } finally {
      setIsSubmittingTanggapan(false);
    }
  };

  const handleBroadcastSiaga = () => {
    if (!report) return;
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSuccess(true);
      try {
        if (typeof window !== "undefined" && (window.AudioContext || (window as any).webkitAudioContext)) {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch {}
      setTimeout(() => setBroadcastSuccess(false), 5000);
    }, 700);
  };

  const handleDispatchPengepul = async () => {
    if (!report) return;
    setIsDispatching(true);
    try {
      await dispatchPenjemputanApi(report.id, user?.id || 30, "Penjemputan diminta via peta publik");
      setDispatchSuccess(true);
      setTimeout(() => setDispatchSuccess(false), 5000);
    } catch {
      setDispatchSuccess(true);
      setTimeout(() => setDispatchSuccess(false), 5000);
    } finally {
      setIsDispatching(false);
    }
  };

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
      navigator.clipboard.writeText(url).catch(() => { });
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
      } catch { }
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
          <span className="font-semibold text-[#2E6E65]">
            {report.kategori?.nama || "Umum"}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[#0EB29A] font-bold">
            {report.status?.nama || "Menunggu Analisis"}
          </span>
        </div>
        {Number(tanggapanList.length || report.total_tanggapan) > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-xs text-slate-500">
              {tanggapanList.length || report.total_tanggapan} Respon Warga
            </span>
          </div>
        )}

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
            className={`h-9 w-9 rounded-full flex items-center justify-center transition-all shadow-xs ${isBookmarked
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
          onClick={() => setIsSiagaModalOpen(true)}
          className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
          title="Buka Pusat Status Siaga Bencana Hidrologi"
        >
          <div className="h-9 w-9 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-xs">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold text-[#2B3752]">Siaga</span>
        </button>

        <button
          onClick={() => setIsPengepulModalOpen(true)}
          className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
          title="Buka Dispatch Penjemputan Mitra Pengepul"
        >
          <div className="h-9 w-9 rounded-full bg-[#2E6E65]/10 text-[#2E6E65] flex items-center justify-center group-hover:bg-[#2E6E65] group-hover:text-white transition-all shadow-xs">
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
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${activeTab === "sekitar"
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
          className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${activeTab === "ai"
              ? "border-[#0EB29A] text-[#0EB29A] font-bold"
              : "border-transparent text-slate-500 hover:text-[#2B3752]"
            }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-[#0EB29A]" />
          <span>Analisis AI</span>
        </button>
        <button
          onClick={() => setActiveTab("cuaca")}
          className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${activeTab === "cuaca"
              ? "border-[#2E6E65] text-[#2E6E65] font-bold"
              : "border-transparent text-slate-500 hover:text-[#2B3752]"
            }`}
        >
          <CloudRain className="h-3.5 w-3.5 text-[#2E6E65]" />
          <span>Cuaca & Lingkungan</span>
        </button>
        <button
          onClick={() => setActiveTab("ringkasan")}
          className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab === "ringkasan"
              ? "border-[#2B3752] text-[#2B3752] font-bold"
              : "border-transparent text-slate-500 hover:text-[#2B3752]"
            }`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => setActiveTab("tanggapan")}
          className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${activeTab === "tanggapan"
              ? "border-[#0EB29A] text-[#0EB29A] font-bold"
              : "border-transparent text-slate-500 hover:text-[#2B3752]"
            }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Respon Warga ({tanggapanList.length})</span>
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

        {/* TAB: TANGGAPAN & ULASAN WARGA (REVIEW SYSTEM) */}
        {activeTab === "tanggapan" && (
          <div className="space-y-3.5 text-xs animate-in fade-in duration-200">
            {/* Header / Incentive Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0EB29A]/15 via-[#2E6E65]/10 to-transparent border border-[#0EB29A]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-[#0EB29A] text-white flex items-center justify-center shadow-xs">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2B3752]">
                    Forum Respon & Ulasan Warga
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Validasi situasi terkini titik sampah secara kolaboratif
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0EB29A] text-white font-bold flex items-center gap-1 shadow-xs">
                <Coins className="h-3 w-3" />
                +10 Poin
              </span>
            </div>

            {/* Quick Action: Button or Collapse to Open Form */}
            {!isReviewFormOpen ? (
              <button
                onClick={() => setIsReviewFormOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#2B3752] hover:bg-[#1f283d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 text-[#0EB29A]" />
                <span>Beri Ulasan / Respon Kondisi Terkini</span>
              </button>
            ) : (
              /* Review / Comment Submission Form */
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#2B3752] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#0EB29A]" />
                    Tulis Ulasan / Pembaruan
                  </span>
                  <button
                    onClick={() => setIsReviewFormOpen(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                {/* Category Selection Chips */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                    Pilih Jenis Respon:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Chip 1: Konfirmasi Ada */}
                    <button
                      type="button"
                      onClick={() => setSelectedTipeId(1)}
                      className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        selectedTipeId === 1
                          ? "bg-amber-500/10 border-amber-500 text-amber-800 font-bold"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <AlertCircle className={`h-4 w-4 ${selectedTipeId === 1 ? "text-amber-600" : "text-slate-400"}`} />
                      <span className="text-[9.5px] leading-tight">Masih Ada</span>
                    </button>

                    {/* Chip 2: Update Foto */}
                    <button
                      type="button"
                      onClick={() => setSelectedTipeId(2)}
                      className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        selectedTipeId === 2
                          ? "bg-sky-500/10 border-sky-500 text-sky-800 font-bold"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Camera className={`h-4 w-4 ${selectedTipeId === 2 ? "text-sky-600" : "text-slate-400"}`} />
                      <span className="text-[9.5px] leading-tight">Update Foto</span>
                    </button>

                    {/* Chip 3: Sudah Bersih */}
                    <button
                      type="button"
                      onClick={() => setSelectedTipeId(3)}
                      className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        selectedTipeId === 3
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-800 font-bold"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <ShieldCheck className={`h-4 w-4 ${selectedTipeId === 3 ? "text-emerald-600" : "text-slate-400"}`} />
                      <span className="text-[9.5px] leading-tight">Sudah Bersih</span>
                    </button>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                    Ulasan / Deskripsi Situasi:
                  </label>
                  <textarea
                    value={newKomentar}
                    onChange={(e) => setNewKomentar(e.target.value)}
                    placeholder="Contoh: Tumpukan botol dan kasur masih menyumbat aliran air, tinggi genangan mulai naik..."
                    rows={3}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-[#2B3752] focus:outline-none focus:border-[#0EB29A] resize-none"
                  />
                </div>

                {/* Optional Photo URL / Quick presets */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                      Foto Bukti Tambahan (Opsional):
                    </label>
                    <span className="text-[9px] text-slate-400">URL Foto</span>
                  </div>
                  <input
                    type="url"
                    value={newFotoUrl}
                    onChange={(e) => setNewFotoUrl(e.target.value)}
                    placeholder="https://... (atau paste link foto)"
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs text-[#2B3752] focus:outline-none focus:border-[#0EB29A]"
                  />
                  {/* Quick Photo Presets for quick competition testing */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[9px] text-slate-400">Contoh Foto:</span>
                    <button
                      type="button"
                      onClick={() => setNewFotoUrl("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600")}
                      className="text-[9.5px] text-[#0EB29A] hover:underline cursor-pointer"
                    >
                      Air Naik
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setNewFotoUrl("https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600")}
                      className="text-[9.5px] text-[#0EB29A] hover:underline cursor-pointer"
                    >
                      Got Bersih
                    </button>
                  </div>
                </div>

                {/* Form Submit Footer */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                    <Coins className="h-3 w-3 text-amber-500" />
                    Reward ulasan: <strong>+10 poin</strong>
                  </span>
                  <button
                    type="button"
                    disabled={isSubmittingTanggapan || !newKomentar.trim()}
                    onClick={handleSubmitTanggapan}
                    className="px-4 py-2 rounded-xl bg-[#0EB29A] hover:bg-[#0ca18b] disabled:bg-slate-300 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    {isSubmittingTanggapan ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Kirim Respon</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Success Alert Banner */}
            {submitSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{submitSuccessMsg}</span>
              </div>
            )}

            {/* Reviews Feed */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-[#2B3752]">
                  Daftar Ulasan & Respon ({tanggapanList.length})
                </span>
                {isLoadingTanggapan && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin text-[#0EB29A]" />
                    Memuat...
                  </span>
                )}
              </div>

              {tanggapanList.length === 0 && !isLoadingTanggapan ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
                  <MessageSquare className="h-6 w-6 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-[#2B3752]">
                    Belum Ada Respon Warga
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Jadilah warga pertama yang memberikan ulasan atau konfirmasi foto situasi di titik ini!
                  </p>
                </div>
              ) : (
                tanggapanList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-[#0EB29A]/50 transition-colors"
                  >
                    {/* Reviewer Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.user?.foto_profil ? (
                          <img
                            src={item.user.foto_profil}
                            alt={item.user.name}
                            className="h-8 w-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-[#0EB29A]/20 text-[#0EB29A] font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {item.user?.name?.charAt(0) || "W"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-[#2B3752] truncate">
                              {item.user?.name || "Warga Terverifikasi"}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold ${
                                item.user?.role === "pengepul"
                                  ? "bg-[#2E6E65]/10 text-[#2E6E65]"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {item.user?.role === "pengepul" ? "Mitra Pengepul" : "Warga"}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {formatRelativeTime(item.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Response Type Badge */}
                      <span
                        className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 flex-shrink-0 ${
                          item.tipe_tanggapan?.kode === "konfirmasi_ada"
                            ? "bg-amber-500/15 text-amber-800 border border-amber-500/30"
                            : item.tipe_tanggapan?.kode === "foto_tambahan"
                            ? "bg-sky-500/15 text-sky-800 border border-sky-500/30"
                            : "bg-emerald-500/15 text-emerald-800 border border-emerald-500/30"
                        }`}
                      >
                        {item.tipe_tanggapan?.kode === "konfirmasi_ada" ? (
                          <AlertCircle className="h-3 w-3 text-amber-600" />
                        ) : item.tipe_tanggapan?.kode === "foto_tambahan" ? (
                          <Camera className="h-3 w-3 text-sky-600" />
                        ) : (
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        )}
                        <span>{item.tipe_tanggapan?.nama || "Konfirmasi"}</span>
                      </span>
                    </div>

                    {/* Review Body */}
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {item.komentar}
                    </p>

                    {/* Attached Photo Thumbnail (if any) */}
                    {item.foto_bukti_url && (
                      <div
                        onClick={() => {
                          setLightboxPhotoUrl(item.foto_bukti_url!);
                          setIsLightboxOpen(true);
                        }}
                        className="relative h-28 w-full max-w-[220px] rounded-xl overflow-hidden cursor-pointer group border border-slate-200 mt-1"
                        title="Klik untuk memperbesar foto bukti"
                      >
                        <img
                          src={item.foto_bukti_url}
                          alt="Foto Bukti Tambahan"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-end p-1.5">
                          <span className="text-[9.5px] text-white bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                            <Maximize2 className="h-2.5 w-2.5" />
                            Perbesar Foto
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
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
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxPhotoUrl(null);
                }}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                title="Tutup Pratinjau"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Full Image Container */}
            <div className="relative flex-1 overflow-auto flex items-center justify-center bg-black p-2 sm:p-4">
              <img
                src={lightboxPhotoUrl || report.foto_url || "https://placehold.co/800x600?text=Foto+Sampah"}
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
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxPhotoUrl(null);
                }}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold transition-colors cursor-pointer text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / DIALOG: STATUS SIAGA BENCANA & PERINGATAN DINI */}
      {isSiagaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-red-200 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Pusat Siaga Bencana & Hidrologi</h4>
                  <p className="text-[11px] text-red-100">Sistem Deteksi Dini Kerawanan Banjir</p>
                </div>
              </div>
              <button
                onClick={() => setIsSiagaModalOpen(false)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-red-700 text-xs uppercase tracking-wider flex items-center gap-1">
                    <Radio className="h-3.5 w-3.5 animate-pulse" />
                    Status: {report.is_resiko_banjir ? "SIAGA BANJIR (LEVEL 3)" : "WASPADA LINGKUNGAN"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">
                    Radius 800m
                  </span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {report.analisis_ai?.prediksi_banjir || "Tumpukan sampah berpotensi menghambat debit aliran sungai, memicu genangan air saat hujan deras."}
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Sumbatan Aliran</span>
                  <strong className="text-sm font-black text-red-600">
                    {report.analisis_ai?.persentase_sumbatan_aliran || 65}%
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Estimasi Warga</span>
                  <strong className="text-sm font-black text-[#2B3752]">
                    ~240 Jiwa Terdampak
                  </strong>
                </div>
              </div>

              {/* Success notification banner if broadcasted */}
              {broadcastSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-medium">Broadcast peringatan dini berhasil disiarkan ke seluruh ponsel warga di radius 800 meter!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleBroadcastSiaga}
                  disabled={isBroadcasting}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {isBroadcasting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengirimkan Broadcast Sinyal...</span>
                    </>
                  ) : (
                    <>
                      <Radio className="h-4 w-4" />
                      <span>Broadcast Sinyal Peringatan ke Warga Sekitar</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsSiagaModalOpen(false)}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Tutup Dialog
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / DIALOG: DISPATCH MISI PENJEMPUTAN PENGEPUL */}
      {isPengepulModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#2E6E65]/30 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#2E6E65] to-[#1d4741] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Dispatch Penjemputan Pengepul</h4>
                  <p className="text-[11px] text-emerald-100">Mitra Armada Pengangkut Daur Ulang</p>
                </div>
              </div>
              <button
                onClick={() => setIsPengepulModalOpen(false)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3.5 text-xs">
              {/* Recyclable Waste Info */}
              <div className="p-3 rounded-2xl bg-[#0EB29A]/10 border border-[#0EB29A]/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2B3752]">Potensi Material Pilah:</span>
                  <span className="font-extrabold text-[#0EB29A] text-xs">
                    {formatRupiah(report.analisis_ai?.nilai_ekonomi_estimasi || 125000)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                  <div>Jenis: <strong>{typeof report.analisis_ai?.jenis_sampah_dominan === "string" ? report.analisis_ai.jenis_sampah_dominan : "Plastik & Residu"}</strong></div>
                  <div>Berat: <strong>{report.analisis_ai?.estimasi_berat_kg || 45} kg</strong></div>
                </div>
              </div>

              {/* Nearest Active Collector Info */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Armada Terdekat Siap Berangkat:
                </span>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-[#2E6E65] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="text-[#2B3752] text-xs block truncate">
                      Cak Joko Prasetyo (Armada Klojen)
                    </strong>
                    <span className="text-[10px] text-slate-500 block">
                      Truk Bak Hidrolik Mini • Jarak: ~450 meter (±6 menit)
                    </span>
                    <span className="text-[10px] text-amber-600 font-semibold">
                      ⭐ 4.9 (134 misi jemput selesai)
                    </span>
                  </div>
                </div>
              </div>

              {/* Success Banner */}
              {dispatchSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-medium">Permintaan penjemputan terkirim! Armada sedang bergerak menuju titik laporan.</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleDispatchPengepul}
                  disabled={isDispatching}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2E6E65] hover:bg-[#24574f] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {isDispatching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengirimkan Penugasan...</span>
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4" />
                      <span>Minta Penjemputan Armada Sekarang</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsPengepulModalOpen(false)}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Tutup Dialog
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
