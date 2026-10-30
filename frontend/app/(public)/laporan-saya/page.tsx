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
      
      {/* 1. Header Section (Clean, Editorial, Unified Brand Aesthetic) */}
      <div className="bg-white border-b border-[#E8EDE5] pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E8EDE5]">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#18231D]">
                {isGuest ? "Laporan Sampah & Saluran Warga" : "Laporan & Pelacakan"}
              </h1>
              <p className="text-sm text-[#4B5950] mt-2 leading-relaxed">
                Transparansi pelaporan titik sumbatan saluran air, estimasi volume material daur ulang bernilai ekonomis, dan pemantauan penjemputan armada Kota Malang.
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3 shrink-0">
              {isGuest ? (
                <Link href="/login">
                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl border border-[#DFE7DD] bg-white hover:bg-slate-50 text-xs font-semibold text-[#18231D] transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <LogIn className="h-4 w-4 text-[#1E5345]" />
                    <span>Masuk Akun</span>
                  </button>
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#FAFBF9] border border-[#DFE7DD]">
                  <div className="h-8 w-8 rounded-lg bg-[#1E5345] text-white font-bold text-xs flex items-center justify-center">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <span className="text-xs font-semibold block text-[#18231D] leading-tight">
                      {user?.name}
                    </span>
                    <span className="text-[11px] font-semibold text-[#1E5345] flex items-center gap-1 mt-0.5">
                      <Coins className="h-3 w-3 text-amber-500" />
                      {user?.poin || user?.poin_reward || 0} Poin Reward
                    </span>
                  </div>
                </div>
              )}

              <Link href="/lapor">
                <Button className="h-10 px-5 rounded-xl bg-[#1E5345] hover:bg-[#153D32] text-white font-semibold text-xs shadow-sm gap-2 cursor-pointer transition-all active:scale-98">
                  <Camera className="h-4 w-4" />
                  <span>+ Lapor Baru</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* 4 Clean Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAFBF9] border border-[#DFE7DD] flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-[#1E5345]/10 text-[#1E5345] flex items-center justify-center shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#63756A] uppercase tracking-wider">Total Laporan</p>
                <p className="text-xl sm:text-2xl font-bold text-[#18231D] tracking-tight">{totalCount} <span className="text-xs font-medium text-[#63756A]">Titik</span></p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAFBF9] border border-[#DFE7DD] flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-[#1E5345]/10 text-[#1E5345] flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#63756A] uppercase tracking-wider">Dalam Proses</p>
                <p className="text-xl sm:text-2xl font-bold text-[#18231D] tracking-tight">{onProcessCount} <span className="text-xs font-medium text-[#63756A]">Armada</span></p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAFBF9] border border-[#DFE7DD] flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-[#1E5345]/10 text-[#1E5345] flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#63756A] uppercase tracking-wider">Tuntas Bersih</p>
                <p className="text-xl sm:text-2xl font-bold text-[#18231D] tracking-tight">{completedCount} <span className="text-xs font-medium text-[#63756A]">Lokasi</span></p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAFBF9] border border-[#DFE7DD] flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-[#1E5345]/10 text-[#1E5345] flex items-center justify-center shrink-0">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#63756A] uppercase tracking-wider">Estimasi Daur Ulang</p>
                <p className="text-base sm:text-xl font-bold text-[#18231D] tracking-tight">
                  Rp {totalEconomicValue.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 2. Main Content Viewport */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Guest Informational Callout (if guest) */}
        {isGuest && (
          <div className="mb-6 p-4 rounded-2xl bg-white border border-[#DFE7DD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#1E5345]/10 text-[#1E5345] flex items-center justify-center shrink-0">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#18231D]">Mode Pemantauan Terbuka Warga</p>
                <p className="text-xs text-[#4B5950] mt-0.5 leading-relaxed">
                  Data laporan ini ditampilkan secara transparan untuk pengawasan bersama. Masuk ke akun Anda untuk mendapatkan poin reward setiap kali melapor.
                </p>
              </div>
            </div>
            <Link href="/login" className="shrink-0">
              <Button size="sm" className="rounded-xl bg-[#1E5345] hover:bg-[#153D32] text-white text-xs font-semibold">
                Masuk Akun
              </Button>
            </Link>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          
          {/* Filter Segmented Controls */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("semua")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "semua"
                  ? "bg-[#18231D] text-white shadow-xs"
                  : "bg-white text-[#4B5950] border border-[#DFE7DD] hover:bg-slate-50"
              )}
            >
              Semua ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("proses")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                activeTab === "proses"
                  ? "bg-[#18231D] text-white shadow-xs"
                  : "bg-white text-[#4B5950] border border-[#DFE7DD] hover:bg-slate-50"
              )}
            >
              <Truck className="h-3.5 w-3.5 text-[#10B981]" />
              <span>Dalam Proses ({onProcessCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("selesai")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                activeTab === "selesai"
                  ? "bg-[#18231D] text-white shadow-xs"
                  : "bg-white text-[#4B5950] border border-[#DFE7DD] hover:bg-slate-50"
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
              <span>Tuntas Bersih ({completedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("banjir")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                activeTab === "banjir"
                  ? "bg-[#18231D] text-white shadow-xs"
                  : "bg-white text-[#4B5950] border border-[#DFE7DD] hover:bg-slate-50"
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>Saluran Rawan ({reports.filter((r) => r.is_resiko_banjir).length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px] sm:min-w-[300px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C9B90]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi atau kategori sampah..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#DFE7DD] text-xs text-[#18231D] focus:outline-none focus:border-[#1E5345] focus:ring-1 focus:ring-[#1E5345] transition-all placeholder:text-[#8C9B90]"
            />
          </div>

        </div>

        {/* 3. Report Cards List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-[#1E5345]" />
            <p className="text-xs font-semibold text-[#63756A]">Memuat data laporan wilayah...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#DFE7DD] shadow-xs max-w-lg mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-[#1E5345]/10 text-[#1E5345] flex items-center justify-center mx-auto mb-4">
              <Camera className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#18231D]">Belum Ada Laporan Ditemukan</h3>
            <p className="text-xs text-[#63756A] mt-1 max-w-sm mx-auto leading-relaxed">
              Tidak ada data laporan pada filter ini. Mulai ambil foto titik timbunan sampah atau sumbatan saluran air untuk penanganan cepat.
            </p>
            <Link href="/lapor" className="inline-block mt-5">
              <Button className="bg-[#1E5345] hover:bg-[#153D32] text-white font-semibold text-xs rounded-xl px-5 py-2.5">
                Buat Laporan Baru (+50 Poin)
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
              const volumeM3 = report.analisis_ai?.volume_sampah_m3 || 0.8;
              const isJualOption = report.deskripsi?.toLowerCase().includes("jual ke mitra") || !report.deskripsi?.toLowerCase().includes("sedekah");

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DFE7DD] shadow-2xs hover:border-[#1E5345]/40 hover:shadow-md transition-all group"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left: Report Image Thumbnail with Clean Subtle Badges */}
                    <div className="lg:col-span-3 relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-[#DFE7DD] group-hover:border-[#1E5345]/30 transition-colors">
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
                      
                      {/* Top ID badge */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/75 backdrop-blur-xs text-white">
                          #{report.id}
                        </span>
                        {report.is_resiko_banjir && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-600/90 text-white backdrop-blur-xs flex items-center gap-1">
                            <span>Siaga Banjir</span>
                          </span>
                        )}
                      </div>

                      {/* Bottom Weight & Volume Strip */}
                      <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-[11px] font-medium">
                        <span className="truncate">{report.kategori?.nama || "Daur Ulang"}</span>
                        <span className="font-semibold text-emerald-300">±{weightKg} kg</span>
                      </div>
                    </div>

                    {/* Middle: Details & Clean Progress Pipeline */}
                    <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Meta header: Category Pill + Timestamp & Author */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#FAFBF9] border border-[#DFE7DD] text-[#4B5950] font-semibold text-[11px]">
                            {report.kategori?.nama || "Kategori Umum"}
                          </span>
                          
                          <div className="flex items-center gap-1.5 text-xs text-[#63756A]">
                            <Clock className="h-3.5 w-3.5 text-[#8C9B90]" />
                            <span>{formatDate(report.created_at)}</span>
                            <span>•</span>
                            <span className="font-medium text-[#18231D] truncate max-w-[150px]">
                              {report.pelapor?.name || "Warga Pelapor"}
                            </span>
                          </div>
                        </div>

                        {/* Location Title */}
                        <h3 className="text-base sm:text-lg font-bold text-[#18231D] leading-snug">
                          {report.alamat_lokasi}
                        </h3>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-[#4B5950] mt-1.5 line-clamp-2 leading-relaxed">
                          {report.deskripsi}
                        </p>
                      </div>

                      {/* Clean Progress Pipeline Stepper */}
                      <div className="pt-3 border-t border-[#DFE7DD]/70">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#18231D]">Status Penanganan</span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-md text-[10px] font-semibold border",
                              isCompleted
                                ? "bg-emerald-50 text-[#1E5345] border-emerald-200"
                                : isOtw
                                ? "bg-teal-50 text-teal-800 border-teal-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            )}>
                              {isCompleted ? "Tuntas Bersih" : isOtw ? "Armada Bergerak" : "Verifikasi AI"}
                            </span>
                          </div>

                          {/* Driver assigned notice */}
                          {(isOtw || isCompleted) && (
                            <span className="text-[11px] text-[#63756A] font-medium hidden sm:inline-flex items-center gap-1.5">
                              <Truck className="h-3.5 w-3.5 text-[#1E5345]" />
                              <span>Pak Slamet (Truk N 8472 AB)</span>
                            </span>
                          )}
                        </div>

                        {/* Visual Timeline Track */}
                        <div className="space-y-1.5">
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#2E6E65] to-[#10B981] rounded-full transition-all duration-500"
                              style={{
                                width: isCompleted ? "100%" : isOtw ? "75%" : "40%",
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-[#8C9B90]">
                            <span className="font-medium text-[#18231D]">1. Masuk</span>
                            <span className="font-medium text-[#18231D]">2. Validasi AI</span>
                            <span className={isOtw || isCompleted ? "font-medium text-[#18231D]" : ""}>3. Disposisi Driver</span>
                            <span className={isCompleted ? "font-semibold text-[#1E5345]" : ""}>4. Selesai</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right: Value Calculation & Action Buttons */}
                    <div className="lg:col-span-3 flex flex-col justify-between h-full space-y-4 lg:border-l lg:border-[#DFE7DD] lg:pl-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#DFE7DD]">
                      
                      {/* Valuation Box */}
                      <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-[#DFE7DD]">
                        <div className="flex items-center justify-between text-xs text-[#63756A] mb-1">
                          <span className="font-semibold text-[10px] uppercase tracking-wider">
                            {isJualOption ? "Estimasi Nilai Jual" : "Sedekah Lingkungan"}
                          </span>
                          <Coins className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                        <div className="text-xl font-bold text-[#18231D] tracking-tight">
                          Rp {economicValue.toLocaleString("id-ID")}
                        </div>
                        <p className="text-[11px] text-[#63756A] mt-1 font-medium">
                          {isJualOption ? "💵 Dibayar tunai saat penimbangan" : "🎁 Konversi +100 Poin reward"}
                        </p>
                      </div>

                      {/* Action CTAs */}
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTrackerReport(report);
                            setIsTrackerModalOpen(true);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#1E5345] hover:bg-[#153D32] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          <span>Lacak Detail Laporan</span>
                        </button>

                        <Link
                          href={`/peta?id=${report.id}`}
                          className="w-full py-2 px-4 rounded-xl bg-white hover:bg-slate-50 text-[#18231D] font-semibold text-xs border border-[#DFE7DD] flex items-center justify-center gap-2 transition-all hover:border-[#1E5345]/50 shadow-2xs"
                        >
                          <MapPin className="h-3.5 w-3.5 text-[#1E5345]" />
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
