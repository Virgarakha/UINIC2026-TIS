"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  Search,
  Filter,
  Truck,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Coins,
  ChevronRight,
  Layers,
  Award,
  RefreshCw,
  Eye,
  UserCheck,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CitizenReportTrackerModal } from "@/components/shared/citizen-report-tracker-modal";
import { getStoredUser, setStoredSession, getStoredUserReports, isGuestUser } from "@/lib/auth-storage";
import { MOCK_LAPORAN_SAMPAH, fetchLaporanListApi } from "@/lib/api-client";
import { LaporanSampah, User } from "@/types";
import { cn, formatDate } from "@/lib/utils";

// Additional realistic history reports for Budi Santoso (warga demo)
const COMPLETED_REPORTS_MOCK: LaporanSampah[] = [
  {
    id: 98,
    pelapor_id: 2,
    pelapor: { id: 2, name: "Budi Santoso", email: "budi@warga.id", role: "warga", poin: 240 },
    kategori_id: 2,
    kategori: { id: 2, nama: "Kardus & Logam", slug: "kardus-logam", is_daur_ulang: true },
    status_id: 6,
    status: { id: 6, kode: "selesai", nama: "Selesai & Bersih", badge_color: "success", urutan: 6 },
    foto_url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
    deskripsi: "Kardus kemasan paket & besi siku sisa renovasi. [Opsi Warga: Jual ke Mitra Pengepul (Tunai)]",
    latitude: -7.9735,
    longitude: 112.6288,
    alamat_lokasi: "Jl. Besar Ijen No. 42, Klojen, Malang",
    is_resiko_banjir: false,
    tipe_bahaya: null,
    total_tanggapan: 6,
    total_foto_tambahan: 2,
    analisis_ai: {
      id: 98,
      laporan_id: 98,
      volume_sampah_m3: 1.2,
      persentase_sumbatan_aliran: 0,
      estimasi_berat_kg: 48,
      potensi_bahaya: null,
      prediksi_banjir: "Tidak berpotensi banjir.",
      confidence_score: 97.2,
      rekomendasi_tindakan: "Angkut dan serahkan ke pengepul daur ulang.",
      jenis_sampah_dominan: "Kardus & Logam",
      nilai_ekonomi_estimasi: 65000,
    },
    created_at: "2026-10-15T09:30:00.000Z",
  },
  {
    id: 95,
    pelapor_id: 2,
    pelapor: { id: 2, name: "Budi Santoso", email: "budi@warga.id", role: "warga", poin: 240 },
    kategori_id: 1,
    kategori: { id: 1, nama: "Plastik & Saluran Air", slug: "plastik-residu", is_daur_ulang: true },
    status_id: 6,
    status: { id: 6, kode: "selesai", nama: "Selesai & Bersih", badge_color: "success", urutan: 6 },
    foto_url: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=600&q=80",
    deskripsi: "Timbunan botol dan kantong plastik di selokan depan ruko. [Opsi Warga: Sedekah Lingkungan (+100 Poin)]",
    latitude: -7.9654,
    longitude: 112.6189,
    alamat_lokasi: "Jl. MT Haryono No. 112, Dinoyo, Malang",
    is_resiko_banjir: true,
    tipe_bahaya: "Banjir & Luapan Air",
    total_tanggapan: 9,
    total_foto_tambahan: 3,
    analisis_ai: {
      id: 95,
      laporan_id: 95,
      volume_sampah_m3: 3.1,
      persentase_sumbatan_aliran: 65,
      estimasi_berat_kg: 120,
      potensi_bahaya: "Banjir & Luapan Air",
      prediksi_banjir: "Potensi genangan air 25-40 cm.",
      confidence_score: 93.8,
      rekomendasi_tindakan: "Pembersihan segera saluran gorong-gorong.",
      jenis_sampah_dominan: "Plastik & Kemasan",
      nilai_ekonomi_estimasi: 42000,
    },
    created_at: "2026-10-12T14:15:00.000Z",
  },
];

