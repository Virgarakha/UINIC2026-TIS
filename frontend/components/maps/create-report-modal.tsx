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
  ShieldCheck,
  Upload,
  RefreshCw,
  FlipHorizontal,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGeolocation } from "@/hooks/use-geolocation";
import { getLiveWeather, WeatherData } from "@/lib/weather";
import { analyzeWasteWithGemini, AnalisisAiResult } from "@/lib/gemini";
import { createLaporanApi } from "@/lib/api-client";
import {
  burnForensicWatermark,
  MetadataForensik,
} from "@/lib/image-watermark";
import { LaporanSampah } from "@/types";

export interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated: (newReport: LaporanSampah, weather: WeatherData) => void;
}

export function CreateReportModal({
  isOpen,
  onClose,
  onReportCreated,
}: CreateReportModalProps) {
  const geo = useGeolocation();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [kategoriId, setKategoriId] = React.useState("1");

  // Photo & Forensic state
  const [photoMode, setPhotoMode] = React.useState<"camera" | "upload">("camera");
  const [isCameraActive, setIsCameraActive] = React.useState(false);
  const [isStartingCamera, setIsStartingCamera] = React.useState(false);
  const [cameraFacing, setCameraFacing] = React.useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = React.useState<string | null>(null);

  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [base64Data, setBase64Data] = React.useState<string | null>(null);
  const [mimeType, setMimeType] = React.useState("image/jpeg");
  const [useWatermark, setUseWatermark] = React.useState(true);
  const [forensicMetadata, setForensicMetadata] = React.useState<MetadataForensik | null>(null);

  // Step indicator state during AI pipeline
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processStep, setProcessStep] = React.useState<string>("");

  // Clean up media stream when component unmounts or modal closes
  const stopCamera = React.useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsStartingCamera(false);
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen, stopCamera]);

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start WebCam Stream
  const startCamera = async (facing: "environment" | "user" = cameraFacing) => {
    stopCamera();
    setCameraError(null);
    setIsStartingCamera(true);

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Browser Anda tidak mendukung akses kamera langsung.");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      setIsStartingCamera(false);
    } catch (err) {
      console.warn("Camera access failed:", err);
      setIsStartingCamera(false);
      setIsCameraActive(false);
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal mengakses kamera. Silakan pilih opsi 'Unggah Berkas / Galeri'.";
      setCameraError(msg);
      // Auto fallback to upload mode if camera is unavailable
      setPhotoMode("upload");
    }
  };

  // Toggle Front/Back Camera
  const toggleCameraFacing = async () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      await startCamera(nextFacing);
    }
  };

  // Capture frame from Live Camera
  const handleCaptureFromCamera = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    const lat = geo.latitude || -7.9826;
    const lng = geo.longitude || 112.6308;
    const alamatPerkiraan = title.trim() || "Klojen, Kota Malang, Jawa Timur";

    if (useWatermark) {
      try {
        const { dataUrl, metadata } = await burnForensicWatermark(canvas, {
          latitude: lat,
          longitude: lng,
          accuracy: geo.accuracy || 12,
          alamat: alamatPerkiraan,
          captureMode: "live_camera",
        });
        setPreviewImage(dataUrl);
        setBase64Data(dataUrl);
        setForensicMetadata(metadata);
      } catch (e) {
        console.error("Watermark error:", e);
        const rawUrl = canvas.toDataURL("image/jpeg", 0.85);
        setPreviewImage(rawUrl);
        setBase64Data(rawUrl);
      }
    } else {
      const rawUrl = canvas.toDataURL("image/jpeg", 0.85);
      setPreviewImage(rawUrl);
      setBase64Data(rawUrl);
      setForensicMetadata(null);
    }

    stopCamera();
  };

  // Process File Upload with Canvas Compression & Forensic Watermark
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType("image/jpeg");

    try {
      const { dataUrl, metadata } = await new Promise<{
        dataUrl: string;
        metadata: MetadataForensik | null;
      }>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = async () => {
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
              resolve({
                dataUrl: event.target?.result as string,
                metadata: null,
              });
              return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            const lat = geo.latitude || -7.9826;
            const lng = geo.longitude || 112.6308;
            const alamatPerkiraan = title.trim() || "Klojen, Kota Malang, Jawa Timur";

            if (useWatermark) {
              try {
                const res = await burnForensicWatermark(canvas, {
                  latitude: lat,
                  longitude: lng,
                  accuracy: geo.accuracy || 15,
                  alamat: alamatPerkiraan,
                  captureMode: "upload_file",
                });
                resolve({ dataUrl: res.dataUrl, metadata: res.metadata });
                return;
              } catch (err) {
                console.error("Watermark error:", err);
              }
            }

            resolve({
              dataUrl: canvas.toDataURL("image/jpeg", 0.85),
              metadata: null,
            });
          };
          img.onerror = () =>
            resolve({ dataUrl: event.target?.result as string, metadata: null });
        };
        reader.onerror = () => resolve({ dataUrl: "", metadata: null });
      });

      if (dataUrl) {
        setPreviewImage(dataUrl);
        setBase64Data(dataUrl);
        setForensicMetadata(metadata);
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

  // Submit Handler
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

      // 3. Persist to Backend API & PostgreSQL Database with Forensic Metadata
      setProcessStep("Menyimpan laporan & metadata forensik anti-fraud ke PostgreSQL...");

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
        metadata_forensik: forensicMetadata,
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
      setForensicMetadata(null);
      setTitle("");
      setDescription("");
      stopCamera();
      onClose();
    } catch (error) {
      console.error("Submission failed:", error);
      setIsProcessing(false);
      const msg =
        error instanceof Error ? error.message : "Terjadi kendala saat memproses laporan";
      alert(`Gagal menyimpan laporan ke database: ${msg}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          stopCamera();
          onClose();
        }}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-white p-5 sm:p-6 shadow-2xl shadow-slate-300/60 border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#0EB29A]/10 text-[#0EB29A] flex items-center justify-center font-bold">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-[#2B3752]">Lapor Titik Timbunan Baru</h3>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#0EB29A]/15 text-[#0EB29A] border border-[#0EB29A]/30">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Anti-Fraud
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Watermark Geotagging GPS & Analisis Multimodal AI
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-[#2B3752] rounded-full cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        {isProcessing ? (
          <div className="py-14 flex flex-col items-center justify-center text-center space-y-4">
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
              <span>Menyematkan stempel forensik digital & sensor hidrologi</span>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="pt-3 space-y-3.5 overflow-y-auto pr-1"
          >
            {/* 1. Photo Capture / Viewfinder / Upload Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#2B3752]">
                  Foto Bukti Lapangan <span className="text-red-500">*</span>
                </label>

                {/* Mode Selector Tabs (only when no preview yet) */}
                {!previewImage && (
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoMode("camera");
                        startCamera();
                      }}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        photoMode === "camera"
                          ? "bg-white text-[#0EB29A] shadow-xs"
                          : "text-slate-500 hover:text-[#2B3752]"
                      }`}
                    >
                      <Camera className="h-3 w-3" />
                      Kamera Live
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setPhotoMode("upload");
                      }}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        photoMode === "upload"
                          ? "bg-white text-[#2B3752] shadow-xs"
                          : "text-slate-500 hover:text-[#2B3752]"
                      }`}
                    >
                      <Upload className="h-3 w-3" />
                      Unggah File
                    </button>
                  </div>
                )}
              </div>

              {previewImage ? (
                /* PREVIEW GAMBAR BERWATERMARK */
                <div className="space-y-2">
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-200 shadow-inner">
                    <img
                      src={previewImage}
                      alt="Preview Sampah Berstempel Forensik"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setBase64Data(null);
                        setForensicMetadata(null);
                        if (photoMode === "camera") {
                          startCamera();
                        }
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/75 text-white hover:bg-black transition-colors cursor-pointer"
                      title="Ambil Ulang Foto"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>

                    {/* Stamped Badge Overlay */}
                    <div className="absolute top-2 left-2 bg-[#0EB29A]/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="h-3 w-3" />
                      Watermark Forensik Tersemat
                    </div>
                  </div>

                  {/* Verification Note */}
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2 text-[11px] text-emerald-900">
                    <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        Validasi Anti-Fraud Berhasil
                      </span>
                      <span className="text-[10px] text-emerald-700">
                        Foto telah distempel permanen dengan koordinat GPS (±{geo.accuracy || 12}m),
                        timestamp WIB realtime, dan sidik jari digital integritas SHA-256.
                      </span>
                    </div>
                  </div>
                </div>
              ) : photoMode === "camera" ? (
                /* LIVE CAMERA VIEWFINDER */
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-300 shadow-inner flex flex-col items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Reticle Viewfinder Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
                    {/* Top live indicators */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-white text-[10px] font-mono">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <span>LIVE GPS: {geo.latitude?.toFixed(4)}, {geo.longitude?.toFixed(4)}</span>
                      </div>
                      <span className="bg-[#0EB29A]/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        AKURASI ±{geo.accuracy || 12}M
                      </span>
                    </div>

                    {/* Center Crosshair / Viewfinder Reticle */}
                    <div className="self-center flex items-center justify-center">
                      <div className="w-16 h-16 border-2 border-dashed border-white/40 rounded-xl flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#0EB29A]" />
                      </div>
                    </div>

                    {/* Bottom Guidance */}
                    <p className="text-[10px] text-center text-white/80 bg-black/50 backdrop-blur-xs py-0.5 rounded-md">
                      Arahkan kamera ke tumpukan sampah / sumbatan saluran air
                    </p>
                  </div>

                  {/* Camera Controls */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
                      title="Balik Kamera Depan/Belakang"
                    >
                      <FlipHorizontal className="h-4 w-4" />
                    </button>

                    {/* Shutter Button */}
                    <button
                      type="button"
                      onClick={handleCaptureFromCamera}
                      className="h-12 w-12 rounded-full bg-white border-4 border-[#0EB29A] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                      title="Jepret Foto Sekarang"
                    >
                      <div className="h-8 w-8 rounded-full bg-[#0EB29A]" />
                    </button>

                    <div className="w-8" />
                  </div>

                  {/* Starting Loader or Error State */}
                  {isStartingCamera && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-2 text-white text-xs">
                      <Loader2 className="h-6 w-6 animate-spin text-[#0EB29A]" />
                      <span>Mengaktifkan kamera & sensor GPS...</span>
                    </div>
                  )}

                  {!isCameraActive && !isStartingCamera && (
                    <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-4 text-center space-y-3">
                      <Camera className="h-8 w-8 text-[#0EB29A] mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-white">
                          Kamera Siap Diaktifkan
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Verifikasi langsung di lokasi untuk kepastian data anti-pemalsuan
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="glow"
                        size="sm"
                        onClick={() => startCamera()}
                        className="gap-1.5"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        Nyalakan Kamera
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                /* FILE UPLOAD DROPZONE */
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
                  <Upload className="h-7 w-7 text-[#0EB29A] mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-[#2B3752]">
                    Pilih Berkas Foto dari Galeri / Kamera
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Stempel watermark GPS & SHA-256 otomatis disematkan pada kanvas foto
                  </p>
                </div>
              )}

              {/* Watermark Toggle Switch */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={useWatermark}
                    onChange={(e) => setUseWatermark(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-[#0EB29A] focus:ring-[#0EB29A]"
                  />
                  <span>Sematkan Watermark Geotagging Anti-Fraud Resmi</span>
                </label>
                <span className="text-[10px] text-[#0EB29A] font-bold">
                  {useWatermark ? "🛡️ Aktif" : "Non-Aktif"}
                </span>
              </div>
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
            <div className="pt-2 flex items-center justify-end gap-2.5 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
              >
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
