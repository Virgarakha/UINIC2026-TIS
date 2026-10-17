"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  ArrowLeft,
  FlipHorizontal,
  Upload,
  RefreshCw,
  Sparkles,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  CloudRain,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGeolocation } from "@/hooks/use-geolocation";
import { getLiveWeather, WeatherData } from "@/lib/weather";
import { analyzeWasteWithGemini, AnalisisAiResult } from "@/lib/gemini";
import { createLaporanApi } from "@/lib/api-client";
import { burnForensicWatermark, MetadataForensik } from "@/lib/image-watermark";
import { LaporanSampah } from "@/types";
import { cn } from "@/lib/utils";

const KATEGORI_OPTIONS = [
  { id: "1", label: "Plastik & Saluran Air", icon: "🌊", desc: "Residu plastik berpotensi menyumbat" },
  { id: "2", label: "Kardus & Logam", icon: "📦", desc: "Bernilai ekonomi untuk pengepul" },
  { id: "3", label: "Organik & Dedaunan", icon: "🍂", desc: "Sampah basah dan sisa makanan" },
  { id: "4", label: "Limbah B3 / Medis", icon: "☣️", desc: "Bahan berbahaya & jarum suntik" },
  { id: "5", label: "Timbunan TPS Liar", icon: "🛑", desc: "Tumpukan liar di pinggir jalan" },
];