export default function LaporanSayaPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [reports, setReports] = React.useState<LaporanSampah[]>([]);
  const [activeTab, setActiveTab] = React.useState<"semua" | "proses" | "selesai" | "banjir">("semua");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedTrackerReport, setSelectedTrackerReport] = React.useState<LaporanSampah | null>(null);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = React.useState(false);

  // Initialize user & reports
  const loadData = React.useCallback(() => {
    setIsLoading(true);
    const stored = getStoredUser();
    setUser(stored);

    // Fetch reports from backend + mock + user saved reports
    fetchLaporanListApi()
      .then((apiReports) => {
        const locallyCreated = getStoredUserReports();
        
        // Combine: locally created first, then API reports, then mock completed history
        const combined = [...locallyCreated, ...apiReports, ...COMPLETED_REPORTS_MOCK];
        
        // Remove duplicates by ID, prioritizing completed status
        const uniqueMap = new Map<number, LaporanSampah>();
        combined.forEach((rep) => {
          if (!uniqueMap.has(rep.id)) {
            uniqueMap.set(rep.id, rep);
          } else {
            const existing = uniqueMap.get(rep.id)!;
            const isRepCompleted = rep.status?.kode === "selesai" || rep.status?.kode === "tuntas" || (rep.status?.nama || "").toLowerCase().includes("selesai");
            if (isRepCompleted) {
              uniqueMap.set(rep.id, { ...existing, ...rep });
            }
          }
        });

        setReports(Array.from(uniqueMap.values()));
      })
      .catch(() => {
        const locallyCreated = getStoredUserReports();
        const fallback = [...locallyCreated, ...MOCK_LAPORAN_SAMPAH, ...COMPLETED_REPORTS_MOCK];
        const uniqueMap = new Map<number, LaporanSampah>();
        fallback.forEach((rep) => {
          if (!uniqueMap.has(rep.id)) {
            uniqueMap.set(rep.id, rep);
          } else {
            const existing = uniqueMap.get(rep.id)!;
            const isRepCompleted = rep.status?.kode === "selesai" || rep.status?.kode === "tuntas" || (rep.status?.nama || "").toLowerCase().includes("selesai");
            if (isRepCompleted) {
              uniqueMap.set(rep.id, { ...existing, ...rep });
            }
          }
        });
        setReports(Array.from(uniqueMap.values()));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  React.useEffect(() => {
    loadData();

    let ch: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        ch = new BroadcastChannel("uinic_armada_tracking");
        ch.onmessage = (e) => {
          if (e.data?.type === "TRUCK_MISSION_FINISHED" && e.data?.laporan_id) {
            setReports((prev) =>
              prev.map((r) =>
                r.id === e.data.laporan_id
                  ? {
                      ...r,
                      status: {
                        id: 6,
                        kode: "selesai",
                        nama: "Selesai Bersih",
                        badge_color: "success",
                        urutan: 6,
                      },
                    }
                  : r
              )
            );
          }
        };
      } catch {}
    }

    const handleStorageChange = () => {
      loadData();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("uinic_reports_changed", handleStorageChange);

    return () => {
      if (ch) ch.close();
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("uinic_reports_changed", handleStorageChange);
    };
  }, [loadData]);

  // Demo auto-login as warga
  const handleQuickLoginWarga = () => {
    const demoWarga: User = {
      id: 2,
      name: "Budi Santoso",
      email: "budi@ecocitizen.id",
      role: "warga",
      poin: 240,
      phone: "08123456789",
      no_telepon: "08123456789",
    };
    setStoredSession(demoWarga, "mock-token-warga");
    setUser(demoWarga);
  };

  // Filter reports
  const filteredReports = React.useMemo(() => {
    return reports.filter((rep) => {
      // Tab filter
      if (activeTab === "proses") {
        if (rep.status?.kode === "selesai") return false;
      } else if (activeTab === "selesai") {
        if (rep.status?.kode !== "selesai") return false;
      } else if (activeTab === "banjir") {
        if (!rep.is_resiko_banjir) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = rep.alamat_lokasi?.toLowerCase().includes(q);
        const matchDeskripsi = rep.deskripsi?.toLowerCase().includes(q);
        const matchKat = rep.kategori?.nama?.toLowerCase().includes(q);
        if (!matchTitle && !matchDeskripsi && !matchKat) return false;
      }

      return true;
    });
  }, [reports, activeTab, searchQuery]);

  // Stats calculation
  const totalCount = reports.length;
  const onProcessCount = reports.filter((r) => r.status?.kode !== "selesai").length;
  const completedCount = reports.filter((r) => r.status?.kode === "selesai").length;
  const totalEconomicValue = reports.reduce((acc, curr) => {
    return acc + (curr.analisis_ai?.nilai_ekonomi_estimasi || 35000);
  }, 0);

  const isGuest = isGuestUser(user);

  return (
    <div className="min-h-screen bg-[#FBFBF8] text-[#18231D] pb-24 md:pb-16">
      
      {/* 1. Header Section with Dark Forest Gradient */}
      <div className="bg-[#18231D] text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-emerald-950/40 relative overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0EB29A]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase tracking-wider border border-emerald-500/30">
                  {isGuest ? "Citizen Waste Radar • Pemantauan Terbuka" : "Citizen Waste-to-Cash Portal • Realtime Radar"}
                </span>
                <span className="text-xs text-slate-400">• Malang Raya</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {isGuest ? "Laporan Warga" : "Laporan & Pelacakan Saya"}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                {isGuest
                  ? "Pantau langsung laporan kebersihan lingkungan seluruh warga, verifikasi citra visual AI Gemini, serta transparansi penjemputan armada."
                  : "Pantau langsung status verifikasi AI Gemini, pergerakan armada penjemput sampah, estimasi uang tunai/poin reward, dan transparansi foto bersih."}
              </p>
            </div>

            {/* User Profile Card & Action CTA */}
            <div className="flex flex-wrap items-center gap-3">
              {isGuest ? (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <button
                      type="button"
                      className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <LogIn className="h-4 w-4 text-emerald-300" />
                      <span>Masuk Akun</span>
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-md">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0EB29A] to-emerald-400 text-[#18231D] font-black text-sm flex items-center justify-center shadow-xs">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white leading-tight">
                      {user?.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-emerald-300 font-semibold uppercase">
                        {user?.role}
                      </span>
                      <span className="text-white/40 text-[10px]">•</span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                        <Coins className="h-3 w-3" />
                        <span>{user?.poin || user?.poin_reward || 0} Poin</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Link href="/lapor">
                <Button className="h-11 px-5 rounded-2xl bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-[#0EB29A]/30 gap-2 cursor-pointer border border-emerald-400/30 active:scale-95 transition-all">
                  <Camera className="h-4 w-4" />
                  <span>+ Lapor Baru</span>
                </Button>
              </Link>
            </div>

          </div>

          {/* 4 Stat Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8">
            
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-300 font-medium">Total Laporan</p>
                <p className="text-lg sm:text-xl font-black text-white">{totalCount} Titik</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-[#0EB29A]/30 text-emerald-300 flex items-center justify-center">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-300 font-medium">Sedang Dijemput</p>
                <p className="text-lg sm:text-xl font-black text-emerald-300">{onProcessCount} Armada</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-300 font-medium">Selesai & Bersih</p>
                <p className="text-lg sm:text-xl font-black text-white">{completedCount} Tuntas</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-300 font-medium">Nilai Cuan Daur Ulang</p>
                <p className="text-base sm:text-lg font-black text-amber-300">
                  Rp {totalEconomicValue.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 2. Main Content Viewport */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-20">
        
        {/* Public Radar Informational Banner */}
        {isGuest && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#0EB29A] text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-xs">
                🌿
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">Akses Radar Publik Seluruh Warga</p>
                <p className="text-[11.5px] text-emerald-800/90 mt-0.5 leading-relaxed">
                  Halaman ini menampilkan seluruh <strong>Laporan Warga</strong> secara publik dan transparan. Untuk mengumpulkan poin reward setiap kali melapor serta menukarkan voucher, silakan masuk ke akun Anda.
                </p>
              </div>
            </div>
            <Link href="/login" className="flex-shrink-0">
              <Button size="sm" className="rounded-xl bg-[#0EB29A] hover:bg-[#2E6E65] text-white text-xs font-bold">
                Masuk Akun
              </Button>
            </Link>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg shadow-slate-200/60 border border-slate-200/80 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("semua")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "semua"
                  ? "bg-[#18231D] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Semua ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("proses")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                activeTab === "proses"
                  ? "bg-[#0EB29A] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Proses Jemput ({onProcessCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("selesai")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "selesai"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Selesai Bersih ({completedCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("banjir")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "banjir"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Kritis Banjir ({reports.filter((r) => r.is_resiko_banjir).length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px] sm:min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi atau jenis sampah..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#18231D] focus:outline-none focus:border-[#0EB29A] focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

        </div>

        {/* 3. Report Cards List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-[#0EB29A]" />
            <p className="text-xs font-bold">Memuat radar pelaporan Anda...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto">
            <div className="h-16 w-16 rounded-3xl bg-emerald-50 text-[#0EB29A] flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Camera className="h-8 w-8" />
            </div>
            <h3 className="text-base font-extrabold text-[#18231D]">Belum Ada Laporan Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Anda belum memiliki laporan pada filter ini. Mulai foto timbunan sampah bernilai ekonomi atau sumbatan saluran air untuk mendapatkan cuan & poin.
            </p>
            <Link href="/lapor" className="inline-block mt-5">
              <Button className="bg-[#18231D] hover:bg-[#25362D] text-white font-bold text-xs rounded-xl px-5 py-2.5">
                Buat Laporan Pertama (+50 Poin)
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const isCompleted = report.status?.kode === "selesai";
              const isOtw = report.status?.kode === "sedang_dibersihkan" || report.status?.kode === "siap_diambil_pengepul";
              const economicValue = report.analisis_ai?.nilai_ekonomi_estimasi || 35000;
              const weightKg = report.analisis_ai?.estimasi_berat_kg || 15;
              const isJualOption = report.deskripsi?.toLowerCase().includes("jual ke mitra") || !report.deskripsi?.toLowerCase().includes("sedekah");

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    
                    {/* Left: Report Image Thumbnail with Status Overlays */}
                    <div className="lg:col-span-3 relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200/80 group-hover:border-emerald-300 transition-colors">
                      <img
                        src={
                          report.foto_url && (report.foto_url.startsWith("http") || report.foto_url.startsWith("/"))
                            ? report.foto_url
                            : "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80"
                        }
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80";
                        }}
                        alt={report.alamat_lokasi}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-black/70 backdrop-blur-md text-white border border-white/20">
                          ID #{report.id}
                        </span>
                        {report.is_resiko_banjir && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600/90 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
                            <span>🌊 Siaga Banjir</span>
                          </span>
                        )}
                      </div>

                      {/* Bottom Status Ribbon */}
                      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between text-white text-[11px] font-bold">
                        <span className="truncate">{report.kategori?.nama || "Sampah Daur Ulang"}</span>
                        <span className="text-emerald-300 font-black">±{weightKg} kg</span>
                      </div>
                    </div>

                    {/* Middle: Details & 5-Step Mini Stepper */}
                    <div className="lg:col-span-6 flex flex-col justify-between space-y-3.5">
                      <div>
                        {/* Location & Time */}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {formatDate(report.created_at)}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">{report.pelapor?.name || "Budi Santoso"}</span>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-[#18231D] mt-1 leading-snug">
                          {report.alamat_lokasi}
                        </h3>

                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {report.deskripsi}
                        </p>
                      </div>

                      {/* 5-Step Horizontal Tracker Stepper */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <div className="flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5 text-[#0EB29A]" />
                            <span className="text-slate-800">
                              {isCompleted
                                ? "Status: Tuntas Bersih & Terangkut"
                                : isOtw
                                ? "Status: Armada OTW ke Lokasi Anda"
                                : "Status: Menunggu Penjemputan Mitra"}
                            </span>
                          </div>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                            isCompleted
                              ? "bg-emerald-100 text-emerald-800"
                              : isOtw
                              ? "bg-teal-100 text-teal-800 animate-pulse"
                              : "bg-amber-100 text-amber-800"
                          )}>
                            {isCompleted ? "Selesai" : isOtw ? "Dalam Perjalanan" : "Diverifikasi AI"}
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="grid grid-cols-5 gap-1 pt-1">
                          <div className="h-1.5 rounded-full bg-emerald-500" title="1. Diterima" />
                          <div className="h-1.5 rounded-full bg-emerald-500" title="2. Verifikasi AI" />
                          <div className={cn("h-1.5 rounded-full", (isOtw || isCompleted) ? "bg-emerald-500" : "bg-slate-200")} title="3. Driver Ditugaskan" />
                          <div className={cn("h-1.5 rounded-full", isCompleted ? "bg-emerald-500" : isOtw ? "bg-emerald-500 animate-pulse" : "bg-slate-200")} title="4. Armada OTW" />
                          <div className={cn("h-1.5 rounded-full", isCompleted ? "bg-emerald-500" : "bg-slate-200")} title="5. Tuntas Bersih" />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                          <span>Diterima</span>
                          <span>AI Valid</span>
                          <span>Driver</span>
                          <span>OTW</span>
                          <span>Bersih</span>
                        </div>
                      </div>

                      {/* Driver Info Pill (if assigned) */}
                      {(isOtw || isCompleted) && (
                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">
                              🚛
                            </div>
                            <div>
                              <span className="font-bold text-emerald-950 block text-[11px] leading-tight">
                                Pak Slamet (Mitra DLH)
                              </span>
                              <span className="text-[10px] text-emerald-700">Truk Bak N 8472 AB • ⭐ 4.9</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-800">
                            {isCompleted ? "Tuntas Bersih ✓" : "ETA: ~6 Menit"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Value Calculation & Action Buttons */}
                    <div className="lg:col-span-3 flex flex-col justify-between h-full space-y-4 lg:border-l lg:border-slate-100 lg:pl-5">
                      
                      {/* Cuan / Poin Box */}
                      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                            {isJualOption ? "Estimasi Jual Tunai" : "Sedekah Lingkungan"}
                          </span>
                          <Coins className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                        <p className="text-xl font-black text-amber-950 mt-1">
                          Rp {economicValue.toLocaleString("id-ID")}
                        </p>
                        <p className="text-[10px] text-amber-800 mt-0.5">
                          {isJualOption ? "💵 Dibayar tunai saat angkut" : "🎁 Ditukar +100 EcoPoints"}
                        </p>
                      </div>

                      {/* Action CTAs */}
                      <div className="flex flex-col gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTrackerReport(report);
                            setIsTrackerModalOpen(true);
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-[#0EB29A]/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          <span>Lacak Status Realtime</span>
                        </button>

                        <Link
                          href={`/peta?id=${report.id}`}
                          className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Buka di Peta Radar</span>
                        </Link>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 4. Live Citizen Report Tracker Modal */}
      <CitizenReportTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => {
          setIsTrackerModalOpen(false);
          setSelectedTrackerReport(null);
        }}
        report={selectedTrackerReport}
        user={user}
        onViewOnMap={(rep) => {
          router.push(`/peta?id=${rep.id}`);
        }}
      />

    </div>
  );
}
