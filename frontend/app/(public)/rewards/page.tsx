"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Coins,
  Sparkles,
  Ticket,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  Gift,
  LogIn,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { MOCK_HADIAH, fetchKatalogHadiahApi, tukarHadiahApi } from "@/lib/api-client";
import { KatalogHadiah, User } from "@/types";
import {
  getStoredUser,
  getStoredUserVouchers,
  saveStoredUserVoucher,
  markVoucherAsUsed,
  recordPointTransaction,
  isGuestUser,
  ClaimedVoucher,
} from "@/lib/auth-storage";
import { cn, formatDate } from "@/lib/utils";

export default function RewardsPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const isGuest = isGuestUser(user);
  const [userPoints, setUserPoints] = React.useState<number>(0);
  const [activeTab, setActiveTab] = React.useState<"katalog" | "vouchers">("katalog");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("semua");
  const [isGuestPromptOpen, setIsGuestPromptOpen] = React.useState(false);

  // Vouchers state
  const [vouchers, setVouchers] = React.useState<ClaimedVoucher[]>([]);
  const [voucherFilter, setVoucherFilter] = React.useState<"semua" | "aktif" | "digunakan">("semua");
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  // Claim Modal State
  const [selectedHadiah, setSelectedHadiah] = React.useState<KatalogHadiah | null>(null);
  const [isSuccessClaim, setIsSuccessClaim] = React.useState(false);
  const [newlyClaimedVoucher, setNewlyClaimedVoucher] = React.useState<ClaimedVoucher | null>(null);
  const [catalog, setCatalog] = React.useState<KatalogHadiah[]>(MOCK_HADIAH);
  const [isLoadingCatalog, setIsLoadingCatalog] = React.useState(true);
  const [isSubmittingClaim, setIsSubmittingClaim] = React.useState(false);

  // Physical goods delivery form
  const [penerimaNama, setPenerimaNama] = React.useState("");
  const [penerimaTelepon, setPenerimaTelepon] = React.useState("");
  const [alamatKirim, setAlamatKirim] = React.useState("");

  // Sync state on mount & fetch dynamic catalog
  React.useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    const guest = isGuestUser(stored);
    setUserPoints(guest ? 0 : (stored?.poin ?? 0));
    setVouchers(guest ? [] : getStoredUserVouchers());

    if (stored && !guest) {
      setPenerimaNama(stored.name || "");
      if (stored.no_telepon || (stored as any).phone) {
        setPenerimaTelepon(stored.no_telepon || (stored as any).phone || "");
      }
    }

    // Fetch dynamic catalog from PostgreSQL backend
    fetchKatalogHadiahApi()
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: KatalogHadiah[] = data.map((item: any) => ({
            id: item.id,
            kategori_id: item.kategori_id ?? 1,
            nama: item.nama_hadiah || item.nama,
            deskripsi: item.deskripsi,
            poin_dibutuhkan: item.poin_dibutuhkan,
            stok: item.stok,
            foto_url: item.foto_hadiah_url || item.foto_url,
            kategori: item.kategori ?? { id: item.kategori_id ?? 1, nama: "Hadiah Lingkungan", slug: "hadiah" },
            is_tersedia: item.is_aktif ?? true,
          }));
          setCatalog(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingCatalog(false));
  }, []);

  const handleClaim = (item: KatalogHadiah) => {
    if (isGuest) {
      setIsGuestPromptOpen(true);
      return;
    }
    setSelectedHadiah(item);
    setIsSuccessClaim(false);
    setNewlyClaimedVoucher(null);
  };

  const executeClaim = async () => {
    if (isGuest || !selectedHadiah) return;
    if (userPoints < selectedHadiah.poin_dibutuhkan) return;

    setIsSubmittingClaim(true);

    try {
      // 1. Send claim to backend PostgreSQL
      let backendData: any = null;
      try {
        backendData = await tukarHadiahApi({
          hadiah_id: selectedHadiah.id,
          user_id: user?.id,
          alamat_pengiriman: alamatKirim
            ? {
                penerima: penerimaNama,
                telepon: penerimaTelepon,
                alamat: alamatKirim,
              }
            : undefined,
        });
      } catch (err) {
        console.warn("Backend tukarHadiah offline, fallback to local generation:", err);
      }

      // 2. Generate unique code
      const generatedCode =
        backendData?.kode_voucher ||
        `ECO-${selectedHadiah.id === 1 ? "PLN" : selectedHadiah.id === 2 ? "PULSA" : "HADIAH"}-${Math.floor(10000 + Math.random() * 90000)}`;

      const newVoucher: ClaimedVoucher = {
        id: `v-${Date.now()}`,
        hadiahId: selectedHadiah.id,
        namaHadiah: selectedHadiah.nama,
        kategori: selectedHadiah.id <= 2 ? "voucher_digital" : "barang_fisik",
        poinDipotong: selectedHadiah.poin_dibutuhkan,
        kodeVoucher: generatedCode,
        tanggalKlaim: new Date().toISOString(),
        tanggalKedaluwarsa:
          backendData?.tanggal_kedaluwarsa || new Date(Date.now() + 30 * 86400000).toISOString(),
        status: "aktif",
        fotoUrl: selectedHadiah.foto_url || undefined,
        alamatPengiriman: alamatKirim || undefined,
        namaPenerima: penerimaNama || undefined,
      };

      // 3. Record point deduction in ledger and update auth storage
      recordPointTransaction(
        -selectedHadiah.poin_dibutuhkan,
        "klaim_hadiah",
        `Penukaran Hadiah: ${selectedHadiah.nama}`
      );

      // 4. Persist claimed voucher to storage
      saveStoredUserVoucher(newVoucher);

      // 5. Update state
      const updatedBalance =
        backendData?.sisa_poin ?? (userPoints - selectedHadiah.poin_dibutuhkan);
      setUserPoints(updatedBalance);
      setVouchers(getStoredUserVouchers());
      setNewlyClaimedVoucher(newVoucher);
      setIsSuccessClaim(true);
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleUseVoucher = (voucherId: string) => {
    markVoucherAsUsed(voucherId);
    setVouchers(getStoredUserVouchers());
  };

  // Filtered catalogue
  const filteredCatalog = React.useMemo(() => {
    if (selectedCategory === "semua") return catalog;
    if (selectedCategory === "digital") {
      return catalog.filter(
        (h) =>
          h.id <= 2 ||
          h.kategori?.nama?.toLowerCase().includes("wallet") ||
          h.kategori?.nama?.toLowerCase().includes("pulsa")
      );
    }
    if (selectedCategory === "sembako") {
      return catalog.filter(
        (h) =>
          h.kategori?.nama?.toLowerCase().includes("listrik") ||
          h.kategori?.nama?.toLowerCase().includes("pln") ||
          h.kategori?.nama?.toLowerCase().includes("sembako")
      );
    }
    if (selectedCategory === "merchandise") {
      return catalog.filter(
        (h) =>
          h.kategori?.nama?.toLowerCase().includes("merchandise") ||
          h.kategori?.nama?.toLowerCase().includes("peduli") ||
          h.id >= 3
      );
    }
    return catalog;
  }, [catalog, selectedCategory]);

  // Filtered vouchers
  const filteredVouchers = React.useMemo(() => {
    if (voucherFilter === "semua") return vouchers;
    return vouchers.filter((v) => v.status === voucherFilter);
  }, [vouchers, voucherFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0EB29A] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
          <Coins className="h-4 w-4" />
          <span>Ekonomi Sirkular & Gamifikasi Warga</span>
        </div>
        <h1 className="text-3xl font-black text-[#2B3752]">
          Katalog Penukaran Hadiah Aksi Lingkungan
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Tukarkan poin yang Anda dapatkan dari melaporkan timbunan sampah liar atau menyetorkan sampah bernilai daur ulang ke mitra pengepul.
        </p>
      </div>

      {/* Dynamic User Balance Banner */}
      <div className={cn(
        "p-6 sm:p-7 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden",
        isGuest
          ? "bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-slate-900/20"
          : "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 shadow-amber-500/20"
      )}>
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-black/25 text-amber-100 text-[11px] font-bold">
            <span>👤 {user?.name || "Pengunjung"}</span>
            <span>•</span>
            <span className={isGuest ? "text-slate-300 font-semibold" : "text-yellow-200"}>
              {isGuest ? "Belum Masuk Akun" : "Level 2: Warga Teladan"}
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-4xl sm:text-5xl font-black tracking-tight flex items-center gap-2">
              <Coins className={cn("h-9 w-9 drop-shadow-md", isGuest ? "text-slate-400" : "text-yellow-200")} />
              <span>{userPoints}</span>
            </span>
            <span className={cn("text-lg font-bold", isGuest ? "text-slate-300" : "text-amber-100")}>
              Poin Aktif
            </span>
          </div>

          <p className={cn("text-xs pt-0.5", isGuest ? "text-slate-300/90" : "text-amber-100/90")}>
            {isGuest ? (
              <span>Pengguna yang belum masuk akun <strong>tidak dapat mengumpulkan reward</strong>. Masuk akun untuk klaim poin.</span>
            ) : (
              <span>Setiap laporan sampah terverifikasi AI menghasilkan <strong>+50 s/d +100 poin</strong>.</span>
            )}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          {isGuest ? (
            <>
              <Link href="/login">
                <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs gap-1.5 shadow-md">
                  <LogIn className="h-4 w-4 text-[#0EB29A]" />
                  <span>Masuk Akun Sekarang</span>
                </Button>
              </Link>
              <Link href="/register">
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl border border-white/60 bg-white/15 text-white hover:bg-white/25 font-bold text-xs transition-colors cursor-pointer inline-flex items-center"
                >
                  Daftar Akun Baru
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/lapor">
                <Button className="bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs gap-1.5 shadow-md">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span>Dapatkan Poin Tambahan</span>
                </Button>
              </Link>
              <Link href="/profil">
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl border border-white/60 bg-white/15 text-white hover:bg-white/25 font-bold text-xs transition-colors cursor-pointer inline-flex items-center"
                >
                  Riwayat Transaksi Poin
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Guest Mode Restriction Warning Banner */}
      {isGuest && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-700 flex-shrink-0 mt-0.5">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#2B3752]">Fitur Reward Khusus Pengguna Terdaftar</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Anda saat ini <strong>belum masuk akun</strong>. Poin dan penukaran hadiah dikunci (0 poin). Silakan masuk ke akun Anda untuk menukarkan voucher pulsa, listrik, atau sembako.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/login">
              <Button size="sm" variant="primary" className="text-xs font-bold gap-1.5">
                <LogIn className="h-3.5 w-3.5" />
                <span>Masuk Akun</span>
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" variant="outline" className="text-xs font-bold">
                Daftar
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("katalog")}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer",
            activeTab === "katalog"
              ? "bg-[#2B3752] text-white shadow-md"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
          )}
        >
          <Gift className="h-4 w-4" />
          <span>Katalog Penukaran Hadiah</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vouchers")}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer relative",
            activeTab === "vouchers"
              ? "bg-[#2B3752] text-white shadow-md"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
          )}
        >
          <Ticket className="h-4 w-4" />
          <span>Voucher Saya</span>
          {vouchers.length > 0 && (
            <span className="px-2 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-black">
              {vouchers.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: KATALOG HADIAH */}
      {activeTab === "katalog" && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-bold text-[11px] uppercase mr-1">Kategori:</span>
            {[
              { id: "semua", label: "Semua Hadiah" },
              { id: "digital", label: "⚡ Voucher PLN & Pulsa" },
              { id: "sembako", label: "🍚 Sembako Pangan" },
              { id: "merchandise", label: "🥤 Alat Ramah Lingkungan" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer",
                  selectedCategory === cat.id
                    ? "bg-[#0EB29A] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid Katalog Hadiah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCatalog.map((item) => {
              const canAfford = userPoints >= item.poin_dibutuhkan;
              return (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-200 flex flex-col justify-between bg-white border-slate-200 text-[#2B3752] rounded-3xl group"
                >
                  <div>
                    <div className="aspect-square relative overflow-hidden bg-slate-100">
                      <img
                        src={item.foto_url || "https://placehold.co/400x400"}
                        alt={item.nama}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-amber-300 font-black text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md border border-white/20">
                        <Coins className="h-3.5 w-3.5" />
                        <span>{item.poin_dibutuhkan} Poin</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h4 className="text-sm font-bold text-[#2B3752] leading-snug line-clamp-1">
                        {item.nama}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {item.deskripsi}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-400">
                        Stok: <strong>{item.stok}</strong> unit
                      </span>
                      <Button
                        variant={isGuest ? "outline" : canAfford ? "glow" : "outline"}
                        size="sm"
                        onClick={() => handleClaim(item)}
                        className={cn(
                          "text-xs font-bold gap-1",
                          !isGuest && !canAfford && "opacity-60 cursor-not-allowed hover:bg-transparent"
                        )}
                      >
                        {isGuest ? (
                          <>
                            <Lock className="h-3 w-3 text-amber-600" />
                            <span>Kunci Reward</span>
                          </>
                        ) : canAfford ? (
                          "Tukar Hadiah"
                        ) : (
                          "Poin Kurang"
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: VOUCHER SAYA */}
      {activeTab === "vouchers" && (
        <div className="space-y-6">
          {/* Voucher Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Status:</span>
              {(["semua", "aktif", "digunakan"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setVoucherFilter(st)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer",
                    voucherFilter === st
                      ? "bg-[#2B3752] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {st}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500">
              Total <strong>{filteredVouchers.length}</strong> voucher tersimpan di dompet akun Anda.
            </span>
          </div>

          {/* Voucher Cards Grid */}
          {isGuest ? (
            <div className="text-center py-16 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-[#2B3752]">Dompet Voucher Memerlukan Akun Warga</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Pengguna yang belum masuk akun tidak dapat menyimpan voucher atau klaim hadiah. Silakan masuk akun untuk membuka dompet voucher Anda.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <Link href="/login">
                  <Button variant="primary" size="sm" className="font-bold text-xs gap-1.5">
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Masuk Akun</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="sm" className="font-bold text-xs">
                    Daftar Akun
                  </Button>
                </Link>
              </div>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200 space-y-3">
              <Ticket className="h-12 w-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Belum ada voucher pada kategori ini</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tukarkan poin aktif Anda di katalog hadiah untuk mendapatkan kode voucher diskon PLN, pulsa, atau sembako.
              </p>
              <Button variant="primary" size="sm" onClick={() => setActiveTab("katalog")}>
                Buka Katalog Hadiah
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVouchers.map((v) => {
                const isAktif = v.status === "aktif";
                const isCopied = copiedCode === v.kodeVoucher;

                return (
                  <div
                    key={v.id}
                    className={cn(
                      "p-5 rounded-3xl bg-white border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden",
                      isAktif ? "border-emerald-300/80 ring-1 ring-emerald-500/10" : "border-slate-200 opacity-70"
                    )}
                  >
                    {/* Top Header of Voucher */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={v.fotoUrl || "https://placehold.co/80"}
                          alt={v.namaHadiah}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                            {v.kategori === "voucher_digital" ? "⚡ Voucher Digital" : "📦 Hadiah Fisik"}
                          </span>
                          <h4 className="text-xs font-black text-[#2B3752] leading-tight line-clamp-1">
                            {v.namaHadiah}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            Ditukar: {formatDate(v.tanggalKlaim)}
                          </span>
                        </div>
                      </div>

                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                          isAktif ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {isAktif ? "Aktif" : "Digunakan"}
                      </span>
                    </div>

                    {/* Voucher Code Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Kode Voucher Resmi:
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          Exp: {formatDate(v.tanggalKedaluwarsa)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                        <code className="text-xs sm:text-sm font-black font-mono text-[#0EB29A] tracking-wider truncate">
                          {v.kodeVoucher}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(v.kodeVoucher)}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                            isCopied
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 hover:bg-[#0EB29A] hover:text-white text-slate-700"
                          )}
                          title="Salin Kode Voucher"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Barcode graphic illustration */}
                      <div className="pt-1 flex items-center justify-between opacity-40">
                        <div className="h-4 flex items-center gap-[2px]">
                          <div className="w-[2px] h-full bg-slate-800"></div>
                          <div className="w-[1px] h-full bg-slate-800"></div>
                          <div className="w-[3px] h-full bg-slate-800"></div>
                          <div className="w-[1px] h-full bg-slate-800"></div>
                          <div className="w-[2px] h-full bg-slate-800"></div>
                          <div className="w-[1px] h-full bg-slate-800"></div>
                          <div className="w-[4px] h-full bg-slate-800"></div>
                          <div className="w-[2px] h-full bg-slate-800"></div>
                          <div className="w-[1px] h-full bg-slate-800"></div>
                          <div className="w-[3px] h-full bg-slate-800"></div>
                          <div className="w-[2px] h-full bg-slate-800"></div>
                          <div className="w-[1px] h-full bg-slate-800"></div>
                          <div className="w-[3px] h-full bg-slate-800"></div>
                        </div>
                        <span className="text-[9px] font-mono font-bold tracking-widest text-slate-600">
                          VERIFIED-AUTH
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                        <Coins className="h-3.5 w-3.5" />
                        <span>-{v.poinDipotong} Poin</span>
                      </span>

                      {isAktif && (
                        <button
                          type="button"
                          onClick={() => handleUseVoucher(v.id)}
                          className="text-[11px] font-bold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                        >
                          Tandai Telah Dipakai
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CLAIM CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(selectedHadiah)}
        onClose={() => {
          setSelectedHadiah(null);
          setIsSuccessClaim(false);
          setNewlyClaimedVoucher(null);
        }}
        title={isSuccessClaim ? "Penukaran Berhasil! 🎉" : "Konfirmasi Penukaran Hadiah"}
        description={
          isSuccessClaim
            ? "Voucher Anda telah diterbitkan dan tersimpan di Dompet Voucher Saya."
            : "Pastikan saldo poin Anda mencukupi sebelum melanjutkan."
        }
      >
        {selectedHadiah && (
          <div className="space-y-4">
            {isSuccessClaim && newlyClaimedVoucher ? (
              <div className="text-center py-4 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-[#0EB29A]/15 text-[#0EB29A] flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div>
                  <h4 className="font-black text-base text-[#2B3752]">{selectedHadiah.nama}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Saldo terpotong <strong>{selectedHadiah.poin_dibutuhkan} Poin</strong>. Sisa saldo Anda:{" "}
                    <strong className="text-amber-600 font-bold">{userPoints} Poin</strong>.
                  </p>
                </div>

                {/* Voucher Code Display */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Kode Voucher Anda:
                  </span>
                  <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-xl border border-slate-200">
                    <code className="text-base font-black font-mono text-[#0EB29A] tracking-wider">
                      {newlyClaimedVoucher.kodeVoucher}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(newlyClaimedVoucher.kodeVoucher)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode === newlyClaimedVoucher.kodeVoucher ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Tunjukkan kode ini saat melakukan pembelian token listrik PLN, top-up pulsa, atau pengambilan sembako.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => {
                      setSelectedHadiah(null);
                      setActiveTab("vouchers");
                    }}
                  >
                    Buka Dompet Voucher Saya
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Reward summary card */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
                  <img
                    src={selectedHadiah.foto_url || "https://placehold.co/100"}
                    alt={selectedHadiah.nama}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-[#2B3752]">{selectedHadiah.nama}</h5>
                    <p className="text-xs text-amber-600 font-bold mt-1 flex items-center gap-1">
                      <Coins className="h-3.5 w-3.5" />
                      <span>Biaya: {selectedHadiah.poin_dibutuhkan} Poin</span>
                    </p>
                  </div>
                </div>

                {/* Point check indicator */}
                {userPoints < selectedHadiah.poin_dibutuhkan ? (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">Saldo Poin Tidak Mencukupi!</strong>
                      <span>
                        Anda memiliki <strong>{userPoints} Poin</strong>. Kurang{" "}
                        <strong>{selectedHadiah.poin_dibutuhkan - userPoints} Poin</strong> untuk menukarkan hadiah ini.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block">Sisa saldo setelah penukaran:</span>
                      <strong className="text-sm font-black text-emerald-700">
                        {userPoints - selectedHadiah.poin_dibutuhkan} Poin
                      </strong>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                )}

                {/* Physical Goods Address Form (if sembako / merchandise) */}
                {selectedHadiah.id >= 3 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      📍 Alamat Pengiriman Paket Fisik:
                    </span>
                    <Input
                      placeholder="Nama Penerima"
                      value={penerimaNama}
                      onChange={(e) => setPenerimaNama(e.target.value)}
                      className="text-xs bg-white"
                    />
                    <Input
                      placeholder="Nomor Telepon / WhatsApp"
                      value={penerimaTelepon}
                      onChange={(e) => setPenerimaTelepon(e.target.value)}
                      className="text-xs bg-white"
                    />
                    <Input
                      placeholder="Alamat Lengkap (Jl, No, RT/RW, Kelurahan)"
                      value={alamatKirim}
                      onChange={(e) => setAlamatKirim(e.target.value)}
                      className="text-xs bg-white"
                    />
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedHadiah(null)}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="glow"
                    className="flex-1"
                    isLoading={isSubmittingClaim}
                    disabled={userPoints < selectedHadiah.poin_dibutuhkan || isSubmittingClaim}
                    onClick={executeClaim}
                  >
                    Konfirmasi Tukar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* GUEST ACCESS PROMPT MODAL */}
      <Modal
        isOpen={isGuestPromptOpen}
        onClose={() => setIsGuestPromptOpen(false)}
        title="Khusus Pengguna Terdaftar 🔒"
        description="Fitur klaim voucher dan poin reward memerlukan akun terdaftar."
      >
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#2B3752]">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span>Akses Reward Terkunci</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Sesuai kebijakan platform EcoPatrol, penukaran hadiah voucher PLN, pulsa, dan sembako hanya berlaku untuk warga yang memiliki akun terdaftar dan terverifikasi.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link href="/login" className="flex-1">
              <Button variant="primary" className="w-full text-xs font-bold gap-1.5">
                <LogIn className="h-4 w-4" />
                <span>Masuk Akun Sekarang</span>
              </Button>
            </Link>
            <Link href="/register" className="flex-1">
              <Button variant="outline" className="w-full text-xs font-bold">
                Daftar Akun Baru
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
}
