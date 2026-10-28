"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User as UserIcon,
  Coins,
  Ticket,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  LogOut,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Gift,
  FileText,
  Clock,
  Layers,
  Award,
  LogIn,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  getStoredUser,
  setStoredSession,
  clearStoredSession,
  getStoredPointLedger,
  getStoredUserVouchers,
  isGuestUser,
  PointLedgerEntry,
  ClaimedVoucher,
} from "@/lib/auth-storage";
import { updateUserProfileApi, fetchUserRiwayatPoinApi } from "@/lib/api-client";
import { User } from "@/types";
import { cn, formatDate } from "@/lib/utils";

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [ledger, setLedger] = React.useState<PointLedgerEntry[]>([]);
  const [vouchers, setVouchers] = React.useState<ClaimedVoucher[]>([]);
  const [isSwitching, setIsSwitching] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [editAvatarUrl, setEditAvatarUrl] = React.useState("");
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  React.useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    const guest = isGuestUser(stored);
    setLedger(guest ? [] : getStoredPointLedger());
    setVouchers(guest ? [] : getStoredUserVouchers());

    if (stored && !guest) {
      setEditName(stored.name || "");
      setEditPhone(stored.no_telepon || (stored as any).phone || "");
      setEditAvatarUrl(stored.avatar_url || (stored as any).foto_profil || "");

      // Sync point ledger from backend PostgreSQL
      fetchUserRiwayatPoinApi(stored.id).then((apiRows) => {
        if (Array.isArray(apiRows) && apiRows.length > 0) {
          const localEntries = getStoredPointLedger();
          // Merge local + backend uniquely
          const combined = [...localEntries];
          apiRows.forEach((row: any) => {
            if (!combined.some((c) => c.id === `api-${row.id}`)) {
              combined.push({
                id: `api-${row.id}`,
                jumlahPoin: row.jumlah_poin,
                tipe: row.jenis_transaksi === "debit" ? "klaim_hadiah" : "lapor_sampah",
                deskripsi: row.keterangan || "Mutasi Poin Lingkungan",
                saldoSetelahnya: row.jumlah_poin,
                timestamp: row.created_at,
              });
            }
          });
          setLedger(combined);
        }
      });
    }
  }, []);

  const handleOpenEdit = () => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.no_telepon || (user as any).phone || "");
      setEditAvatarUrl(user.avatar_url || (user as any).foto_profil || "");
      setIsEditModalOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !editName.trim()) return;
    setIsSavingProfile(true);

    try {
      // 1. Call backend Laravel profile update
      let updatedUser: User = {
        ...user,
        name: editName.trim(),
        no_telepon: editPhone.trim() || undefined,
        avatar_url: editAvatarUrl.trim() || user.avatar_url,
      };

      try {
        const apiRes = await updateUserProfileApi({
          user_id: user.id,
          name: editName.trim(),
          no_telepon: editPhone.trim() || undefined,
          foto_profil: editAvatarUrl.trim() || undefined,
        });
        if (apiRes) {
          updatedUser = {
            ...updatedUser,
            name: apiRes.name,
            no_telepon: apiRes.no_telepon,
            avatar_url: apiRes.avatar_url || apiRes.foto_profil || updatedUser.avatar_url,
          };
        }
      } catch (err) {
        console.warn("Backend updateUserProfileApi offline, saved locally:", err);
      }

      // 2. Persist to storage and local state
      setStoredSession(updatedUser);
      setUser(updatedUser);
      setIsEditModalOpen(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = () => {
    clearStoredSession();
    setUser(null);
    router.push("/login");
  };

  const handleSwitchAccount = (targetRole: "warga" | "pengepul") => {
    setIsSwitching(true);
    if (targetRole === "warga") {
      const wargaUser: User = {
        id: 2,
        name: "Budi Santoso",
        email: "budi@warga.id",
        role: "warga",
        poin: 240,
      };
      setStoredSession(wargaUser);
      setUser(wargaUser);
    } else {
      const pengepulUser: User = {
        id: 30,
        name: "Pak Joko (Mitra Pengepul)",
        email: "pengepul@ecocitizen.id",
        role: "pengepul",
        poin: 480,
      };
      setStoredSession(pengepulUser);
      setUser(pengepulUser);
    }

    setTimeout(() => {
      setIsSwitching(false);
      window.location.reload();
    }, 400);
  };

  const isGuest = isGuestUser(user);
  const isPengepul = user?.role === "pengepul";
  const userPoints = isGuest ? 0 : (user?.poin ?? 0);
  const activeVouchers = isGuest ? [] : vouchers.filter((v) => v.status === "aktif");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0EB29A] transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
       
        <h1 className="text-2xl sm:text-3xl font-black text-[#2B3752]">
          Profil Akun & Buku Besar Poin
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Pantau status keanggotaan lingkungan, mutasi perolehan reward, dan voucher aktif Anda di platform EcoPatrol.
        </p>
      </div>

      {/* User Identity Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-gradient-to-tr from-[#0EB29A] to-[#2E6E65] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg shadow-[#0EB29A]/25 border-2 border-white flex-shrink-0">
            {user?.name ? user.name.charAt(0) : "W"}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-[#2B3752]">{user?.name || "Pengguna Belum Masuk"}</h2>
            
            </div>

            <p className="text-xs text-slate-500">{user?.email || "Belum ada sesi login aktif"}</p>

            <div className="pt-1 flex items-center gap-2 text-xs font-medium text-slate-600">
              <Award className="h-4 w-4 text-amber-500" />
              <span>
                {isGuest ? (
                  <strong>Akses Terbuka Publik (Masuk akun untuk mengumpulkan poin reward)</strong>
                ) : isPengepul ? (
                  <strong>Mitra Armada Bintang 5 (⭐ 4.9 • 134 Penjemputan)</strong>
                ) : (
                  <strong>Warga Teladan Lingkungan (Level 2 • 5 Kontribusi)</strong>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          {isGuest ? (
            <>
              <Link href="/login">
                <Button
                  size="sm"
                  variant="primary"
                  className="rounded-2xl text-xs font-bold gap-1.5 cursor-pointer shadow-md"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Masuk Akun</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-2xl text-xs font-bold cursor-pointer"
                >
                  <span>Daftar Akun</span>
                </Button>
              </Link>
            </>
          ) : user && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenEdit}
                className="rounded-2xl text-xs font-bold text-[#0EB29A] hover:text-[#2E6E65] hover:bg-emerald-50 border-emerald-200 cursor-pointer"
              >
                <span>Edit Profil</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="rounded-2xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                <span>Keluar</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Points Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
              Saldo Poin Aktif
            </span>
            <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Coins className="h-4 w-4 text-yellow-200" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black">{userPoints}</span>
            <span className="text-xs font-bold text-amber-100">Poin</span>
          </div>

          <div className="pt-1">
            <Link href="/rewards">
              <Button
                size="sm"
                className="w-full bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs"
              >
                <span>Tukar di Katalog Rewards</span>
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Voucher Wallet Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 text-[#2B3752]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dompet Voucher
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Ticket className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#2B3752]">{activeVouchers.length}</span>
            <span className="text-xs font-bold text-slate-500">Voucher Aktif</span>
          </div>

          <div className="pt-1">
            <Link href="/rewards">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold"
              >
                <span>Lihat Kode Voucher</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Action Shortcut Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 text-[#2B3752]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isGuest ? "Laporan Warga" : isPengepul ? "Misi Armada" : "Laporan Saya"}
            </span>
            <div className="h-8 w-8 rounded-xl bg-[#2B3752]/5 text-[#2B3752] flex items-center justify-center">
              {isPengepul ? <Truck className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#2B3752]">
              {isGuest ? "Radar" : isPengepul ? "134" : "5"}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {isGuest ? "Akses Terbuka" : isPengepul ? "Misi Tuntas" : "Titik Selesai"}
            </span>
          </div>

          <div className="pt-1">
            <Link href={isPengepul ? "/peta" : "/laporan-saya"}>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold"
              >
                <span>{isGuest ? "Pantau Laporan Warga" : isPengepul ? "Buka Radar Jemput" : "Kelola Laporan Saya"}</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

     

      {/* Point Transaction Ledger (Buku Besar Mutasi Poin) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <h3 className="text-base font-black text-[#2B3752]">
              Buku Besar Transaksi Poin (Point Ledger)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Total {ledger.length} Transaksi</span>
        </div>

        <Card className="bg-white border-slate-200 overflow-hidden rounded-3xl shadow-sm">
          {isGuest ? (
            <div className="text-center py-12 px-4 bg-slate-50/50 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-[#2B3752]">Buku Besar Poin Memerlukan Akun Terdaftar</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Pengguna yang belum masuk akun tidak memiliki saldo atau histori mutasi poin reward. Masuk ke akun Anda untuk melihat dan mengumpulkan poin.
              </p>
              <div className="flex justify-center gap-2 pt-1">
                <Link href="/login">
                  <Button variant="primary" size="sm" className="font-bold text-xs gap-1.5">
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Masuk Akun</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="sm" className="font-bold text-xs">
                    <span>Daftar Akun</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : ledger.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 text-xs">
              Belum ada mutasi poin pada akun ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Waktu Transaksi</th>
                    <th className="px-5 py-3">Tipe Aksi</th>
                    <th className="px-5 py-3">Keterangan</th>
                    <th className="px-5 py-3 text-right">Mutasi Poin</th>
                    <th className="px-5 py-3 text-right">Saldo Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {ledger.map((entry) => {
                    const isPositive = entry.jumlahPoin > 0;
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                          {formatDate(entry.timestamp)}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                              entry.tipe === "lapor_sampah"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : entry.tipe === "sedekah_sampah"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : entry.tipe === "penjemputan_mitra"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            )}
                          >
                            {entry.tipe.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 max-w-xs truncate text-[#2B3752] font-semibold">
                          {entry.deskripsi}
                        </td>
                        <td
                          className={cn(
                            "px-5 py-3.5 whitespace-nowrap font-black text-right",
                            isPositive ? "text-emerald-600" : "text-rose-600"
                          )}
                        >
                          {isPositive ? `+${entry.jumlahPoin}` : entry.jumlahPoin} Poin
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right font-black text-[#2B3752]">
                          {entry.saldoSetelahnya} Poin
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profil Pengguna"
        description="Perbarui informasi profil dan kontak Anda yang tersimpan di server."
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#2B3752] focus:outline-none focus:border-[#0EB29A]"
              placeholder="Masukkan nama lengkap..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Nomor WhatsApp / Telepon
            </label>
            <input
              type="text"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#2B3752] focus:outline-none focus:border-[#0EB29A]"
              placeholder="Contoh: 0812-3456-7890"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              URL Foto Avatar Profil (Opsional)
            </label>
            <input
              type="text"
              value={editAvatarUrl}
              onChange={(e) => setEditAvatarUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#2B3752] focus:outline-none focus:border-[#0EB29A]"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSavingProfile}
              disabled={isSavingProfile || !editName.trim()}
              onClick={handleSaveProfile}
            >
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
