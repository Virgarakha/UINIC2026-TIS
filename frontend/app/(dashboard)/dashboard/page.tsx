"use client";

import * as React from "react";
import Link from "next/link";
import {
  Camera,
  Coins,
  ShieldAlert,
  Trash2,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Truck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HazardBadge } from "@/components/shared/hazard-badge";
import { StatCard } from "@/components/shared/stat-card";
import { MOCK_LAPORAN_SAMPAH, MOCK_PERINGATAN_DINI, fetchLaporanListApi } from "@/lib/api-client";
import { getStoredUser, getStoredUserReports, getStoredUserVouchers } from "@/lib/auth-storage";
import { formatDate } from "@/lib/utils";
import { LaporanSampah, User } from "@/types";

export default function DashboardPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [reports, setReports] = React.useState<LaporanSampah[]>(MOCK_LAPORAN_SAMPAH);
  const [userReportCount, setUserReportCount] = React.useState<number>(8);
  const [verifiedCount, setVerifiedCount] = React.useState<number>(6);
  const [totalKg, setTotalKg] = React.useState<number>(185);

  React.useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);

    const storedUserReports = getStoredUserReports();
    fetchLaporanListApi().then((apiReports) => {
      if (apiReports && apiReports.length > 0) {
        setReports(apiReports);
      }
    });

    if (storedUserReports.length > 0) {
      setUserReportCount(6 + storedUserReports.length);
      const additionalKg = storedUserReports.reduce(
        (acc: number, r: any) => acc + (r.analisis_ai?.estimasi_berat_kg || 25),
        0
      );
      setTotalKg(185 + Math.round(additionalKg));
    }
  }, []);

  const isPengepul = user?.role === "pengepul";
  const userPoints = user?.poin ?? 240;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white shadow-lg shadow-[#0EB29A]/15">
        <div>
          <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
            {isPengepul ? "🚛 Portal Mitra Driver Pengepul" : "🌱 Portal Warga & Relawan Lingkungan"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            Selamat Datang, {user?.name || (isPengepul ? "Pak Joko" : "Budi Santoso")}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-emerald-50 mt-1 max-w-xl">
            {isPengepul
              ? "Pantau radar penjemputan sampah daur ulang, aktifkan mode navigasi armada, dan konfirmasi timbangan riil."
              : "Anda telah berkontribusi memitigasi titik rawan sumbatan saluran air di Malang. Saldo poin Anda siap ditukarkan hadiah."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isPengepul ? (
            <Link href="/peta">
              <Button className="bg-white text-[#2E6E65] hover:bg-slate-50 font-bold gap-2 text-xs shadow-md">
                <Truck className="h-4 w-4 text-[#0EB29A]" />
                <span>Buka Radar Jemput Armada</span>
              </Button>
            </Link>
          ) : (
            <Link href="/lapor">
              <Button className="bg-white text-[#2E6E65] hover:bg-slate-50 font-bold gap-2 text-xs shadow-md">
                <Camera className="h-4 w-4 text-[#0EB29A]" />
                <span>Lapor Sampah Baru</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isPengepul ? (
          <>
            <StatCard
              title="Total Misi Selesai"
              value="134 Misi"
              subtitle="Tingkat kepuasan warga 99.2%"
              icon={<Truck className="h-4 w-4" />}
              accentColor="blue"
              trend={{ value: "+4 hari ini", isPositive: true }}
            />
            <StatCard
              title="Saldo Cuan & Reward"
              value={`Rp 480.000`}
              subtitle={`${userPoints} Poin Insentif`}
              icon={<Coins className="h-4 w-4" />}
              accentColor="amber"
              trend={{ value: "+Rp 65rb", isPositive: true }}
            />
            <StatCard
              title="Total Berat Terangkut"
              value="1.240 kg"
              subtitle="Kardus, Logam, & Plastik PET"
              icon={<TrendingUp className="h-4 w-4" />}
              accentColor="emerald"
              trend={{ value: "180 kg", isPositive: true }}
            />
            <StatCard
              title="Status Armada Aktif"
              value="Online Siaga"
              subtitle="Area Klojen & Dinoyo"
              icon={<CheckCircle2 className="h-4 w-4" />}
              accentColor="emerald"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Total Laporan Anda"
              value={`${userReportCount} Titik`}
              subtitle={`${verifiedCount} terverifikasi, 2 ditangani`}
              icon={<Trash2 className="h-4 w-4" />}
              accentColor="blue"
              trend={{ value: "+2", isPositive: true }}
            />
            <StatCard
              title="Saldo Poin Aktif"
              value={`${userPoints} Poin`}
              subtitle="Bisa ditukar voucher PLN & pulsa"
              icon={<Coins className="h-4 w-4" />}
              accentColor="amber"
              trend={{ value: "+50", isPositive: true }}
            />
            <StatCard
              title="Estimasi Sampah Terpilah"
              value={`${totalKg} kg`}
              subtitle="Terkumpul oleh mitra pengepul"
              icon={<TrendingUp className="h-4 w-4" />}
              accentColor="emerald"
              trend={{ value: "42 kg", isPositive: true }}
            />
            <StatCard
              title="Status Siaga Wilayah Anda"
              value="1 Peringatan"
              subtitle="Sungai Brantas Klojen"
              icon={<ShieldAlert className="h-4 w-4" />}
              accentColor="red"
            />
          </>
        )}
      </div>

      {/* Grid 2 Columns: Recent Reports & Active Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Laporan Sampah Masuk Terkini */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-white border-slate-200 text-[#2B3752]">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <CardTitle className="text-base font-bold text-[#2B3752]">Laporan Titik Sampah Terkini</CardTitle>
                <p className="text-xs text-slate-500">Daftar laporan warga yang dianalisis oleh AI</p>
              </div>
              <Link href="/peta" className="text-xs font-semibold text-[#0EB29A] hover:underline flex items-center gap-1">
                <span>Peta GIS</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-slate-100">
              {reports.slice(0, 5).map((lap) => (
                <div key={lap.id} className="p-4 flex items-start gap-3.5 hover:bg-slate-50/70 transition-colors">
                  <img
                    src={lap.foto_url}
                    alt="Bukti Laporan"
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-[#2B3752] truncate">
                        {lap.alamat_lokasi}
                      </span>
                      <HazardBadge hazard={lap.tipe_bahaya} />
                    </div>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{lap.deskripsi}</p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(lap.created_at)}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-[#0EB29A]">
                        {lap.status?.nama || "Menunggu"}
                      </span>
                      {lap.analisis_ai && (
                        <>
                          <span>•</span>
                          <span className="text-[#2E6E65] font-semibold">
                            AI: {lap.analisis_ai.persentase_sumbatan_aliran}% Sumbatan
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Warnings & Environmental Guidance */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Warnings Card */}
          <Card className="border-red-500/20 bg-white text-[#2B3752]">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <CardTitle className="text-sm font-bold text-[#2B3752]">Peringatan Multi-Bahaya Aktif</CardTitle>
              </div>
              <Badge variant="danger" className="text-[10px]">Darurat</Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {MOCK_PERINGATAN_DINI.slice(0, 2).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <HazardBadge hazard={alert.tipe_bahaya} />
                    <span className="text-[10px] font-bold text-red-600 uppercase">
                      Level: {alert.level_peringatan}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {alert.pesan_broadcast}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Radius Dampak: {alert.radius_terdampak_meter}m</span>
                    <Link href="/peta" className="text-red-600 font-bold hover:underline">
                      Cek Titik Bahaya →
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Gamification Action Card */}
          <Card className="p-5 bg-gradient-to-tr from-amber-500/10 via-white to-white border-amber-500/20 text-[#2B3752]">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                <Coins className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[#2B3752]">
                  Tukar {userPoints} Poin Anda Sekarang
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tersedia voucher PLN Rp 50.000 atau saldo e-wallet GoPay/OVO untuk diklaim langsung.
                </p>
                <Link href="/rewards" className="mt-3 inline-block">
                  <Button variant="secondary" size="sm" className="text-xs font-bold gap-1.5">
                    <span>Buka Katalog Hadiah</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