export default function LaporCameraPage() {
  const router = useRouter();
  const geo = useGeolocation();

  // References
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const bottomSheetRef = React.useRef<HTMLDivElement | null>(null);

  // Camera & Image State
  const [isCameraActive, setIsCameraActive] = React.useState(false);
  const [isStartingCamera, setIsStartingCamera] = React.useState(false);
  const [cameraFacing, setCameraFacing] = React.useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [base64Data, setBase64Data] = React.useState<string | null>(null);
  const [forensicMetadata, setForensicMetadata] = React.useState<MetadataForensik | null>(null);
  const [useWatermark, setUseWatermark] = React.useState(true);

  // Form State
  const [title, setTitle] = React.useState("");
  const [kategoriId, setKategoriId] = React.useState("1");
  const [description, setDescription] = React.useState("");
  const [isSheetExpanded, setIsSheetExpanded] = React.useState(false);

  // Pipeline submission state
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processStep, setProcessStep] = React.useState("");
  const [createdReport, setCreatedReport] = React.useState<LaporanSampah | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Clean up camera stream
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

  // Start live WebCam stream
  const startCamera = React.useCallback(
    async (facing: "environment" | "user" = cameraFacing) => {
      stopCamera();
      setCameraError(null);
      setIsStartingCamera(true);

      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          throw new Error("Browser Anda belum mendukung akses kamera langsung.");
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
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
            : "Kamera tidak dapat diakses. Anda dapat menggunakan opsi Galeri / Unggah Foto.";
        setCameraError(msg);
      }
    },
    [cameraFacing, stopCamera]
  );

  // Start camera on mount
  React.useEffect(() => {
    startCamera("environment");
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Flip front/back camera
  const toggleCameraFacing = async () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      await startCamera(nextFacing);
    }
  };

  // Capture photo from live camera
  const handleCapture = async () => {
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
          accuracy: geo.accuracy || 10,
          alamat: alamatPerkiraan,
          captureMode: "live_camera",
        });
        setPreviewImage(dataUrl);
        setBase64Data(dataUrl);
        setForensicMetadata(metadata);
      } catch (e) {
        console.error("Watermark error:", e);
        const rawUrl = canvas.toDataURL("image/jpeg", 0.88);
        setPreviewImage(rawUrl);
        setBase64Data(rawUrl);
      }
    } else {
      const rawUrl = canvas.toDataURL("image/jpeg", 0.88);
      setPreviewImage(rawUrl);
      setBase64Data(rawUrl);
      setForensicMetadata(null);
    }

    stopCamera();

    // Auto-scroll sheet slightly into focus so user can immediately type details
    setTimeout(() => {
      bottomSheetRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 200);
  };

  // Retake photo
  const handleRetake = () => {
    setPreviewImage(null);
    setBase64Data(null);
    setForensicMetadata(null);
    startCamera(cameraFacing);
  };

  // Handle file picker upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
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
          if (!ctx) return;

          ctx.drawImage(img, 0, 0, width, height);

          const lat = geo.latitude || -7.9826;
          const lng = geo.longitude || 112.6308;
          const alamatPerkiraan = title.trim() || "Klojen, Kota Malang, Jawa Timur";

          if (useWatermark) {
            try {
              const res = await burnForensicWatermark(canvas, {
                latitude: lat,
                longitude: lng,
                accuracy: geo.accuracy || 12,
                alamat: alamatPerkiraan,
                captureMode: "upload_file",
              });
              setPreviewImage(res.dataUrl);
              setBase64Data(res.dataUrl);
              setForensicMetadata(res.metadata);
            } catch {
              const raw = canvas.toDataURL("image/jpeg", 0.88);
              setPreviewImage(raw);
              setBase64Data(raw);
            }
          } else {
            const raw = canvas.toDataURL("image/jpeg", 0.88);
            setPreviewImage(raw);
            setBase64Data(raw);
            setForensicMetadata(null);
          }

          stopCamera();
        };
      };
    } catch (err) {
      console.error("File upload error:", err);
    }
  };

  // Submit report to Gemini AI + Backend PostgreSQL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Silakan isi judul titik laporan sampah.");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const lat = geo.latitude || -7.9826;
      const lng = geo.longitude || 112.6308;

      // 1. Fetch live weather from Open-Meteo
      setProcessStep("Mengambil data cuaca & hidrologi Open-Meteo...");
      const weather = await getLiveWeather(lat, lng);

      // 2. Multimodal AI analysis with Gemini
      setProcessStep("Gemini 3.1 Multimodal menganalisis citra visual...");
      const aiResult: AnalisisAiResult = await analyzeWasteWithGemini({
        base64Image: base64Data || undefined,
        mimeType: "image/jpeg",
        title: title,
        description: description,
        alamatLokasi: title,
        latitude: lat,
        longitude: lng,
        weather: weather,
      });

      // 3. Persist to Backend API & PostgreSQL Database
      setProcessStep("Menyimpan laporan ke database & radar publik...");
      const newReport = await createLaporanApi({
        foto_url:
          previewImage ||
          "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
        latitude: lat,
        longitude: lng,
        alamat_lokasi: title,
        deskripsi: description || "Laporan timbunan sampah oleh warga melalui kamera live.",
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

      // Broadcast update to real-time map listener
      if (typeof BroadcastChannel !== "undefined") {
        try {
          const ch = new BroadcastChannel("uinic_armada_tracking");
          ch.postMessage({
            type: "NEW_REPORT_CREATED",
            report: newReport,
          });
          ch.close();
        } catch {}
      }

      setCreatedReport(newReport);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMessage(
        err?.message || "Terjadi kesalahan saat memproses laporan. Silakan coba lagi."
      );
    } finally {
      setIsProcessing(false);
      setProcessStep("");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col overflow-hidden select-none">
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* 1. TOP OVERLAY BAR (Back, Live GPS, Camera Flip, Watermark Indicator)     */}
      {/* ========================================================================= */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all border border-white/15 cursor-pointer"
          title="Kembali ke Beranda"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Live GPS Lock Indicator */}
        <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 border border-white/15 shadow-lg">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono">
            {geo.latitude
              ? `${geo.latitude.toFixed(4)}, ${geo.longitude?.toFixed(4)}`
              : "Mencari GPS..."}
          </span>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2">
          {/* Watermark Forensic Toggle */}
          <button
            type="button"
            onClick={() => setUseWatermark(!useWatermark)}
            className={cn(
              "h-10 px-3 rounded-full backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer",
              useWatermark
                ? "bg-[#0EB29A]/80 text-white border-[#0EB29A]/50"
                : "bg-black/40 text-slate-300 border-white/15"
            )}
            title="Sematkan stempel koordinat & integritas anti-fraud"
          >
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Anti-Fraud</span>
          </button>

          {/* Flip Camera Facing */}
          <button
            type="button"
            onClick={toggleCameraFacing}
            className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all border border-white/15 cursor-pointer"
            title="Balik Arah Kamera"
          >
            <FlipHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FULL-SCREEN CAMERA VIEWFINDER (Live Video or Snapped Photo Preview)    */}
      {/* ========================================================================= */}
      <div className="relative flex-1 w-full bg-slate-950 overflow-hidden flex items-center justify-center">
        {previewImage ? (
          /* Snapped / Uploaded Photo Preview */
          <div className="relative w-full h-full">
            <img
              src={previewImage}
              alt="Bukti Foto Sampah"
              className="w-full h-full object-cover"
            />
            {/* Forensic Badge Overlay */}
            {forensicMetadata && (
              <div className="absolute top-18 left-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/15 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0EB29A]" />
                <span>Geotag & SHA-256 Forensik Terkunci</span>
              </div>
            )}
          </div>
        ) : (
          /* Live WebCam Feed */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Camera Loading Spinner */}
            {isStartingCamera && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs text-white gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-[#0EB29A]" />
                <span className="text-xs font-semibold">Mengaktifkan Lensa Kamera...</span>
              </div>
            )}

            {/* Camera Error / Inactive Fallback */}
            {!isCameraActive && !isStartingCamera && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white p-6 text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center text-slate-300">
                  <Camera className="h-8 w-8" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h4 className="text-sm font-bold">Kamera Belum Aktif</h4>
                  <p className="text-xs text-slate-400">
                    {cameraError ||
                      "Izinkan browser mengakses kamera Anda untuk mengambil foto langsung."}
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <Button
                    type="button"
                    variant="glow"
                    onClick={() => startCamera(cameraFacing)}
                    className="w-full rounded-xl"
                  >
                    Nyalakan Kamera
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    <Upload className="h-4 w-4 mr-1.5" />
                    Pilih dari Galeri / Berkas
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* SHUTTER / SNAP CONTROLS (Floating Over the Bottom of Viewfinder)         */}
        {/* ======================================================================= */}
        <div className="absolute bottom-4 inset-x-0 z-20 flex items-center justify-center gap-8 pointer-events-auto">
          {!previewImage ? (
            <>
              {/* Pick from Gallery Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center text-white/90 hover:text-white cursor-pointer active:scale-95 transition-all"
                title="Pilih Foto dari Galeri"
              >
                <div className="h-12 w-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <span className="text-[10px] mt-1 font-semibold text-slate-200">Galeri</span>
              </button>

              {/* Big Circular Camera Shutter Button */}
              <button
                type="button"
                onClick={handleCapture}
                disabled={!isCameraActive}
                className={cn(
                  "h-20 w-20 rounded-full border-4 border-white bg-white/30 backdrop-blur-sm p-1.5 transition-transform active:scale-90 shadow-2xl cursor-pointer",
                  !isCameraActive && "opacity-40 pointer-events-none"
                )}
                title="Tekan untuk Ambil Foto Timbunan Sampah"
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-inner group">
                  <div className="h-7 w-7 rounded-full bg-[#0EB29A] flex items-center justify-center text-white">
                    <Camera className="h-4 w-4" />
                  </div>
                </div>
              </button>

              {/* Watermark Status Pill */}
              <button
                type="button"
                onClick={() => setUseWatermark(!useWatermark)}
                className="flex flex-col items-center text-white/90 hover:text-white cursor-pointer active:scale-95 transition-all"
                title="Toggle Watermark Forensik"
              >
                <div
                  className={cn(
                    "h-12 w-12 rounded-full backdrop-blur-md flex items-center justify-center border shadow-lg transition-colors",
                    useWatermark
                      ? "bg-[#0EB29A]/80 border-[#0EB29A]/50 text-white"
                      : "bg-black/50 border-white/20 text-slate-400"
                  )}
                >
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-[10px] mt-1 font-semibold text-slate-200">
                  {useWatermark ? "Watermark" : "Polos"}
                </span>
              </button>
            </>
          ) : (
            /* Photo Snapped: Retake Button */
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="px-5 py-2.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold border border-white/25 flex items-center gap-2 shadow-2xl hover:bg-black/90 active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 text-[#0EB29A]" />
                <span>Ambil Ulang Foto</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SCROLLABLE BOTTOM SHEET ("di bottom bisa discroll ada title, dll itu")  */}
      {/* ========================================================================= */}
      <div
        ref={bottomSheetRef}
        className={cn(
          "relative z-30 w-full max-w-2xl mx-auto bg-white rounded-t-[28px] shadow-[0_-12px_45px_rgba(0,0,0,0.5)] border-t border-slate-200/90 flex flex-col transition-all duration-300 ease-out",
          isSheetExpanded ? "max-h-[84vh]" : "max-h-[50vh] sm:max-h-[55vh]"
        )}
      >
        {/* Drag / Click Handle Bar to Expand / Collapse */}
        <div
          onClick={() => setIsSheetExpanded(!isSheetExpanded)}
          className="pt-2.5 pb-1 flex flex-col items-center justify-center flex-shrink-0 cursor-pointer group"
          title={isSheetExpanded ? "Kecilkan panel" : "Perluas panel"}
        >
          <div className="w-12 h-1.5 bg-slate-300 rounded-full group-hover:bg-slate-400 transition-colors" />
        </div>

        {/* Sheet Header */}
        <div
          onClick={() => setIsSheetExpanded(!isSheetExpanded)}
          className="px-5 py-2 flex items-center justify-between border-b border-slate-100 flex-shrink-0 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#0EB29A]/10 text-[#0EB29A] flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#2B3752]">Detail Titik Laporan</h3>
              <p className="text-[10px] text-slate-400">
                {isSheetExpanded ? "Klik bar untuk perkecil" : "Scroll / klik bar untuk melihat formulir"}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#0EB29A] bg-[#0EB29A]/10 px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0EB29A] animate-ping" />
            AI Gemini Active
          </span>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-5 pb-8 space-y-4 flex-1">
          {isSuccess && createdReport ? (
            /* Success Celebration Card */
            <div className="text-center py-4 space-y-3">
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-[#0EB29A] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <div>
                <h4 className="text-lg font-black text-[#2B3752]">Laporan Berhasil Terkirim! 🎉</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                  Foto dan data hidrologi Anda telah diproses oleh Gemini AI dan tersimpan di radar publik.
                </p>
              </div>

              {/* Point Award Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs">
                <span>🌟 Anda Memperoleh <strong>+50 Poin Warga</strong></span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  type="button"
                  variant="glow"
                  onClick={() => router.push(`/?id=${createdReport.id}`)}
                  className="rounded-xl"
                >
                  Lihat di Radar Peta
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsSuccess(false);
                    setCreatedReport(null);
                    setTitle("");
                    setDescription("");
                    setPreviewImage(null);
                    startCamera(cameraFacing);
                  }}
                  className="rounded-xl"
                >
                  Kirim Laporan Lain
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Title Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2B3752]">
                  Judul Titik Laporan <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Timbunan Sampah Plastik Jembatan Klojen"
                  required
                  className="h-11 rounded-xl border-slate-200 text-xs"
                />
              </div>

              {/* 2. Category Selection Pills */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2B3752]">
                  Kategori Utama Sampah
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {KATEGORI_OPTIONS.map((kat) => (
                    <button
                      key={kat.id}
                      type="button"
                      onClick={() => setKategoriId(kat.id)}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                        kategoriId === kat.id
                          ? "border-[#0EB29A] bg-[#0EB29A]/10 text-[#0EB29A] font-bold shadow-xs"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50"
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        <span>{kat.icon}</span>
                        <span className="truncate">{kat.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                        {kat.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Description Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2B3752]">
                  Deskripsi / Keterangan Kondisi
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan detail tumpukan (misal: bau menyengat, air sungai mulai meluap, ada kayu gelondongan)..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-[#2B3752] focus:ring-2 focus:ring-[#0EB29A] outline-none"
                />
              </div>

              {/* 4. GPS Coordinates & Open-Meteo Weather Box */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#0EB29A]/10 text-[#0EB29A] flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2B3752] block">
                      Koordinat GPS Terdeteksi
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {geo.latitude
                        ? `${geo.latitude.toFixed(5)}, ${geo.longitude?.toFixed(5)} (±${geo.accuracy || 12}m)`
                        : "Sedang mengunci sinyal satelit..."}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={geo.refresh}
                  className="text-[11px] font-bold text-[#0EB29A] hover:underline cursor-pointer"
                >
                  Segarkan
                </button>
              </div>

              {/* 5. Submit Button */}
              <Button
                type="submit"
                variant="glow"
                size="lg"
                disabled={isProcessing}
                className="w-full h-12 rounded-xl text-sm font-bold shadow-xl shadow-[#0EB29A]/30 cursor-pointer"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{processStep || "Menganalisis dengan Gemini AI..."}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Kirim Laporan & Analisis AI</span>
                  </div>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
