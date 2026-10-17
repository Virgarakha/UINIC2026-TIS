"use client";

import * as React from "react";
import {
  Camera,
  MapPin,
  Sparkles,
  Bot,
  CloudRain,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGeolocation } from "@/hooks/use-geolocation";
import { getLiveWeather, WeatherData } from "@/lib/weather";
import { analyzeWasteWithGemini, AnalisisAiResult } from "@/lib/gemini";
import { createLaporanApi } from "@/lib/api-client";
import { LaporanSampah } from "@/types";

export interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated: (newReport: LaporanSampah, weather: WeatherData) => void;
}

export function CreateReportModal({ isOpen, onClose, onReportCreated }: CreateReportModalProps) {
  const geo = useGeolocation();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [kategoriId, setKategoriId] = React.useState("1");
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [base64Data, setBase64Data] = React.useState<string | null>(null);
  const [mimeType, setMimeType] = React.useState("image/jpeg");

  // Step indicator state during AI pipeline
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processStep, setProcessStep] = React.useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType("image/jpeg");

    // Client-side auto-compression to max 1280px dimension (keeps payload ~150KB for fast transfer & AI)
    try {
      const compressed = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            let width = img.width;
            let height = img.height;
            const maxDim = 1280;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve(event.target?.result as string);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.82));
          };
          img.onerror = () => resolve(event.target?.result as string);
        };
        reader.onerror = () => resolve("");
      });

      if (compressed) {
        setPreviewImage(compressed);
        setBase64Data(compressed);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setBase64Data(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsProcessing(true);

    try {
      const lat = geo.latitude || -7.9826;
      const lng = geo.longitude || 112.6308;

      // 1. Fetch live weather from Open-Meteo
      setProcessStep("Mengambil data cuaca & hidrologi Open-Meteo...");
      const weather = await getLiveWeather(lat, lng);

      // 2. Multimodal AI reasoning with Gemini 3.1 Flash Lite
      setProcessStep("Gemini 3.1 Flash Lite menganalisis citra visual & hidrologi...");
      const aiResult: AnalisisAiResult = await analyzeWasteWithGemini({
        base64Image: base64Data || undefined,
        mimeType: mimeType,
        title: title,
        description: description,
        alamatLokasi: title,
        latitude: lat,
        longitude: lng,
        weather: weather,
      });

      // 3. Persist to Backend API & PostgreSQL Database
      setProcessStep("Menyimpan laporan & analisis AI ke database PostgreSQL...");

      const createdReport = await createLaporanApi({
        foto_url:
          previewImage ||
          "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
        latitude: lat,
        longitude: lng,
        alamat_lokasi: title,
        deskripsi: description || "Laporan sampah terdeteksi oleh warga.",
        kategori_id: parseInt(kategoriId, 10),
        is_resiko_banjir: aiResult.persentase_sumbatan_aliran > 50,
        tipe_bahaya: aiResult.potensi_bahaya,
        analisis_ai: {
          volume_sampah_m3: aiResult.volume_sampah_m3,
          persentase_sumbatan_aliran: aiResult.persentase_sumbatan_aliran,
          estimasi_berat_kg: aiResult.estimasi_berat_kg,
          potensi_bahaya: aiResult.potensi_bahaya,
          prediksi_banjir: aiResult.prediksi_banjir,
          confidence_score: aiResult.confidence_score,
          rekomendasi_tindakan: aiResult.rekomendasi_tindakan,
          jenis_sampah_dominan: aiResult.jenis_sampah_dominan,
          nilai_ekonomi_estimasi: aiResult.nilai_ekonomi_estimasi,
        },
        weather: {
          temperature: weather.temperature,
          precipitation: weather.precipitation,
          rain: weather.rain,
          relativeHumidity: weather.relativeHumidity,
          windSpeed: weather.windSpeed,
          elevation: weather.elevation,
          rainForecastTotal: weather.rainForecastTotal,
          weatherDescription: weather.statusCuaca,
        },
      });

      // Callback to parent map view with persisted database record
      onReportCreated(createdReport, weather);

      // Reset form and close
      setIsProcessing(false);
      setPreviewImage(null);
      setBase64Data(null);
      setTitle("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Submission failed:", error);
      setIsProcessing(false);
      const msg = error instanceof Error ? error.message : "Terjadi kendala saat memproses laporan";
      alert(`Gagal menyimpan laporan ke database: ${msg}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl shadow-slate-300/60 border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[#0EB29A]/10 text-[#0EB29A] flex items-center justify-center font-bold">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2B3752]">Lapor Titik Timbunan Baru</h3>
              <p className="text-[11px] text-slate-400">GPS & Analisis Multimodal AI Otomatis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-[#2B3752] rounded-full cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        {isProcessing ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-[#0EB29A] opacity-30" />
              <div className="h-14 w-14 rounded-2xl bg-[#0EB29A] text-white flex items-center justify-center shadow-lg shadow-[#0EB29A]/40">
                <Bot className="h-7 w-7 animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#2B3752]">
                Memproses Laporan & Inferensi AI...
              </h4>
              <p className="text-xs text-[#0EB29A] font-semibold">{processStep}</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <Loader2 className="h-3 w-3 animate-spin text-[#0EB29A]" />
              <span>Memadukan citra visual foto + sensor cuaca Open-Meteo</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-4 space-y-4">
            {/* 1. Photo Capture / Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#2B3752]">
                Foto Bukti Timbunan Sampah <span className="text-red-500">*</span>
              </label>

              {previewImage ? (
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-200">
                  <img src={previewImage} alt="Preview Sampah" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setBase64Data(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                    title="Ganti Foto"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-[#0EB29A] transition-colors bg-slate-50/70 cursor-pointer group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Camera className="h-7 w-7 text-[#0EB29A] mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-[#2B3752]">
                    Ambil Foto / Pilih dari Galeri
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    AI Gemini 3.1 Flash Lite akan menghitung volume & sumbatan dari foto ini
                  </p>
                </div>
              )}
            </div>

            {/* 2. Auto-GPS Geolocation Banner */}
            <div className="p-3 rounded-2xl bg-[#0EB29A]/10 border border-[#0EB29A]/25 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#0EB29A] flex-shrink-0" />
                <div>
                  <span className="font-bold text-[#2B3752] block">
                    Lokasi GPS Terkunci Otomatis
                  </span>
                  <span className="text-[11px] text-[#2E6E65] font-mono">
                    Lat: {geo.latitude?.toFixed(4)}, Lng: {geo.longitude?.toFixed(4)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={geo.refresh}
                className="text-[11px] font-bold text-[#0EB29A] underline hover:no-underline cursor-pointer"
              >
                Segarkan
              </button>
            </div>

            {/* 3. Title & Category */}
            <Input
              label="Judul Titik Laporan"
              placeholder="Contoh: Timbunan Kasur & Bambu Kali Klojen"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2B3752]">
                  Kategori Utama
                </label>
                <select
                  value={kategoriId}
                  onChange={(e) => setKategoriId(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-[#2B3752] outline-none focus:ring-2 focus:ring-[#0EB29A]"
                >
                  <option value="1">Plastik & Residu (Saluran Air)</option>
                  <option value="2">Kardus & Logam (Siap Pengepul)</option>
                  <option value="3">Organik Basah & Dedaunan</option>
                  <option value="4">Limbah B3 / Medis Liar</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2B3752]">
                  Data Cuaca Titik
                </label>
                <div className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#2E6E65]">
                  <CloudRain className="h-4 w-4 text-[#0EB29A]" />
                  <span>Open-Meteo Ready</span>
                </div>
              </div>
            </div>

            {/* 4. Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#2B3752]">
                Deskripsi Tambahan
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Air mulai meluap setinggi mata kaki saat hujan lebat kemarin..."
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-[#2B3752] outline-none focus:ring-2 focus:ring-[#0EB29A]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" variant="glow" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Kirim & Analisis AI</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
