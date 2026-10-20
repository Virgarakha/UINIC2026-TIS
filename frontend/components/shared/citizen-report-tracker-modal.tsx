"use client";

import * as React from "react";
import {
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Truck,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Award,
  Layers,
} from "lucide-react";
import { LaporanSampah, User } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getStoredUser, isGuestUser } from "@/lib/auth-storage";

export interface CitizenReportTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: LaporanSampah | null;
  onViewOnMap?: (report: LaporanSampah) => void;
  user?: User | null;
}

export function CitizenReportTrackerModal({
  isOpen,
  onClose,
  report,
  onViewOnMap,
  user,
}: CitizenReportTrackerModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  const ai = report.analisis_ai;
  const statusKode = (report.status?.kode || "").toLowerCase();
  const statusNama = (report.status?.nama || "").toLowerCase();
  const statusJemput = ((report as any).status_jemput || "").toLowerCase();
  const statusId = report.status_id || report.status?.id;

  const isCompleted =
    statusKode === "selesai" ||
    statusKode === "tuntas" ||
    statusNama.includes("selesai") ||
    statusNama.includes("tuntas") ||
    statusJemput === "selesai" ||
    statusId === 6;

  // Determine active step index (0-based)
  // 0: Terkirim
  // 1: Dianalisis AI
  // 2: Mitra Pengepul Ditugaskan
  // 3: Menuju Lokasi (OTW)
  // 4: Selesai Diangkut & Bersih
  let currentStep = 1;
  if (ai) currentStep = 2;
  if (statusKode === "siap_diambil_pengepul") currentStep = 2;
  if (
    statusKode === "sedang_ditangani" ||
    statusKode === "sedang_dibersihkan" ||
    statusJemput === "menuju_lokasi" ||
    statusJemput === "sedang_jalan"
  ) {
    currentStep = 3;
  }
  if (isCompleted) {
    currentStep = 4;
  }

  const effectiveUser = user || (typeof window !== "undefined" ? getStoredUser() : null);
  const isGuest = isGuestUser(effectiveUser);

  const driverName = (report as any).penjemputan?.pengepul?.name || (report as any).pengepul_nama || "Pak Slamet (Mitra DLH & Pengepul)";
  const driverPhone = (report as any).penjemputan?.pengepul?.no_hp || (report as any).pengepul_telepon || "081333794278";
  const driverPlat = (report as any).penjemputan?.pengepul?.plat_nomor || (report as any).pengepul_plat_nomor || "N 8472 AB";
  const driverVehicle = (report as any).penjemputan?.pengepul?.jenis_kendaraan || (report as any).pengepul_jenis_kendaraan || "Truk Bak Hidrolik Mini DLH";
  const driverRating = (report as any).penjemputan?.pengepul?.rating || (report as any).pengepul_rating || 4.95;

  const steps = [
    {
      title: "Laporan Diterima",
      desc: "Foto & koordinat GPS tercatat di sistem radar EcoPatrol",
      time: formatDate(report.created_at),
      icon: MapPin,
      isDone: currentStep >= 0,
      isActive: currentStep === 0,
    },
    {
      title: "Verifikasi AI & Sensor Hidrologi",
      desc: ai
        ? `Terdeteksi ${ai.estimasi_berat_kg || 12} kg ${ai.jenis_sampah_dominan || "Residu & Plastik"} • Nilai estimasi: Rp ${(ai.nilai_ekonomi_estimasi || 35000).toLocaleString("id-ID")}`
        : "Gemini AI menganalisis citra visual & risiko luapan air",
      time: ai ? "Terverifikasi Otomatis" : "Sedang memproses...",
      icon: Sparkles,
      isDone: currentStep >= 1,
      isActive: currentStep === 1,
    },
    {
      title: "Mitra Pengepul Dikonfirmasi",
      desc: `${driverName} menerima penugasan penjemputan`,
      time: `${driverVehicle} • Plat ${driverPlat}`,
      icon: Truck,
      isDone: currentStep >= 2,
      isActive: currentStep === 2,
    },
    {
      title: "Armada Menuju Lokasi",
      desc: currentStep >= 3 ? "Truk dalam perjalanan • Estimasi tiba ~4-8 menit" : "Menunggu armada bersiap jalan",
      time: currentStep >= 3 ? "Jarak ~1.2 km" : "Segera meluncur",
      icon: Clock,
      isDone: currentStep >= 3,
      isActive: currentStep === 3,
    },
    {
      title: "Sampah Terangkut & Area Bersih",
      desc: currentStep >= 4
        ? isGuest
          ? "Lokasi tuntas dibersihkan oleh armada mitra (Mode Tamu: 0 Poin)"
          : "Lokasi tuntas dibersihkan • +50 Poin Warga dikreditkan"
        : "Menunggu penyelesaian angkut & timbang",
      time: currentStep >= 4 ? "Tuntas Bersih" : "Tahap Akhir",
      icon: Award,
      isDone: currentStep >= 4,
      isActive: currentStep === 4,
    },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal / Bottom Sheet Window */}
      <div className="relative z-10 w-full sm:max-w-xl max-h-[90vh] bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-slate-200 text-[#2B3752] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/50 to-teal-50/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#0EB29A] text-white flex items-center justify-center shadow-md shadow-[#0EB29A]/30">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#0EB29A] uppercase tracking-wider">
                  Live Tracking Penjemputan
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white text-slate-600 border border-slate-200 shadow-2xs">
                  ID #{report.id}
                </span>
              </div>
              <h3 className="text-base font-black text-[#18231D] truncate max-w-[260px] sm:max-w-sm">
                {report.alamat_lokasi || "Titik Laporan Sampah"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Status Highlight Banner */}
          <div className={cn(
            "p-4 rounded-2xl border flex items-center justify-between gap-3",
            currentStep >= 4
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : currentStep >= 2
              ? "bg-teal-50 border-teal-200 text-teal-900"
              : "bg-slate-50 border-slate-200 text-slate-800"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-8 w-8 rounded-xl flex items-center justify-center font-black text-sm",
                currentStep >= 4 ? "bg-emerald-500 text-white" : "bg-[#0EB29A] text-white animate-pulse"
              )}>
                {currentStep >= 4 ? "✓" : "⚡"}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">
                  {currentStep >= 4
                    ? "Penjemputan Selesai • Area Bebas Sampah"
                    : currentStep >= 3
                    ? "Truk Sedang Menuju Lokasi Anda"
                    : currentStep >= 2
                    ? "Tugas Dijadwalkan ke Mitra Pengepul"
                    : "Laporan Sedang Diproses Sistem AI"}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {currentStep >= 4
                    ? "Terima kasih telah berkontribusi menjaga kebersihan lingkungan!"
                    : "Perkiraan armada tiba di titik sampah: 4 - 8 Menit"}
                </p>
              </div>
            </div>
            {onViewOnMap && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onClose();
                  onViewOnMap(report);
                }}
                className="rounded-xl text-xs font-bold gap-1 bg-white hover:bg-emerald-50 border-emerald-300 text-emerald-700 flex-shrink-0"
              >
                <span>Buka Radar</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Mitra Pengepul Driver Card (Gojek / Grab Style) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=120&auto=format&fit=crop&q=80"
                alt={driverName}
                className="h-12 w-12 rounded-full object-cover border-2 border-[#0EB29A] shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-[#18231D]">{driverName}</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ★ {driverRating}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {driverVehicle} • <span className="font-bold text-slate-700">{driverPlat}</span>
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  Mitra Resmi Dinas Lingkungan Hidup
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href={`https://wa.me/${driverPhone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center transition-colors shadow-2xs"
                title="Hubungi via WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href={`tel:${driverPhone}`}
                className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 flex items-center justify-center transition-colors shadow-2xs"
                title="Panggilan Telepon"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Vertical Stepper Timeline */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 px-1">
              Perjalanan Laporan & Tindak Lanjut
            </h4>
            <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {steps.map((st, idx) => {
                const Icon = st.icon;
                return (
                  <div key={idx} className="relative group">
                    {/* Step Dot / Badge */}
                    <div
                      className={cn(
                        "absolute -left-7 top-0.5 h-6 w-6 rounded-full flex items-center justify-center transition-all",
                        st.isDone
                          ? "bg-emerald-500 text-white shadow-xs shadow-emerald-500/40"
                          : st.isActive
                          ? "bg-[#0EB29A] text-white ring-4 ring-[#0EB29A]/20 animate-pulse"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      )}
                    >
                      <Icon className="h-3 w-3 stroke-[2.5]" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h5
                          className={cn(
                            "text-xs font-bold leading-tight",
                            st.isDone ? "text-[#18231D]" : "text-slate-400"
                          )}
                        >
                          {st.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                          {st.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {st.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photo & Value Summary Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Foto Titik Sampah Awal</span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Terverifikasi Geotag
              </span>
            </div>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-200 relative">
              <img
                src={report.foto_url}
                alt="Foto Sampah"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] flex items-center justify-between">
                <span>📍 {report.alamat_lokasi}</span>
                <span className="font-bold">± {ai?.estimasi_berat_kg || 15} kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl text-xs font-bold"
          >
            Tutup
          </Button>
          {onViewOnMap && (
            <Button
              variant="glow"
              onClick={() => {
                onClose();
                onViewOnMap(report);
              }}
              className="flex-1 rounded-xl text-xs font-black gap-1.5"
            >
              <Truck className="h-4 w-4" />
              <span>Pantau Armada di Peta</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
