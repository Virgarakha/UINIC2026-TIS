"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Radio,
  ShieldCheck,
  ShieldAlert,
  Navigation,
  Compass,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { HazardBadge } from "@/components/shared/hazard-badge";
import {
  MOCK_PERINGATAN_DINI,
  fetchPeringatanDiniApi,
  createPeringatanDiniApi,
} from "@/lib/api-client";
import { useGeolocation } from "@/hooks/use-geolocation";
import { formatDate, cn } from "@/lib/utils";

// Haversine distance calculator in meters
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export default function PeringatanPage() {
  const geo = useGeolocation();
  const [warnings, setWarnings] = React.useState(MOCK_PERINGATAN_DINI);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [hazardType, setHazardType] = React.useState("Banjir & Luapan Air");
  const [alertLevel, setAlertLevel] = React.useState<"WASPADA" | "SIAGA" | "AWAS">("SIAGA");
  const [radiusMeters, setRadiusMeters] = React.useState(600);
  const [broadcastMessage, setBroadcastMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchPeringatanDiniApi().then((data) => {
      if (data && data.length > 0) {
        setWarnings(data);
      }
    });
  }, []);

  const handleCreateBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setIsSubmitting(true);
    setSuccessMsg(null);

    try {
      const created = await createPeringatanDiniApi({
        tipe_bahaya: hazardType,
        level_peringatan: alertLevel,
        radius_terdampak_meter: radiusMeters,
        pesan_broadcast: broadcastMessage.trim(),
      });

      setWarnings([created, ...warnings]);
      setBroadcastMessage("");
      setIsModalOpen(false);
      setSuccessMsg("Peringatan dini darurat berhasil dirilis ke radar warga!");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || "Gagal mengirim broadcast peringatan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approximate center of Sungai Brantas warning in Malang
  const nearestHazardLat = -7.9826;
  const nearestHazardLng = 112.6308;
  const userLat = geo.latitude || -7.9735;
  const userLng = geo.longitude || 112.6288;

  const distanceToHazard = React.useMemo(() => {
    return getDistanceMeters(userLat, userLng, nearestHazardLat, nearestHazardLng);
  }, [userLat, userLng]);

  const isInDangerZone = distanceToHazard <= 800;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0EB29A] transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 mb-1">
              <Radio className="h-4 w-4 animate-pulse" />
              <span>Sistem Broadcast Peringatan Dini Multi-Bahaya</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2B3752]">
              Pusat Siaga & Peringatan Dini Lingkungan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Notifikasi broadcast darurat otomatis yang dirilis ke perangkat warga di sekitar titik rawan timbulan sampah liar, sumbatan parit, dan potensi banjir luapan air.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-500/25 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Rilis Broadcast Siaga</span>
          </button>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* PERSONAL GPS SAFETY RADAR BANNER */}
      <div
        className={cn(
          "p-6 rounded-3xl border shadow-lg transition-all relative overflow-hidden",
          isInDangerZone
            ? "bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-500 shadow-red-500/20"
            : "bg-gradient-to-r from-emerald-600 via-[#0EB29A] to-[#2E6E65] text-white border-emerald-500 shadow-emerald-500/20"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner",
                isInDangerZone ? "bg-white/20 text-white animate-bounce" : "bg-white/20 text-white"
              )}
            >
              {isInDangerZone ? (
                <ShieldAlert className="h-8 w-8 text-yellow-300" />
              ) : (
                <ShieldCheck className="h-8 w-8 text-emerald-200" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/25">
                  📡 Radar GPS Keselamatan Anda
                </span>
                <span className="text-xs opacity-90 font-medium">
                  {geo.latitude ? "GPS Presisi Aktif" : "Lokasi Perkiraan (Malang)"}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black leading-tight">
                {isInDangerZone
                  ? "PERINGATAN: ANDA BERADA DI DALAM ZONA WASPADA!"
                  : "STATUS LOKASI ANDA: AMAN DARI ZONA BAHAYA"}
              </h3>

              <p className="text-xs opacity-90 max-w-lg leading-relaxed">
                {isInDangerZone
                  ? `Posisi Anda terdeteksi berjarak ${distanceToHazard} meter dari titik rawan luapan Pintu Air Brantas (radius 800m). Waspada genangan air jika hujan lebat turun.`
                  : `Posisi Anda berjarak ${(distanceToHazard / 1000).toFixed(1)} km dari titik bahaya terdekat (di luar radius genangan 800m).`}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center gap-2 flex-shrink-0">
            <Link href="/peta">
              <Button
                size="sm"
                className="bg-white text-[#2B3752] hover:bg-slate-100 font-bold text-xs gap-1.5 shadow-md w-full"
              >
                <Compass className="h-4 w-4 text-[#0EB29A]" />
                <span>Buka Radar di Peta</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {warnings.map((alert) => (
          <Card
            key={alert.id}
            className="p-6 bg-white border-slate-200 border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow text-[#2B3752]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HazardBadge hazard={alert.tipe_bahaya} />
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    alert.level_peringatan === "AWAS"
                      ? "bg-red-500 text-white"
                      : alert.level_peringatan === "SIAGA"
                      ? "bg-amber-500 text-white"
                      : "bg-yellow-400 text-slate-900"
                  }`}
                >
                  Status: {alert.level_peringatan}
                </span>
              </div>
              <span className="text-xs text-slate-400">{formatDate(alert.created_at)}</span>
            </div>

            <div className="py-4">
              <h3 className="text-base font-bold text-[#2B3752] mb-2">
                Peringatan: {alert.tipe_bahaya}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {alert.pesan_broadcast}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="h-4 w-4 text-red-500" />
                <span>Radius Terdampak Waspada: <strong className="text-[#2B3752]">{alert.radius_terdampak_meter} Meter</strong></span>
              </div>
              <Link href="/peta">
                <Button variant="outline" size="sm" className="text-xs">
                  Buka Titik Bahaya di Peta
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Broadcast Early Warning Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Rilis Broadcast Peringatan Dini Darurat"
        description="Siarkan notifikasi darurat ke perangkat warga di sekitar radius rawan bahaya."
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Tipe Ancaman Bahaya Lingkungan
            </label>
            <select
              value={hazardType}
              onChange={(e) => setHazardType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#2B3752] bg-white focus:outline-none focus:border-red-500 font-semibold"
            >
              <option value="Banjir & Luapan Air">Banjir & Luapan Air Sungai</option>
              <option value="Sumbatan Parit Kritis">Sumbatan Parit / Drainase Kritis</option>
              <option value="Bahaya Kebakaran & Gas Metana">Bahaya Kebakaran & Gas Metana TPS</option>
              <option value="Wabah Penyakit & Sanitasi">Wabah Penyakit & Genangan Jentik DBD</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Tingkat Siaga
              </label>
              <select
                value={alertLevel}
                onChange={(e) => setAlertLevel(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#2B3752] bg-white focus:outline-none focus:border-red-500 font-bold"
              >
                <option value="WASPADA">🟡 WASPADA (Hati-hati)</option>
                <option value="SIAGA">🟠 SIAGA (Siap Tanggap)</option>
                <option value="AWAS">🔴 AWAS (Evakuasi Segera)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Radius Siaga (Meter)
              </label>
              <select
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#2B3752] bg-white focus:outline-none focus:border-red-500 font-bold"
              >
                <option value={300}>300 Meter (Radius Rukun Tetangga)</option>
                <option value={600}>600 Meter (Radius RW / Kelurahan)</option>
                <option value={1000}>1.000 Meter (Radius Luas Aliran Sungai)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Pesan Siaga Broadcast untuk Warga
            </label>
            <textarea
              rows={3}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Contoh: Debit air Kali Cipinang meningkat cepat akibat kiriman hulu. Warga di bantaran harap mengamankan barang berharga..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#2B3752] focus:outline-none focus:border-red-500 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isSubmitting}
              disabled={isSubmitting || !broadcastMessage.trim()}
              onClick={handleCreateBroadcast}
              className="font-bold text-xs"
            >
              Siarkan Broadcast Sekarang
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
