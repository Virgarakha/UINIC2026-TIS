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
  Truck,
  Gift,
  LogIn,
  Lock,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { CitizenReportTrackerModal } from "@/components/shared/citizen-report-tracker-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGeolocation } from "@/hooks/use-geolocation";
import { getLiveWeather, WeatherData } from "@/lib/weather";
import { analyzeWasteWithGemini, AnalisisAiResult, normalizeHazardType, normalizeKategoriId } from "@/lib/gemini";
import { createLaporanApi } from "@/lib/api-client";
import { burnForensicWatermark, MetadataForensik } from "@/lib/image-watermark";
import { saveStoredUserReport, recordPointTransaction, getStoredUser, isGuestUser } from "@/lib/auth-storage";
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
  const [isTrackerOpen, setIsTrackerOpen] = React.useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = React.useState(false);
  const touchStartYRef = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const diff = touchStartYRef.current - e.changedTouches[0].clientY;
    if (diff > 35) {
      // Swiped up -> expand
      setIsSheetExpanded(true);
    } else if (diff < -35) {
      // Swiped down -> collapse
      setIsSheetExpanded(false);
    }
    touchStartYRef.current = null;
  };

  // Pipeline submission state
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processStep, setProcessStep] = React.useState("");
  const [createdReport, setCreatedReport] = React.useState<LaporanSampah | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // AI Validation & Auto Categorization State
  const [aiValidation, setAiValidation] = React.useState<AnalisisAiResult | null>(null);
  const [isValidatingPhoto, setIsValidatingPhoto] = React.useState(false);
  const validationSeqRef = React.useRef(0);

  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const isGuest = isGuestUser(currentUser);

  // Automatic AI verification and categorization function
  const validatePhotoWithAi = React.useCallback(
    async (imageBase64: string, hintFileName?: string) => {
      const currentSeq = ++validationSeqRef.current;
      setIsValidatingPhoto(true);
      setErrorMessage(null);
      try {
        const lat = geo.latitude || -7.9826;
        const lng = geo.longitude || 112.6308;
        const weather = await getLiveWeather(lat, lng);
        const derivedTitle = title.trim() || (hintFileName ? hintFileName.replace(/\.[^/.]+$/, "") : "");
        const res = await analyzeWasteWithGemini({
          base64Image: imageBase64,
          mimeType: "image/jpeg",
          title: derivedTitle,
          description: description,
          alamatLokasi: "Lokasi Foto Laporan",
          latitude: lat,
          longitude: lng,
          weather: weather,
        });

        // Drop stale out-of-order response if another photo was captured/uploaded
        if (currentSeq !== validationSeqRef.current) {
          return null;
        }

        setAiValidation(res);
        setErrorMessage(null); // Clear form error banner so no contradictory messages appear

        if (res.is_valid_sampah) {
          if (res.kategori_id) {
            setKategoriId(String(res.kategori_id));
          }
          if (!title.trim() && res.jenis_sampah_dominan) {
            setTitle(`Timbunan ${res.jenis_sampah_dominan}`);
          }
        }
        return res;
      } catch (err) {
        if (currentSeq === validationSeqRef.current) {
          console.warn("AI validation error:", err);
        }
        return null;
      } finally {
        if (currentSeq === validationSeqRef.current) {
          setIsValidatingPhoto(false);
        }
      }
    },
    [geo.latitude, geo.longitude, title, description]
  );

  React.useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

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
    if (!videoRef.current || isValidatingPhoto) return;
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

    let capturedImg = "";
    if (useWatermark) {
      try {
        const { dataUrl, metadata } = await burnForensicWatermark(canvas, {
          latitude: lat,
          longitude: lng,
          accuracy: geo.accuracy || 10,
          alamat: alamatPerkiraan,
          captureMode: "live_camera",
        });
        capturedImg = dataUrl;
        setPreviewImage(dataUrl);
        setBase64Data(dataUrl);
        setForensicMetadata(metadata);
      } catch (e) {
        console.error("Watermark error:", e);
        const rawUrl = canvas.toDataURL("image/jpeg", 0.88);
        capturedImg = rawUrl;
        setPreviewImage(rawUrl);
        setBase64Data(rawUrl);
      }
    } else {
      const rawUrl = canvas.toDataURL("image/jpeg", 0.88);
      capturedImg = rawUrl;
      setPreviewImage(rawUrl);
      setBase64Data(rawUrl);
      setForensicMetadata(null);
    }

    setErrorMessage(null);
    setAiValidation(null);
    stopCamera();
    setIsSheetExpanded(true);
    if (capturedImg) {
      validatePhotoWithAi(capturedImg);
    }

    // Auto-scroll sheet slightly into focus so user can immediately type details
    setTimeout(() => {
      bottomSheetRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 200);
  };

  // Retake photo
  const handleRetake = () => {
    validationSeqRef.current++; // Invalidate any running validations
    setPreviewImage(null);
    setBase64Data(null);
    setForensicMetadata(null);
    setAiValidation(null);
    setErrorMessage(null);
    setIsSheetExpanded(false);
    startCamera(cameraFacing);
  };

  // Handle file picker upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    validationSeqRef.current++; // Invalidate any running validations
    setErrorMessage(null);
    setAiValidation(null);

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

          let uploadedImg = "";
          if (useWatermark) {
            try {
              const res = await burnForensicWatermark(canvas, {
                latitude: lat,
                longitude: lng,
                accuracy: geo.accuracy || 12,
                alamat: alamatPerkiraan,
                captureMode: "upload_file",
              });
              uploadedImg = res.dataUrl;
              setPreviewImage(res.dataUrl);
              setBase64Data(res.dataUrl);
              setForensicMetadata(res.metadata);
            } catch {
              const raw = canvas.toDataURL("image/jpeg", 0.88);
              uploadedImg = raw;
              setPreviewImage(raw);
              setBase64Data(raw);
            }
          } else {
            const raw = canvas.toDataURL("image/jpeg", 0.88);
            uploadedImg = raw;
            setPreviewImage(raw);
            setBase64Data(raw);
            setForensicMetadata(null);
          }

          stopCamera();
          setIsSheetExpanded(true);
          if (uploadedImg) {
            validatePhotoWithAi(uploadedImg, file.name);
          }
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

    if (!previewImage && !base64Data) {
      setErrorMessage("Silakan ambil atau pilih foto bukti sampah terlebih dahulu.");
      return;
    }

    // STRICT AI REJECTION: If photo is not real waste, do not allow saving!
    if (aiValidation && !aiValidation.is_valid_sampah) {
      setErrorMessage(
        aiValidation.alasan_validasi ||
          "Laporan tidak dapat disimpan! AI Inspector mendeteksi bahwa foto bukan timbunan sampah atau saluran air valid."
      );
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
      setProcessStep("Gemini 3.1 Multimodal menganalisis & memvalidasi foto...");
      const aiResult: AnalisisAiResult =
        aiValidation ||
        (await analyzeWasteWithGemini({
          base64Image: base64Data || undefined,
          mimeType: "image/jpeg",
          title: title,
          description: description,
          alamatLokasi: title,
          latitude: lat,
          longitude: lng,
          weather: weather,
        }));

      // Reject saving if AI determines the photo is NOT valid waste!
      if (!aiResult.is_valid_sampah) {
        setAiValidation(aiResult);
        setErrorMessage(
          aiResult.alasan_validasi ||
            "Laporan tidak dapat disimpan! AI Inspector mendeteksi bahwa foto bukan timbunan sampah atau saluran air yang valid."
        );
        setIsProcessing(false);
        return;
      }

      // 3. Persist to Backend API & PostgreSQL Database
      setProcessStep("Menyimpan laporan ke database & radar publik...");
      const effectiveUserId = isGuest ? 1 : (currentUser?.id || 1);
      const effectiveKategoriId = normalizeKategoriId(
        aiResult.kategori_id || parseInt(kategoriId, 10),
        aiResult.kategori_nama
      );

      const newReport = await createLaporanApi({
        user_id: effectiveUserId,
        foto_url:
          previewImage ||
          "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
        latitude: lat,
        longitude: lng,
        alamat_lokasi: title,
        deskripsi: description ? `${description} • [Kategori AI: ${aiResult.kategori_nama}]` : `[Kategori AI: ${aiResult.kategori_nama}] Laporan titik sampah terverifikasi oleh warga.`,
        kategori_id: effectiveKategoriId,
        is_resiko_banjir: aiResult.persentase_sumbatan_aliran > 50,
        tipe_bahaya: normalizeHazardType(aiResult.potensi_bahaya),
        metadata_forensik: forensicMetadata,
        analisis_ai: {
          is_valid_sampah: aiResult.is_valid_sampah,
          alasan_validasi: aiResult.alasan_validasi,
          kategori_id: effectiveKategoriId,
          kategori_nama: aiResult.kategori_nama,
          volume_sampah_m3: aiResult.volume_sampah_m3,
          persentase_sumbatan_aliran: aiResult.persentase_sumbatan_aliran,
          estimasi_berat_kg: aiResult.estimasi_berat_kg,
          potensi_bahaya: normalizeHazardType(aiResult.potensi_bahaya),
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

      saveStoredUserReport(newReport);
      setCreatedReport(newReport);

      // Award points to user and record in ledger (only for logged-in citizens)
      if (!isGuest) {
        recordPointTransaction(
          50,
          "lapor_sampah",
          `Reward Laporan AI: ${newReport.alamat_lokasi} (Validasi AI)`
        );
      }

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
    <div className="fixed inset-0 z-[60] bg-black overflow-hidden select-none">
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
      <div className="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center z-10">
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
        {/* SHUTTER / SNAP CONTROLS (Floating Over the Viewfinder)                  */}
        {/* ======================================================================= */}
        <div
          className={cn(
            "absolute bottom-22 sm:bottom-24 inset-x-0 z-20 flex items-center justify-center gap-8 pointer-events-auto transition-all duration-300",
            isSheetExpanded
              ? "opacity-0 pointer-events-none translate-y-6"
              : "opacity-100 pointer-events-auto translate-y-0"
          )}
        >
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
                disabled={!isCameraActive || isValidatingPhoto}
                className={cn(
                  "h-20 w-20 rounded-full border-4 border-white bg-white/30 backdrop-blur-sm p-1.5 transition-transform active:scale-90 shadow-2xl cursor-pointer",
                  (!isCameraActive || isValidatingPhoto) && "opacity-40 pointer-events-none"
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

      {/* Dim backdrop over full camera feed when sheet is expanded on desktop/mobile */}
      {isSheetExpanded && (
        <div
          onClick={() => setIsSheetExpanded(false)}
          className="absolute inset-0 z-25 bg-black/35 backdrop-blur-[1px] cursor-pointer transition-opacity animate-in fade-in duration-200"
          title="Klik area kamera untuk mengecilkan formulir"
        />
      )}

      {/* ========================================================================= */}
      {/* 3. SCROLLABLE BOTTOM SHEET ("di bottom bisa discroll ada title, dll itu")  */}
      {/* ========================================================================= */}
      <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-none flex flex-col items-center justify-end px-0 sm:px-4">
        <div
          ref={bottomSheetRef}
          className={cn(
            "pointer-events-auto w-full max-w-2xl bg-white rounded-t-[28px] shadow-[0_-12px_45px_rgba(0,0,0,0.5)] border-t border-slate-200/90 flex flex-col overflow-hidden transition-all duration-300 ease-out",
            isSheetExpanded ? "max-h-[84vh] sm:max-h-[80vh]" : "max-h-[72px]"
          )}
        >
          {/* Drag / Click Handle Bar to Expand / Collapse */}
          <div
            onClick={() => setIsSheetExpanded(!isSheetExpanded)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="pt-2.5 pb-1 flex flex-col items-center justify-center flex-shrink-0 cursor-pointer group select-none"
            title={isSheetExpanded ? "Kecilkan panel" : "Perluas panel"}
          >
            <div className="w-12 h-1.5 bg-slate-300 rounded-full group-hover:bg-slate-400 transition-colors" />
          </div>

          {/* Sheet Header */}
          <div
            onClick={() => setIsSheetExpanded(!isSheetExpanded)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="px-5 py-2 flex items-center justify-between border-b border-slate-100 flex-shrink-0 cursor-pointer select-none group"
          >
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#0EB29A]/10 text-[#0EB29A] flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-[#2B3752]">Detail Titik Laporan</h3>
                <p className="text-[10px] text-slate-400">
                  {isSheetExpanded ? "Klik / geser ke bawah untuk perkecil" : "Klik / geser ke atas untuk isi formulir"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {previewImage && isSheetExpanded && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRetake();
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer mr-1"
                  title="Foto Ulang"
                >
                  <RefreshCw className="h-3 w-3 text-[#0EB29A]" />
                  <span>Foto Ulang</span>
                </button>
              )}
              <span className="text-[10px] font-bold text-[#0EB29A] bg-[#0EB29A]/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0EB29A] animate-ping" />
                AI Gemini Active
              </span>
              <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-600 transition-colors">
                {isSheetExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5 text-[#0EB29A]" />
                )}
              </div>
            </div>
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

              {/* Point Award Badge & Citizen Report Summary */}
              <div className="flex flex-col gap-2 max-w-sm mx-auto">
                {!isGuest && (
                  <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs">
                    <span>
                      🌟 Anda Memperoleh{" "}
                      <strong className="text-amber-900 font-black">
                        +50 Poin Warga
                      </strong>
                    </span>
                  </div>
                )}
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                  <span>📋 Laporan Terbuka Warga Terverifikasi</span>
                </div>
              </div>

              {/* Action Buttons: Live Tracking & Radar Peta & Rewards */}
              <div className="pt-2 flex flex-col gap-2 max-w-sm mx-auto">
                <Button
                  type="button"
                  variant="glow"
                  onClick={() => setIsTrackerOpen(true)}
                  className="w-full rounded-xl text-xs font-black gap-2 h-11 cursor-pointer"
                >
                  <Truck className="h-4 w-4" />
                  <span>Lacak Status Penjemputan Realtime</span>
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/peta?id=${createdReport.id}`)}
                    className="flex-1 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Lihat di Radar Peta
                  </Button>
                  {isGuest ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/login")}
                      className="flex-1 rounded-xl text-xs font-bold text-[#0EB29A] hover:text-[#0EB29A] border-[#0EB29A]/30 hover:bg-[#0EB29A]/10 cursor-pointer gap-1"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Masuk Akun</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/rewards")}
                      className="flex-1 rounded-xl text-xs font-bold text-amber-700 hover:text-amber-800 border-amber-200 hover:bg-amber-50 cursor-pointer"
                    >
                      Tukar Hadiah (+Voucher)
                    </Button>
                  )}
                </div>
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
                  className="w-full rounded-xl text-xs font-bold cursor-pointer"
                >
                  Lapor Sampah Lainnya
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

              {/* 2. AI Automated Category & Waste Validation Card */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2B3752] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#0EB29A]" />
                    <span>Kategori & Validasi AI Vision</span>
                  </label>
                  {aiValidation && (
                    <span
                      className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1",
                        aiValidation.is_valid_sampah
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      )}
                    >
                      {aiValidation.is_valid_sampah ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Terverifikasi Sampah ({aiValidation.confidence_score}%)</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 text-rose-600" />
                          <span>Ditolak: Bukan Sampah</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* State A: Currently Validating with Spinner */}
                {isValidatingPhoto && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center gap-3 animate-pulse">
                    <Loader2 className="h-5 w-5 animate-spin text-[#0EB29A] flex-shrink-0" />
                    <div>
                      <p className="font-bold text-[#2B3752]">AI Gemini Sedang Memvalidasi Foto...</p>
                      <p className="text-[11px] text-slate-500">
                        Memeriksa keaslian objek sampah & mengklasifikasi kategori secara otomatis.
                      </p>
                    </div>
                  </div>
                )}

                {/* State B: Validated Real Waste */}
                {!isValidatingPhoto && aiValidation && aiValidation.is_valid_sampah && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border border-emerald-200 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {aiValidation.kategori_id === 1
                            ? "🌊"
                            : aiValidation.kategori_id === 2
                            ? "🛑"
                            : aiValidation.kategori_id === 3
                            ? "🚰"
                            : "🏛️"}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[#2B3752]">
                              {aiValidation.kategori_nama}
                            </span>
                            <span className="text-[9px] font-bold bg-[#0EB29A] text-white px-1.5 py-0.2 rounded-full">
                              Auto AI
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-emerald-800">
                            Dominan: {aiValidation.jenis_sampah_dominan}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] text-slate-400 block font-semibold">Estimasi Vol</span>
                        <span className="text-xs font-black text-[#2B3752]">
                          {aiValidation.volume_sampah_m3} m³ (~{aiValidation.estimasi_berat_kg} kg)
                        </span>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/80 border border-emerald-100 text-[10.5px] text-slate-600 leading-relaxed flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{aiValidation.alasan_validasi}</span>
                    </div>
                  </div>
                )}

                {/* State C: Rejected - NOT Waste */}
                {!isValidatingPhoto && aiValidation && !aiValidation.is_valid_sampah && (
                  <div className="p-3.5 rounded-2xl bg-rose-50/90 border-2 border-rose-300 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="h-7 w-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-rose-900">
                          Foto Ditolak oleh AI Inspector
                        </h4>
                        <p className="text-[11px] text-rose-700 leading-snug">
                          {aiValidation.alasan_validasi}
                        </p>
                        <p className="text-[10px] text-rose-600/90 font-medium pt-0.5">
                          ⚠️ Laporan <strong>tidak dapat disimpan</strong> karena objek bukan timbunan sampah atau saluran air bermasalah.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRetake}
                      className="w-full h-8 text-[11px] font-bold border-rose-300 text-rose-700 hover:bg-rose-100 rounded-lg cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1 text-rose-600" />
                      <span>Ambil Ulang Foto Sampah Valid</span>
                    </Button>
                  </div>
                )}

                {/* State D: No photo yet (before capture) */}
                {!isValidatingPhoto && !aiValidation && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-[#0EB29A] flex-shrink-0" />
                    <span>
                      <strong>Kategori Otomatis oleh AI</strong>: Ambil atau pilih foto bukti sampah, AI Gemini akan memvalidasi keaslian objek dan mengkategorikannya secara instan.
                    </span>
                  </div>
                )}
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
                variant={aiValidation && !aiValidation.is_valid_sampah ? "outline" : "glow"}
                size="lg"
                disabled={
                  isProcessing ||
                  isValidatingPhoto ||
                  (aiValidation ? !aiValidation.is_valid_sampah : false)
                }
                className={cn(
                  "w-full h-12 rounded-xl text-sm font-bold shadow-xl transition-all",
                  aiValidation && !aiValidation.is_valid_sampah
                    ? "bg-rose-50 border-rose-300 text-rose-600 cursor-not-allowed opacity-90"
                    : "shadow-[#0EB29A]/30 cursor-pointer"
                )}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{processStep || "Menganalisis dengan Gemini AI..."}</span>
                  </div>
                ) : isValidatingPhoto ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#0EB29A]" />
                    <span>AI Memvalidasi Objek Foto...</span>
                  </div>
                ) : aiValidation && !aiValidation.is_valid_sampah ? (
                  <div className="flex items-center gap-2 text-rose-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Laporan Ditolak (Bukan Objek Sampah)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Kirim Laporan Sampah Terverifikasi</span>
                  </div>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
      </div>

      {/* Citizen Live Delivery Tracker Modal */}
      <CitizenReportTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        report={createdReport}
        user={currentUser}
        onViewOnMap={(rep) => router.push(`/peta?id=${rep.id}`)}
      />
    </div>
  );
}
