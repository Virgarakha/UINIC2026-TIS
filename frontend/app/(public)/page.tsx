"use client";

import * as React from "react";
import Link from "next/link";
import {
  Camera,
  MapPin,
  Truck,
  ArrowRight,
  Star,
  CheckCircle2,
  MessageSquare,
  Coins,
  ShieldCheck,
  AlertTriangle,
  Waves,
  Sparkles,
  Zap,
  Scale,
  BarChart3,
  TrendingDown,
  Recycle,
  Clock,
  Activity,
} from "lucide-react";
import {
  fetchMitraPengepulApi,
  fetchLaporanListApi,
  sendPengepulUlasanApi,
} from "@/lib/api-client";
import { User, LaporanSampah } from "@/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { getStoredUser, recordPointTransaction } from "@/lib/auth-storage";

export default function LandingHomePage() {
  const [mitraList, setMitraList] = React.useState<User[]>([]);
  const [isLoadingMitra, setIsLoadingMitra] = React.useState(true);
  const [reportsList, setReportsList] = React.useState<LaporanSampah[]>([]);

  // Review Mitra Modal state
  const [selectedMitraForReview, setSelectedMitraForReview] = React.useState<User | null>(null);
  const [reviewRating, setReviewRating] = React.useState<number>(5);
  const [reviewComment, setReviewComment] = React.useState<string>("");
  const [reviewerName, setReviewerName] = React.useState<string>("");
  const [reviewerRole, setReviewerRole] = React.useState<string>("Warga Pelapor");
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchMitraPengepulApi()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMitraList(data);
        } else {
          setMitraList([
            {
              id: 2,
              name: "Pak Slamet (Mitra Pengepul)",
              email: "pengepul@ecocitizen.id",
              role: "pengepul",
              no_telepon: "0813-3379-4278",
              no_whatsapp: "0813-3379-4278",
              plat_nomor: "N 8472 AB",
              jenis_kendaraan: "Truk Bak Hidrolik Mini DLH",
              kapasitas_muatan_kg: 1200,
              area_operasional: "Klojen, Lowokwaru, Sukun",
              rating: 4.95,
              total_ulasan: 38,
              foto_profil:
                "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400&auto=format&fit=crop&q=80",
              deskripsi_profil:
                "Mitra resmi DLH Kota Malang. Melayani penjemputan sampah pilah (plastik PET, kardus tebal, kaleng logam). Berpengalaman 6+ tahun.",
              ulasan: [
                {
                  id: 1,
                  reviewer_name: "Ibu Ratna Susanti",
                  reviewer_role: "Ketua RW 04 Klojen",
                  rating: 5,
                  komentar:
                    "Pak Slamet sangat tepat waktu dan armada hidroliknya bersih. Timbangan kardus dan botol selalu transparan!",
                  created_at: "2026-10-17T00:00:00Z",
                },
              ],
              poin: 350,
            },
            {
              id: 4,
              name: "Cak Joko Prasetyo",
              email: "joko@ecocitizen.id",
              role: "pengepul",
              no_telepon: "0812-9876-5432",
              no_whatsapp: "0812-9876-5432",
              plat_nomor: "N 6192 KT",
              jenis_kendaraan: "Motor Gerobak Roda 3 Viar",
              kapasitas_muatan_kg: 450,
              area_operasional: "Lowokwaru, Blimbing",
              rating: 4.9,
              total_ulasan: 24,
              foto_profil:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
              deskripsi_profil:
                "Spesialis jemput botol plastik dan minyak jelantah area kampus dan perumahan gang sempit.",
              ulasan: [
                {
                  id: 2,
                  reviewer_name: "Dian Anggraini",
                  reviewer_role: "Pengelola Bank Sampah Lowokwaru",
                  rating: 5,
                  komentar:
                    "Cak Joko sangat membantu untuk gang-gang sempit yang tidak bisa dimasuki truk besar. Sangat responsif via WhatsApp!",
                  created_at: "2026-10-17T00:00:00Z",
                },
              ],
              poin: 280,
            },
            {
              id: 6,
              name: "Cak Haryono (Armada Klojen)",
              email: "haryono@pengepul.id",
              role: "pengepul",
              no_telepon: "081377778888",
              no_whatsapp: "081377778888",
              plat_nomor: "N 7321 KL",
              jenis_kendaraan: "Mobil Pickup L300",
              kapasitas_muatan_kg: 900,
              area_operasional: "Klojen, Sukun",
              rating: 5.0,
              total_ulasan: 1,
              foto_profil:
                "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&auto=format&fit=crop&q=80",
              deskripsi_profil:
                "Armada pickup cepat tanggap untuk limbah kertas, kardus, dan plastik pilah.",
              ulasan: [
                {
                  id: 4,
                  reviewer_name: "Koordinator DLH Kota Malang",
                  reviewer_role: "Dinas Lingkungan Hidup",
                  rating: 5,
                  komentar: "Mitra armada resmi terverifikasi program pemantauan kebersihan wilayah.",
                  created_at: "2026-10-17T00:00:00Z",
                },
              ],
              poin: 0,
            },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingMitra(false));

    // Fetch reports for dynamic live impact counter
    fetchLaporanListApi().then((reps) => {
      if (Array.isArray(reps)) setReportsList(reps);
    });

    const stored = getStoredUser();
    if (stored) {
      setReviewerName(stored.name || "Warga Peduli");
    }
  }, []);

  const handleOpenReview = (mitra: User) => {
    setSelectedMitraForReview(mitra);
    setReviewRating(5);
    setReviewComment("");
    const stored = getStoredUser();
    setReviewerName(stored?.name || "Budi Santoso");
    setReviewerRole("Warga Pelapor");
    setReviewSuccessMsg(null);
  };

  const handleSubmitReview = async () => {
    if (!selectedMitraForReview || !reviewComment.trim()) return;
    setIsSubmittingReview(true);

    try {
      const stored = getStoredUser();
      const res = await sendPengepulUlasanApi(selectedMitraForReview.id, {
        rating: reviewRating,
        komentar: reviewComment.trim(),
        reviewer_name: reviewerName.trim() || stored?.name || "Warga Pelapor",
        reviewer_role: reviewerRole.trim() || "Warga Pelapor",
        warga_id: stored?.id,
      });

      // Update local mitraList
      setMitraList((prev) =>
        prev.map((m) => {
          if (m.id === selectedMitraForReview.id) {
            const newUlasan = [
              {
                id: Date.now(),
                reviewer_name: reviewerName.trim() || "Warga Pelapor",
                reviewer_role: reviewerRole.trim() || "Warga",
                rating: reviewRating,
                komentar: reviewComment.trim(),
                created_at: new Date().toISOString(),
              },
              ...(m.ulasan || []),
            ];
            return {
              ...m,
              rating: res?.pengepul?.rating || reviewRating,
              total_ulasan: (m.total_ulasan || 0) + 1,
              ulasan: newUlasan,
            };
          }
          return m;
        })
      );

      // Award +15 points
      recordPointTransaction(
        15,
        "ulasan_pengepul",
        `Reward Ulasan Mitra Armada: ${selectedMitraForReview.name}`
      );

      setReviewSuccessMsg("Ulasan berhasil dikirim! Anda mendapatkan +15 Poin.");
      setTimeout(() => {
        setSelectedMitraForReview(null);
        setReviewSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      alert(err.message || "Gagal mengirim ulasan");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const totalReportsCount = reportsList.length || 18;
  const totalVolumeM3 = reportsList.reduce(
    (acc, r) => acc + (r.analisis_ai?.volume_sampah_m3 || 2.4),
    0
  );
  const totalCleanedCount =
    reportsList.filter((r) => r.status?.kode === "selesai").length || 14;

  return (
    <div className="bg-white text-[#18231D] min-h-screen selection:bg-emerald-200">
      
      {/* ========================================================
          1. HERO SECTION (Warm, Punchy, Beautifully Balanced)
      ======================================================== */}
      <section className="relative overflow-hidden pt-8 pb-14 md:pt-14 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Bold Typography & Actions */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              

              {/* Main Headline with High Character */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[62px] font-extrabold tracking-tight text-[#18231D] leading-[1.12] mb-6">
                Wujudkan kota masa depan bersih, bebas sampah dan{" "}
                <span className="relative inline-block text-[#1B4D3B]">
                  terawat lestari.
                  <span className="absolute left-0 bottom-1 w-full h-3 bg-[#10B981]/25 -z-10 rounded-sm" />
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#4B5950] font-normal leading-relaxed max-w-2xl mb-8">
                Kolaborasi warga, armada pengepul, dan dinas lingkungan untuk mendeteksi sumbatan saluran air perkotaan serta menyalurkan sampah daur ulang bernilai ekonomis.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 mb-10">
                <Link
                  href="/lapor"
                  className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#1E5345] hover:bg-[#153D32] text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow-md transition-all active:scale-98"
                >
                  <Camera className="h-4 w-4" />
                  <span>Lapor Titik Sampah</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform opacity-80" />
                </Link>

                <Link
                  href="/peta"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-[#18231D] bg-white text-[#18231D] hover:bg-[#18231D] hover:text-white font-semibold text-sm sm:text-base transition-all shadow-2xs active:scale-98"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Jelajahi Peta Wilayah</span>
                </Link>
              </div>

              {/* Live Real-time Stat Pills */}
              <div className="grid grid-cols-3 gap-3 max-w-xl pt-6 border-t border-[#DFE7DD]">
                <div className="p-3 rounded-xl bg-white border border-[#DFE7DD]">
                  <div className="text-xl sm:text-2xl font-semibold text-[#18231D] tabular-nums">
                    {totalReportsCount}
                  </div>
                  <div className="text-[11px] font-semibold text-[#63756A]">Titik Laporan</div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#DFE7DD]">
                  <div className="text-xl sm:text-2xl font-semibold text-[#1E5345] tabular-nums">
                    {totalCleanedCount}
                  </div>
                  <div className="text-[11px] font-semibold text-[#63756A]">Tuntas Bersih</div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#DFE7DD]">
                  <div className="text-xl sm:text-2xl font-semibold text-[#18231D] tabular-nums">
                    ~{totalVolumeM3.toFixed(1)} <span className="text-xs font-medium text-[#63756A]">m³</span>
                  </div>
                  <div className="text-[11px] font-semibold text-[#63756A]">Material Terpilah</div>
                </div>
              </div>

            </div>

            {/* Right Column: Custom Visual Artwork with Live Overlay Tags */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              <img
                src="/images/vektor.png"
                alt="Ilustrasi Ekosistem TRINFO"
                className="w-full max-w-[460px] lg:max-w-[500px] h-auto object-contain"
              />

              {/* Floating Verified Overlay Pill */}
              <div className="absolute top-6 left-2 sm:-left-4 bg-white/95 backdrop-blur-md border border-[#DFE7DD] px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-3 animate-in fade-in">
                <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#1E5345] font-semibold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#18231D]">Mitra Resmi DLH</div>
                  <div className="text-[10px] font-semibold text-slate-500">Armada Siaga Wilayah</div>
                </div>
              </div>

              {/* Floating Reward Overlay Pill */}
              <div className="absolute bottom-6 right-2 sm:-right-4 bg-white/95 backdrop-blur-md border border-[#DFE7DD] px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-3 animate-in fade-in">
                <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#18231D]">+15 Poin Tiap Ulasan</div>
                  <div className="text-[10px] font-semibold text-slate-500">Klaim Sembako & Bibit</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          2. DUA FOKUS UTAMA PENANGANAN (Visual Experience Cards)
      ======================================================== */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10 max-w-3xl">
            <span className="text-xs font-semibold tracking-widest text-[#2E6E65] uppercase block mb-2">
              FOKUS PRIORITAS INTERVENSI
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#2B3752] tracking-tight leading-tight">
              Dua Permasalahan Kritis yang Kami Tangani
            </h2>
            <p className="text-sm sm:text-base text-[#4B5950] mt-3 font-medium leading-relaxed">
              Integrasi sistem tanggap darurat hidrologi pencegah banjir luapan dan aktivasi logistik sirkular berinsentif untuk Kota Malang.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Card 1: Sumbatan Saluran Air & Banjir (Corporate Navy #2B3752 + Emerald Teal #0EB29A) */}
            <div className="rounded-[32px] bg-[#2B3752] text-white p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden shadow-xl border border-[#0EB29A]/30 group">
              {/* Corner Ambient Glow with Primary Teal */}
              <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-[#0EB29A]/20 via-[#2E6E65]/15 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

              <div className="relative z-10">
                {/* Header Pills */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white">
                    <AlertTriangle className="h-3.5 w-3.5 text-[#0EB29A] shrink-0" />
                    <span>01 • MITIGASI LUAPAN AIR</span>
                  </div>

                 
                </div>

                <h3 className="text-2xl sm:text-3xl font-semibold text-white leading-snug mb-3">
                  Sumbatan Drainase &amp; Bibir Sungai
                </h3>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal mb-6">
                  Tumpukan sampah liar di gorong-gorong dan pintu air memicu banjir mendadak saat hujan deras. Warga memotret titik sumbatan untuk langsung dianalisis dan dibersihkan bersama BPBD &amp; DLH.
                </p>

                {/* Simulated AI Hydrological Risk Scanner Widget */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 sm:p-5 mb-6 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 text-white font-semibold truncate">
                      <MapPin className="h-3.5 w-3.5 text-[#0EB29A] shrink-0" />
                      <span>Saluran Primer Lowokwaru • Kali Brantas</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#0EB29A]/20 border border-[#0EB29A]/40 text-[#0EB29A] font-semibold text-[10px] shrink-0">
                      STATUS KRITIS
                    </span>
                  </div>

                  {/* Visual Clog Level Bar */}
                  <div className="space-y-1.5 mb-3.5">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-200">
                      <span>Estimasi Penampang Saluran Tersumbat</span>
                      <span className="text-[#0EB29A] font-semibold">78% Tertutup</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/40 overflow-hidden p-0.5">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#2E6E65] to-[#0EB29A] w-[78%]" />
                    </div>
                  </div>

                  {/* Weather & Satgas Status */}
                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/10 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <Waves className="h-3.5 w-3.5 text-[#0EB29A] shrink-0" />
                      <span className="truncate">Hujan 34 mm/jam</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-200 justify-end">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#0EB29A] shrink-0" />
                      <span className="truncate">Satgas DLH Siaga</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-300 block tracking-wider">Prioritas Respons</span>
                  <span className="text-xs sm:text-sm font-semibold text-white">Titik Kritis Segera Dibersihkan</span>
                </div>
                <Link
                  href="/lapor"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0EB29A] hover:bg-[#0ca18b] text-white font-semibold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-98 shrink-0"
                >
                  <span>Lapor Titik Sumbatan</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Penyaluran Material Sampah Pilah (Deep Forest Green #2E6E65 + Emerald Teal #0EB29A) */}
            <div className="rounded-[32px] bg-[#F4F9F8] text-[#2B3752] p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden shadow-xl border-2 border-[#0EB29A]/30 group">
              {/* Corner Ambient Glow */}
              <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-[#0EB29A]/15 via-[#2E6E65]/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

              <div className="relative z-10">
                {/* Header Pills */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="inline-flex items-center  gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ">
                    <Truck className="h-3.5 w-3.5 text-[#2E6E65] shrink-0" />
                    <span>02 • SIRKULASI EKONOMI</span>
                  </div>

               
                </div>

                <h3 className="text-2xl sm:text-3xl font-semibold text-[#2B3752] leading-snug mb-3">
                  Penyaluran Material Sampah Pilah
                </h3>

                <p className="text-sm sm:text-base text-[#4B5950] leading-relaxed font-normal mb-6">
                  Material anorganik bernilai (plastik PET, kardus tebal, kaleng logam) dijemput oleh mitra armada pengepul terdaftar dengan timbangan transparan, mengurangi beban TPA Supit Urang.
                </p>

                {/* Simulated Fleet Dispatch & EcoPoints Reward Widget */}
                <div className="rounded-2xl bg-white border border-[#0EB29A]/20 p-4 sm:p-5 mb-6 text-xs shadow-xs">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=100&auto=format&fit=crop&q=80"
                        alt="Pak Slamet"
                        className="h-9 w-9 rounded-full object-cover border-2 border-[#0EB29A] shadow-2xs"
                      />
                      <div>
                        <div className="font-semibold text-[#2B3752] text-xs">Pak Slamet (Armada DLH)</div>
                        <div className="text-[10px] text-slate-500 font-semibold">Truk Hidrolik Mini • N 8472 AB</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#0EB29A]/10 border border-[#0EB29A]/30 text-[#2E6E65] font-semibold text-[10px] shrink-0">
                      TERSEDIA JEMPUT
                    </span>
                  </div>

                  {/* Material & Digital Scale Strip */}
                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-between text-[11px] mb-2.5">
                    <span className="font-semibold text-slate-600">Kardus &amp; Botol Terpilah:</span>
                    <span className="font-semibold text-[#2B3752] flex items-center gap-1">
                      <Scale className="h-3 w-3 text-[#0EB29A]" /> ~18.5 kg Terverifikasi
                    </span>
                  </div>

                  {/* EcoPoints Live Reward Strip */}
                  <div className="p-2.5 rounded-xl bg-[#F0FAF7] border border-[#0EB29A]/30 flex items-center justify-between font-semibold text-[#2B3752]">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Coins className="h-3.5 w-3.5 text-[#0EB29A]" /> Konversi Reward Warga
                    </span>
                    <span className="font-semibold text-xs sm:text-sm text-[#2E6E65]">+275 Poin Ditukar Sembako</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="relative z-10 pt-4 border-t border-[#0EB29A]/20 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Reward Warga</span>
                  <span className="text-xs sm:text-sm font-semibold text-[#2B3752]">Poin Ditukar Voucher &amp; Sembako</span>
                </div>
                <Link
                  href="/rewards"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E6E65] hover:bg-[#245750] text-white font-semibold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-98 shrink-0"
                >
                  <span>Tukar Poin Reward</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          3. STATISTIK & METRIK DAMPAK LINGKUNGAN KOTA MALANG
      ======================================================== */}
      <section className="py-16 sm:py-20 border-t border-[#E8EDE5] bg-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-50/50 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
           
            <h2 className="text-3xl sm:text-4xl font-bold text-[#18231D] tracking-tight leading-tight">
              Data Lapangan &amp; Dampak Nyata di Kota Malang
            </h2>
            <p className="text-sm sm:text-base text-[#4B5950] mt-3 leading-relaxed">
              Transparansi volume timbulan sampah harian, mitigasi sumbatan saluran air perkotaan, dan efisiensi sirkulasi daur ulang untuk mengurangi beban TPA Supit Urang.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

            {/* Metric 1: Timbulan Sampah Supit Urang */}
            <div className="rounded-3xl bg-[#FAFBF9] border border-[#DFE7DD] p-6 sm:p-7 flex flex-col justify-between hover:border-[#1E5345]/40 hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-[#1E5345]/10 border border-[#1E5345]/15 text-[#1E5345] flex items-center justify-center shrink-0">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1E5345]/5 text-[#2E6E65] border border-[#1E5345]/15">
                    01 • BEBAN HARIAN
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#18231D] tracking-tight mb-1">
                  600+ <span className="text-base sm:text-lg font-semibold text-[#4B5950]">Ton/Hari</span>
                </div>
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#63756A] mb-3">
                  Timbulan Sampah Masuk TPA
                </h3>
                <p className="text-xs text-[#4B5950] leading-relaxed">
                  Kapasitas TPA Supit Urang membutuhkan intervensi pemilahan langsung dari warga agar residu yang tertimbun dapat ditekan seminimal mungkin.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#DFE7DD] flex items-center justify-between text-[11px]">
                <span className="text-[#63756A] font-medium">TPA Supit Urang Malang</span>
                <span className="text-[#1E5345] font-semibold flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5 text-[#10B981]" /> Target -30%
                </span>
              </div>
            </div>

            {/* Metric 2: Titik Pantau Drainase Kritis */}
            <div className="rounded-3xl bg-[#FAFBF9] border border-[#DFE7DD] p-6 sm:p-7 flex flex-col justify-between hover:border-[#1E5345]/40 hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-[#1E5345]/10 border border-[#1E5345]/15 text-[#1E5345] flex items-center justify-center shrink-0">
                    <Waves className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1E5345]/5 text-[#2E6E65] border border-[#1E5345]/15">
                    02 • DRAINASE KRITIS
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#18231D] tracking-tight mb-1">
                  48 <span className="text-base sm:text-lg font-semibold text-[#4B5950]">Titik Kritis</span>
                </div>
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#63756A] mb-3">
                  Saluran &amp; Sempadan Brantas
                </h3>
                <p className="text-xs text-[#4B5950] leading-relaxed">
                  Drainase primer di Lowokwaru, Klojen, dan Sukun dipantau warga secara aktif untuk mencegah penyumbatan sampah saat curah hujan tinggi.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#DFE7DD] flex items-center justify-between text-[11px]">
                <span className="text-[#63756A] font-medium">DAS Kali Brantas &amp; Metro</span>
                <span className="text-[#1E5345] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Pantau Real-time
                </span>
              </div>
            </div>

            {/* Metric 3: Diversi Daur Ulang Anorganik */}
            <div className="rounded-3xl bg-[#FAFBF9] border border-[#DFE7DD] p-6 sm:p-7 flex flex-col justify-between hover:border-[#1E5345]/40 hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-[#1E5345]/10 border border-[#1E5345]/15 text-[#1E5345] flex items-center justify-center shrink-0">
                    <Recycle className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1E5345]/5 text-[#2E6E65] border border-[#1E5345]/15">
                    03 • SIRKULASI PILAH
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#18231D] tracking-tight mb-1">
                  ~28.4% <span className="text-base sm:text-lg font-semibold text-[#4B5950]">Terdiversi</span>
                </div>
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#63756A] mb-3">
                  Material Daur Ulang Bernilai
                </h3>
                <p className="text-xs text-[#4B5950] leading-relaxed">
                  Plastik botol PET, kardus tebal, dan kaleng logam langsung diserap mitra armada pengepul terverifikasi dengan timbangan transparan dan poin reward.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#DFE7DD] flex items-center justify-between text-[11px]">
                <span className="text-[#63756A] font-medium">Bank Sampah &amp; Pengepul</span>
                <span className="text-[#1E5345] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Terserap Sirkular
                </span>
              </div>
            </div>

            {/* Metric 4: Respons Tanggap Cepat */}
            <div className="rounded-3xl bg-[#FAFBF9] border border-[#DFE7DD] p-6 sm:p-7 flex flex-col justify-between hover:border-[#1E5345]/40 hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-[#1E5345]/10 border border-[#1E5345]/15 text-[#1E5345] flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1E5345]/5 text-[#2E6E65] border border-[#1E5345]/15">
                    04 • RESPON LAPANGAN
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#18231D] tracking-tight mb-1">
                  &lt; 3 Jam <span className="text-base sm:text-lg font-semibold text-[#4B5950]">Respon</span>
                </div>
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#63756A] mb-3">
                  Validasi Hingga Disposisi
                </h3>
                <p className="text-xs text-[#4B5950] leading-relaxed">
                  Gemini AI mengotomatisasi estimasi kubikasi dan level risiko, memungkinkan armada terdekat langsung menuju lokasi tanpa hambatan birokrasi.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#DFE7DD] flex items-center justify-between text-[11px]">
                <span className="text-[#63756A] font-medium">Verifikasi GPS Terpadu</span>
                <span className="text-[#1E5345] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> Disposisi Cepat
                </span>
              </div>
            </div>

          </div>

       

        </div>
      </section>

      {/* ========================================================
          4. MITRA ARMADA PENGEPUL TERVERIFIKASI
      ======================================================== */}
      <section className="py-16 bg-[#F4F6F1] border-y border-[#E2E8DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#18231D] tracking-tight">
                Mitra Pengepul Terverifikasi & Armada Siaga
              </h2>
              <p className="text-sm sm:text-base text-[#4B5950] mt-2 max-w-xl">
                Penggerak ekonomi sirkular resmi dengan transparansi timbangan, armada berstandar DLH, dan ulasan langsung dari warga.
              </p>
            </div>

            <Link
              href="/register?role=pengepul"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#18231D] hover:bg-[#25362D] text-white font-semibold text-xs shadow-sm transition-all self-start md:self-auto"
            >
              <span>Daftarkan Armada Anda</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {mitraList.map((mitra) => (
              <div
                key={mitra.id}
                className="rounded-3xl bg-white border border-[#DFE6DB] p-6 sm:p-7 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-[#10B981] transition-all"
              >
                <div>
                  {/* Top: Photo & Details */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={mitra.foto_profil || "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&auto=format&fit=crop&q=80"}
                        alt={mitra.name}
                        className="h-14 w-14 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-2xs"
                      />
                      <div>
                        <h4 className="font-semibold text-[#18231D] text-base leading-snug">
                          {mitra.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[10px] border border-emerald-200">
                            {mitra.plat_nomor || "N 8472 AB"}
                          </span>
                          <span className="text-[11px] text-slate-500 font-semibold truncate max-w-[120px]">
                            {mitra.jenis_kendaraan?.split(" ")[0] || "Armada"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-semibold text-xs">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      <span>{mitra.rating || 5.0}</span>
                    </div>
                  </div>

                  {/* Operational Area & Vehicle Specs */}
                  <div className="p-3 rounded-2xl bg-[#F6F8F3] border border-[#E5EBE1] text-xs space-y-1 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Kapasitas Muatan:</span>
                      <span className="font-semibold text-[#18231D]">~{mitra.kapasitas_muatan_kg || 800} kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Wilayah Kerja:</span>
                      <span className="font-semibold text-[#18231D] truncate max-w-[160px]">
                        {mitra.area_operasional || "Klojen & Sekitarnya"}
                      </span>
                    </div>
                  </div>

                  {/* Driver Statement Quote */}
                  {mitra.deskripsi_profil && (
                    <p className="text-xs text-[#526157] italic mb-4 line-clamp-2">
                      &quot;{mitra.deskripsi_profil}&quot;
                    </p>
                  )}

                  {/* Verified Community Review */}
                  {mitra.ulasan && mitra.ulasan.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                          Ulasan Warga
                        </span>
                        <div className="flex text-amber-400 text-xs">
                          {"★".repeat(mitra.ulasan[0].rating)}
                        </div>
                      </div>
                      <p className="text-xs text-[#18231D] font-medium leading-relaxed bg-[#F8FAF6] p-2.5 rounded-xl border border-[#E9EFE6]">
                        &quot;{mitra.ulasan[0].komentar}&quot;
                      </p>
                      <span className="text-[10px] font-medium text-slate-500 block mt-1">
                        — {mitra.ulasan[0].reviewer_name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action: WhatsApp Contact & Review */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenReview(mitra)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-[#1E5345] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>Beri Ulasan (+15 Poin)</span>
                  </button>

                  <a
                    href={`https://wa.me/${mitra.no_whatsapp?.replace(/[^0-9]/g, "") || "6281234567890"}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E5345] hover:text-emerald-700"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Review Mitra Modal */}
        <Modal
          isOpen={selectedMitraForReview !== null}
          onClose={() => setSelectedMitraForReview(null)}
          title={selectedMitraForReview ? `Beri Ulasan: ${selectedMitraForReview.name}` : "Beri Ulasan"}
          description="Bagikan pengalaman penjemputan sampah dan transparansi timbangan mitra armada."
        >
          <div className="space-y-4 pt-2">
            {reviewSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <span>{reviewSuccessMsg}</span>
              </div>
            ) : (
              <>
                {/* Star Rating Select */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Rating Bintang
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-2xl cursor-pointer hover:scale-110 transition-transform"
                      >
                        <span className={star <= reviewRating ? "text-amber-400" : "text-slate-200"}>
                          ★
                        </span>
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-slate-600 ml-2">
                      {reviewRating} dari 5 Bintang
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Nama Anda
                    </label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="Nama Anda..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#18231D] focus:outline-none focus:border-[#0EB29A]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Status / Peran
                    </label>
                    <input
                      type="text"
                      value={reviewerRole}
                      onChange={(e) => setReviewerRole(e.target.value)}
                      placeholder="Contoh: Warga RW 04"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#18231D] focus:outline-none focus:border-[#0EB29A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Ulasan & Testimoni
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Contoh: Armada sangat ramah, timbangan transparan, dan sampah cepat diangkut bersih..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#18231D] focus:outline-none focus:border-[#0EB29A] placeholder:text-slate-400"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
                  <Coins className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span>Setiap ulasan warga yang terverifikasi mendapatkan +15 Poin Reward!</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMitraForReview(null)}
                    className="rounded-xl"
                  >
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isSubmittingReview}
                    disabled={isSubmittingReview || !reviewComment.trim()}
                    onClick={handleSubmitReview}
                    className="font-semibold text-xs rounded-xl bg-[#1E5345] hover:bg-[#153D32]"
                  >
                    Kirim Ulasan & Klaim Poin
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      </section>

      {/* ========================================================
          5. 4-LANGKAH ALUR KERJA SISTEM (WORKFLOW)
      ======================================================== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold tracking-widest text-[#1E5345] uppercase block mb-2">
              ALUR KERJA RESPON CEPAT
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#18231D] tracking-tight">
              Dari Laporan Warga hingga Penjemputan Tuntas
            </h2>
            <p className="text-sm text-[#4B5950] mt-2">
              Empat tahapan otomatisasi tanggap darurat sampah perkotaan yang transparan dan terukur.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="rounded-3xl bg-[#FAFBF9] border border-[#DFE6DB] p-6 shadow-2xs relative">
              <span className="text-3xl font-semibold text-[#10B981]/25 block mb-2">01</span>
              <h4 className="font-semibold text-[#18231D] text-base mb-1.5">
                Foto & Titik Koordinat
              </h4>
              <p className="text-xs text-[#526157] leading-relaxed">
                Warga memotret tumpukan sampah dengan kamera anti-fraud bersertifikasi GPS lokasi dan penanda waktu otomatis.
              </p>
            </div>

            <div className="rounded-3xl bg-[#FAFBF9] border border-[#DFE6DB] p-6 shadow-2xs relative">
              <span className="text-3xl font-semibold text-[#10B981]/25 block mb-2">02</span>
            
              <h4 className="font-semibold text-[#18231D] text-base mb-1.5">
                Analisis Estimasi AI
              </h4>
              <p className="text-xs text-[#526157] leading-relaxed">
                Gemini Vision mengestimasi kubikasi volume (m³), jenis sampah dominan, dan tingkat risiko sumbatan saluran air.
              </p>
            </div>

            <div className="rounded-3xl bg-[#FAFBF9] border border-[#DFE6DB] p-6 shadow-2xs relative">
              <span className="text-3xl font-semibold text-[#10B981]/25 block mb-2">03</span>
             
              <h4 className="font-semibold text-[#18231D] text-base mb-1.5">
                Disposisi Armada
              </h4>
              <p className="text-xs text-[#526157] leading-relaxed">
                Notifikasi otomatis diteruskan ke mitra pengepul terdekat untuk penjemputan sampah sesuai kapasitas kendaraan.
              </p>
            </div>

            <div className="rounded-3xl bg-[#FAFBF9] border border-[#DFE6DB] p-6 shadow-2xs relative">
              <span className="text-3xl font-semibold text-[#10B981]/25 block mb-2">04</span>
             
              <h4 className="font-semibold text-[#18231D] text-base mb-1.5">
                Klaim Poin & Rewards
              </h4>
              <p className="text-xs text-[#526157] leading-relaxed">
                Warga pelapor menerima poin reward yang dapat ditukarkan voucher sembako, bibit pohon, atau donasi sungai bersih.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          6. BOTTOM CALL TO ACTION BANNER (Warm Forest Dark)
      ======================================================== */}
      <section className="py-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-[#142820] text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-xl">

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold max-w-3xl mx-auto leading-tight mb-4">
              Mulai Laporkan Titik Sampah atau Gabung Jadi Mitra Armada Resmi
            </h2>

            <p className="text-sm sm:text-base text-emerald-100/80 max-w-xl mx-auto mb-8 font-medium">
              Satu foto laporan Anda membantu menjaga saluran air lingkungan tetap lancar dan menggerakkan sirkulasi daur ulang kota.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/lapor"
                className="px-7 py-3.5 rounded-2xl bg-[#10B981] hover:bg-emerald-400 text-[#18231D] font-semibold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                <span>Lapor Titik Sampah Sekarang</span>
              </Link>
              <Link
                href="/register?role=pengepul"
                className="px-7 py-3.5 rounded-2xl border border-white/30 hover:border-white text-white font-semibold text-sm transition-all"
              >
                <span>Daftar Sebagai Mitra Armada</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
