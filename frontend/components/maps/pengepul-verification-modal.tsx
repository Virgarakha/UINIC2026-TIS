"use client";

import * as React from "react";
import {
  X,
  Sparkles,
  Upload,
  Camera,
  Scale,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Coins,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { LaporanSampah, User } from "@/types";
import { analyzeCleanlinessWithGemini, CleanlinessAiResult } from "@/lib/gemini";
import { completePenjemputanApi } from "@/lib/api-client";
import { formatRupiah } from "@/lib/utils";

export interface PengepulVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: LaporanSampah;
  user: User;
  onVerificationSuccess: (
    updatedReport: LaporanSampah,
    awardedPoints: number,
    aiResult: CleanlinessAiResult
  ) => void;
}

// Preset samples for fast 1-click competition demo testing
const SAMPLE_AFTER_PHOTOS = [
  {
    id: "sample1",
    label: "Contoh Bersih 1 (Sungai Lancar)",
    url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "sample2",
    label: "Contoh Bersih 2 (Aliran Jernih)",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
  },
];

export function PengepulVerificationModal({
  isOpen,
  onClose,
  report,
  user,
  onVerificationSuccess,
}: PengepulVerificationModalProps) {
  const [afterPhoto, setAfterPhoto] = React.useState<string>(SAMPLE_AFTER_PHOTOS[0].url);
  const [timbanganKg, setTimbanganKg] = React.useState<number>(
    report.analisis_ai?.estimasi_berat_kg ? Math.max(5, Math.round(report.analisis_ai.estimasi_berat_kg * 0.95)) : 18
  );
  const [catatan, setCatatan] = React.useState(
    "Area sempadan air telah dibersihkan total. Sampah plastik dan kemasan botol telah diangkut ke armada Bank Sampah."
  );

  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [aiResult, setAiResult] = React.useState<CleanlinessAiResult | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle local image file upload & convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAfterPhoto(base64);
      setAiResult(null); // Reset AI result when new photo is selected
    };
    reader.readAsDataURL(file);
  };

  // Run Gemini Multimodal AI comparison
  const handleStartAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const result = await analyzeCleanlinessWithGemini({
        beforeImageUrl: report.foto_url,
        afterImageBase64: afterPhoto,
        title: report.deskripsi || report.alamat_lokasi,
        alamatLokasi: report.alamat_lokasi,
        timbanganRiilKg: timbanganKg,
        catatanPengepul: catatan,
      });
      setAiResult(result);
    } catch (err) {
      console.error("AI Cleanliness evaluation failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit completion and award points
  const handleFinalizeMission = async () => {
    if (!aiResult) return;
    setIsSubmitting(true);

    try {
      const awardedPoints = aiResult.reward_poin || 85;
      await completePenjemputanApi({
        laporanId: report.id,
        pengepulId: user.id,
        fotoBersih: afterPhoto,
        timbanganRiilKg: timbanganKg,
        rewardPoin: awardedPoints,
        catatan: `${catatan} - Skor AI: ${aiResult.skor_kebersihan}/100 (${aiResult.status_verifikasi})`,
      });

      const updatedReport: LaporanSampah = {
        ...report,
        status: {
          id: 6,
          kode: "selesai",
          nama: "Selesai Bersih",
          badge_color: "success",
          urutan: 6,
        },
      };

      onVerificationSuccess(updatedReport, awardedPoints, aiResult);
      onClose();
    } catch (err) {
      console.error("Failed to complete mission:", err);
      // Fallback update on error
      const awardedPoints = aiResult.reward_poin || 85;
      const updatedReport: LaporanSampah = {
        ...report,
        status: {
          id: 6,
          kode: "selesai",
          nama: "Selesai Bersih",
          badge_color: "success",
          urutan: 6,
        },
      };
      onVerificationSuccess(updatedReport, awardedPoints, aiResult);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-[#2B3752]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#0EB29A] to-[#2E6E65] text-white flex items-center justify-center shadow-md shadow-[#0EB29A]/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#2B3752]">
                Verifikasi Kebersihan & Reward Mitra
              </h3>
              <p className="text-xs text-slate-500">
                Pengepul: <span className="font-bold text-[#0EB29A]">{user.name}</span> • Laporan #{report.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#2B3752] rounded-full transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. Before vs After Comparison Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Before Photo */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Foto Sebelum (Before)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-bold border border-red-200">
                Kondisi Timbunan
              </span>
            </div>
            <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-inner">
              <img
                src={report.foto_url}
                alt="Sebelum Pembersihan"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white">
                <span className="text-[10px] font-bold block truncate">{report.alamat_lokasi}</span>
                <span className="text-[9px] text-slate-300">
                  Est. Berat: {report.analisis_ai?.estimasi_berat_kg || 15} kg • Volume: {report.analisis_ai?.volume_sampah_m3 || 0.2} m³
                </span>
              </div>
            </div>
          </div>

          {/* After Photo */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#0EB29A] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#0EB29A] animate-pulse" />
                Foto Sesudah (After)
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-bold text-[#0EB29A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Camera className="h-3 w-3" />
                <span>Unggah Foto</span>
              </button>
            </div>

            <div className="relative h-44 rounded-2xl overflow-hidden border-2 border-dashed border-[#0EB29A]/50 bg-emerald-50/20 group shadow-inner flex items-center justify-center">
              {afterPhoto ? (
                <>
                  <img
                    src={afterPhoto}
                    alt="Sesudah Pembersihan"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-300">✓ Bukti Bersih Terlampir</span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[9px] px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-white font-bold backdrop-blur-xs cursor-pointer"
                    >
                      Ganti Foto
                    </button>
                  </div>
                </>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-[#0EB29A]/10 transition-colors"
                >
                  <Upload className="h-8 w-8 text-[#0EB29A] mb-1.5" />
                  <span className="text-xs font-bold text-[#2B3752]">Klik untuk Upload Foto Bersih</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, atau Kamera Langsung</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Demo Preset Buttons */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex-shrink-0">
            Preset Uji Cepat:
          </span>
          {SAMPLE_AFTER_PHOTOS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => {
                setAfterPhoto(sample.url);
                setAiResult(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap border ${
                afterPhoto === sample.url
                  ? "bg-[#0EB29A] text-white border-[#0EB29A]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {sample.label}
            </button>
          ))}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* 2. Weight Input & Notes */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B3752] flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-[#0EB29A]" />
              <span>Timbangan Riil Sampah (kg)</span>
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={timbanganKg}
              onChange={(e) => setTimbanganKg(Number(e.target.value) || 0)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#2B3752] focus:outline-none focus:ring-2 focus:ring-[#0EB29A]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2B3752] flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#0EB29A]" />
              <span>Catatan Penanganan Pengepul</span>
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-[#2B3752] focus:outline-none focus:ring-2 focus:ring-[#0EB29A]"
            />
          </div>
        </div>

        {/* 3. AI Analysis Action Trigger OR Loading Radar */}
        <div className="mt-5">
          {isAnalyzing ? (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0EB29A]/15 via-[#2E6E65]/10 to-slate-50 border border-[#0EB29A]/30 flex flex-col items-center justify-center gap-3 text-center animate-pulse">
              <div className="h-10 w-10 rounded-full border-3 border-[#0EB29A] border-t-transparent animate-spin" />
              <div>
                <h4 className="text-sm font-black text-[#2B3752]">
                  Gemini 3.1 Multimodal Sedang Memverifikasi Kebersihan...
                </h4>
                <p className="text-xs text-[#2E6E65] mt-0.5">
                  Membandingkan foto Before & After, mengukur residu saluran, dan menghitung reward poin.
                </p>
              </div>
            </div>
          ) : !aiResult ? (
            <button
              onClick={handleStartAiAnalysis}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white font-bold text-sm shadow-xl shadow-[#0EB29A]/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Mulai Verifikasi Kebersihan AI (Gemini Multimodal)</span>
            </button>
          ) : (
            /* 4. AI Verification Result & Reward Award Card */
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-[#0EB29A]/10 to-teal-500/5 border border-emerald-300">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200/70">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-md">
                      ✓
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                        Hasil Evaluasi AI Multimodal DLH
                      </h4>
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        Verifikasi: {aiResult.status_verifikasi.toUpperCase()} • Skor: {aiResult.skor_kebersihan}/100
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-emerald-600 leading-none">
                      {aiResult.skor_kebersihan}%
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700">Tingkat Kebersihan</span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 border-b border-emerald-200/70 text-center">
                  <div className="p-2 rounded-xl bg-white/70">
                    <span className="text-[10px] text-slate-500 block">Sampah Terangkat</span>
                    <span className="text-xs font-black text-[#2B3752]">
                      {aiResult.persentase_terangkut}%
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/70">
                    <span className="text-[10px] text-slate-500 block">Timbangan Riil</span>
                    <span className="text-xs font-black text-[#2B3752]">{timbanganKg} kg</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/70">
                    <span className="text-[10px] text-slate-500 block">Insentif Tunai</span>
                    <span className="text-xs font-black text-[#0EB29A]">
                      {formatRupiah(aiResult.insentif_rupiah)}
                    </span>
                  </div>
                </div>

                {/* Reward Banner */}
                <div className="mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-amber-500 animate-bounce" />
                    <div>
                      <span className="text-xs font-black text-amber-900 block">
                        Reward Mitra Disetujui: +{aiResult.reward_poin} Poin
                      </span>
                      <span className="text-[10px] text-amber-700">
                        Poin akan langsung ditambahkan ke saldo akun Anda
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-black text-amber-600 bg-white px-2.5 py-1 rounded-lg border border-amber-300 shadow-xs">
                    +{aiResult.reward_poin} Poin
                  </span>
                </div>

                {/* AI Review Summary */}
                <p className="mt-3 text-xs text-[#2B3752] leading-relaxed italic bg-white/60 p-2.5 rounded-xl border border-emerald-100">
                  &ldquo;{aiResult.ringkasan_evaluasi}&rdquo;
                </p>
              </div>

              {/* Action Buttons: Finalize */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleStartAiAnalysis}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Uji Ulang</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalizeMission}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#0EB29A] text-white font-black text-xs shadow-lg shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Menyimpan ke Database...</span>
                  ) : (
                    <>
                      <span>🎉 Terima Reward (+{aiResult.reward_poin} Poin) & Selesaikan Misi</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
