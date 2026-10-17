"use client";

import React from "react";
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  Phone,
  MessageSquare,
  MapPin,
  Award,
  Navigation,
} from "lucide-react";
import { ActiveArmadaTruck } from "@/lib/api-client";

interface PengepulProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  truck: ActiveArmadaTruck | null;
  onFocusTruck?: (lat: number, lng: number) => void;
}

export function PengepulProfileModal({
  isOpen,
  onClose,
  truck,
  onFocusTruck,
}: PengepulProfileModalProps) {
  if (!isOpen || !truck) return null;

  const driverName = truck.pengepul_nama || "Pak Joko (Mitra Pengepul)";
  const rating = truck.pengepul_rating || 4.9;
  const totalMisi = truck.pengepul_total_misi || 128;
  const platNomor = truck.pengepul_plat_nomor || "N 8472 AB";
  const jenisKendaraan = truck.pengepul_jenis_kendaraan || "Truk Bak Hidrolik Mini DLH";
  const telepon = truck.pengepul_telepon || "0812-3456-7890";
  const avatarUrl =
    truck.pengepul_foto ||
    "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&auto=format&fit=crop&q=80";

  const isPickingUp = truck.status_jemput === "tahap_pengambilan";
  const statusLabel = isPickingUp ? "Tahap Pengambilan di Lokasi" : "Sedang Menuju Lokasi (OTW)";
  const statusColor = isPickingUp
    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : "text-[#0EB29A] bg-[#0EB29A]/10 border-[#0EB29A]/20";

  const handleFocus = () => {
    if (onFocusTruck && truck.latitude && truck.longitude) {
      onFocusTruck(truck.latitude, truck.longitude);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Background with Gradient */}
        <div className="relative h-20 bg-gradient-to-r from-[#0EB29A] via-[#2E6E65] to-[#2B3752] p-4 flex items-start justify-between">
          <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold tracking-wide uppercase">
            <Truck className="h-4 w-4 text-emerald-300" />
            <span>Profil Mitra Pengepul</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="px-5 pb-5 pt-0 -mt-9">
          {/* Avatar and Verification */}
          <div className="flex items-end justify-between mb-3">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={driverName}
                className="h-20 w-20 rounded-2xl object-cover border-4 border-white shadow-lg bg-slate-100"
              />
              <span
                className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs"
                title="Driver Sedang Online"
              >
                <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Terverifikasi
              </span>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">Mitra Resmi DLH</span>
            </div>
          </div>

          {/* Name & Title */}
          <div className="mb-2">
            <h3 className="text-lg font-black text-[#2B3752] leading-tight">
              {driverName}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Petugas Pengangkutan & Daur Ulang Sampah
            </p>
          </div>

          {/* Rating Section */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 mb-3">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-amber-200 text-amber-300"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-[#2B3752]">{rating.toFixed(1)}</span>
              <span className="text-[11px] text-slate-500 font-medium">/ 5.0</span>
            </div>
            <span className="text-[10px] text-slate-400 ml-auto font-medium">
              (64+ Ulasan Positif)
            </span>
          </div>

          {/* Current Status Badge */}
          <div className={`p-2.5 rounded-xl border mb-3 flex items-start gap-2.5 ${statusColor}`}>
            <span className="h-2.5 w-2.5 rounded-full bg-current mt-0.5 shrink-0 animate-ping"></span>
            <div className="text-xs leading-tight">
              <div className="font-bold">{statusLabel}</div>
              {truck.laporan?.alamat_lokasi && (
                <div className="text-[11px] opacity-80 mt-0.5 line-clamp-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span>{truck.laporan.alamat_lokasi}</span>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle & Mission Quick Info Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
              <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold uppercase mb-0.5">
                <Truck className="h-3 w-3 text-[#0EB29A]" />
                <span>Kendaraan</span>
              </div>
              <span className="font-bold text-[#2B3752] text-xs">{platNomor}</span>
              <span className="text-[10px] text-slate-500 line-clamp-1">{jenisKendaraan}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
              <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold uppercase mb-0.5">
                <Award className="h-3 w-3 text-[#2E6E65]" />
                <span>Misi Bersih</span>
              </div>
              <span className="font-bold text-[#2B3752] text-xs">{totalMisi}+ Selesai</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Tingkat Sukses 99%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${telepon}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0EB29A] hover:bg-[#0da08b] text-white text-xs font-bold shadow-md shadow-[#0EB29A]/20 transition-all active:scale-98"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Telepon</span>
              </a>

              <a
                href={`https://wa.me/${telepon.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#2E6E65] hover:bg-[#255a53] text-white text-xs font-bold shadow-md shadow-[#2E6E65]/20 transition-all active:scale-98"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            {onFocusTruck && (
              <button
                type="button"
                onClick={handleFocus}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2B3752] text-xs font-bold transition-all cursor-pointer"
              >
                <Navigation className="h-3.5 w-3.5 text-[#0EB29A]" />
                <span>Pusatkan Peta ke Truk Ini</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
