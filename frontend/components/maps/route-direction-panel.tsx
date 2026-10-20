"use client";

import * as React from "react";
import {
  X,
  Car,
  Bike,
  Footprints,
  Navigation,
  Flag,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  ArrowUpRight,
  ArrowUpLeft,
  MapPin,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Truck,
  CheckCircle,
  Play,
  Camera,
  Volume2,
  VolumeX,
  Radio,
  Crosshair,
} from "lucide-react";
import { RouteDirectionData } from "@/lib/routing";
import { LaporanSampah, User } from "@/types";
import { getDistanceMeters, cn } from "@/lib/utils";
import { startPenjemputanApi, updateTruckLocationApi } from "@/lib/api-client";
import { voiceNavigator } from "@/lib/voice-navigation";

export interface RouteDirectionPanelProps {
  report: LaporanSampah;
  routeData: RouteDirectionData | null;
  isLoading: boolean;
  travelMode: "driving" | "motorcycle" | "walking";
  onTravelModeChange: (mode: "driving" | "motorcycle" | "walking") => void;
  onClose: () => void;
  onBackToDetail: () => void;
  originLabel?: string;
  isRailVisible?: boolean;
  user?: User | null;
  currentLat?: number | null;
  currentLng?: number | null;
  onOpenVerificationModal?: (report: LaporanSampah) => void;
  missionStatus?: "idle" | "otw" | "tahap_pengambilan" | "selesai";
  onMissionStatusChange?: (newStatus: "idle" | "otw" | "tahap_pengambilan" | "selesai") => void;
  isSimulatingDrive?: boolean;
  onToggleSimulateDrive?: () => void;
  onJumpNearTarget?: () => void;
  navigationMode?: "gps" | "simulation";
  onNavigationModeChange?: (mode: "gps" | "simulation") => void;
  gpsAccuracy?: number | null;
  gpsSpeedKmh?: number;
  gpsError?: string | null;
  autoCenterGps?: boolean;
  onToggleAutoCenterGps?: () => void;
  onRecenterTruck?: () => void;
  isMapPannedAway?: boolean;
}

export function RouteDirectionPanel({
  report,
  routeData,
  isLoading,
  travelMode,
  onTravelModeChange,
  onClose,
  onBackToDetail,
  originLabel = "Lokasi Anda (GPS)",
  isRailVisible = false,
  user,
  currentLat,
  currentLng,
  onOpenVerificationModal,
  missionStatus = "idle",
  onMissionStatusChange,
  isSimulatingDrive = false,
  onToggleSimulateDrive,
  onJumpNearTarget,
  navigationMode = "gps",
  onNavigationModeChange,
  gpsAccuracy,
  gpsSpeedKmh = 0,
  gpsError,
  autoCenterGps = true,
  onToggleAutoCenterGps,
  onRecenterTruck,
  isMapPannedAway = false,
}: RouteDirectionPanelProps) {
  const [showAllSteps, setShowAllSteps] = React.useState(true);
  const [internalStatus, setInternalStatus] = React.useState<"idle" | "otw" | "tahap_pengambilan" | "selesai">(missionStatus);
  const [isSimulatedNear, setIsSimulatedNear] = React.useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = React.useState(voiceNavigator.isMuted);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = React.useState(false);
  const [mobileNavState, setMobileNavState] = React.useState<"compact" | "expanded">("compact");
  const touchStartYRef = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartYRef.current = null;

    if (deltaY < -35) {
      // Swiped UP -> expand
      setMobileNavState("expanded");
    } else if (deltaY > 45) {
      // Swiped DOWN -> if expanded, collapse to compact; if compact, close
      if (mobileNavState === "expanded") {
        setMobileNavState("compact");
      } else {
        onClose();
      }
    }
  };

  React.useEffect(() => {
    setIsVoiceMuted(voiceNavigator.isMuted);
    const unsubscribe = voiceNavigator.subscribe((speaking) => {
      setIsVoiceSpeaking(speaking);
    });
    return unsubscribe;
  }, []);

  const activeStatus = missionStatus || internalStatus;
  const isMotor = travelMode === "motorcycle";
  const vehicleLabel = isMotor ? "Motor" : "Truk";
  const VehicleIcon = isMotor ? Bike : Truck;

  const updateStatus = (st: "idle" | "otw" | "tahap_pengambilan" | "selesai") => {
    setInternalStatus(st);
    onMissionStatusChange?.(st);
  };

  // Calculate live distance from user GPS to target report
  const actualDistance =
    currentLat && currentLng
      ? Math.round(getDistanceMeters(currentLat, currentLng, report.latitude, report.longitude))
      : 380;
  const displayDistance = isSimulatedNear ? 45 : actualDistance;
  const isWithin100Meters = displayDistance <= 100;

  // Auto announce arrival when entering 100 meter radius
  React.useEffect(() => {
    if (activeStatus === "otw" && isWithin100Meters && !voiceNavigator.isMuted) {
      voiceNavigator.announceArrival();
    }
  }, [activeStatus, isWithin100Meters]);

  const handleStartTask = async () => {
    updateStatus("otw");
    const initLat = currentLat || (routeData?.coordinates?.[0]?.[0] ?? report.latitude);
    const initLng = currentLng || (routeData?.coordinates?.[0]?.[1] ?? report.longitude);
    const initHeading = routeData?.coordinates && routeData.coordinates.length >= 2
      ? 0
      : 0;

    // Trigger voice navigation greeting
    if (!voiceNavigator.isMuted) {
      voiceNavigator.announceDeparture(
        report.alamat_lokasi,
        routeData?.formattedDistance || "1.2 km",
        routeData?.formattedDuration || "5 menit"
      );
    }

    try {
      if (user) {
        await startPenjemputanApi({
          laporanId: report.id,
          pengepulId: user.id,
          catatan: "Pengepul memulai perjalanan (OTW) menuju titik sampah.",
        });
      }
      await updateTruckLocationApi({
        laporanId: report.id,
        pengepulId: user?.id || 30,
        latitude: initLat,
        longitude: initLng,
        heading: initHeading,
        kecepatanKmh: 35,
        statusJemput: "menuju_lokasi",
      });

      if (typeof BroadcastChannel !== "undefined") {
        try {
          const ch = new BroadcastChannel("uinic_armada_tracking");
          ch.postMessage({
            type: "TRUCK_LOCATION_UPDATE",
            data: {
              laporan_id: report.id,
              pengepul_id: user?.id || 30,
              pengepul_nama: user?.name || "Pak Joko (Mitra Pengepul)",
              latitude: initLat,
              longitude: initLng,
              heading: initHeading,
              kecepatan_kmh: 35,
              status_jemput: "menuju_lokasi",
            },
          });
          ch.close();
        } catch { }
      }
    } catch (e) {
      console.warn("Start task notice:", e);
    }
  };

  const getStepIcon = (type: string, modifier?: string) => {
    if (type === "arrive") return <Flag className="h-4 w-4 text-red-500" />;
    if (type === "depart") return <Navigation className="h-4 w-4 text-[#0EB29A]" />;
    if (modifier?.includes("right")) return <CornerUpRight className="h-4 w-4 text-[#2E6E65]" />;
    if (modifier?.includes("left")) return <CornerUpLeft className="h-4 w-4 text-[#2E6E65]" />;
    return <ArrowUp className="h-4 w-4 text-slate-500" />;
  };

  // Dynamic active maneuver step matching driver's real or simulated progress along route
  const activeStep = React.useMemo(() => {
    if (!routeData?.steps || routeData.steps.length === 0) return null;
    if (activeStatus === "idle") return routeData.steps[0];
    if (activeStatus === "tahap_pengambilan" || activeStatus === "selesai") {
      return routeData.steps[routeData.steps.length - 1];
    }

    // Calculate nearest coordinate on the route to determine current step
    if (currentLat && currentLng && routeData.coordinates && routeData.coordinates.length > 1) {
      const coords = routeData.coordinates;
      let minIdx = 0;
      let minDistance = Infinity;
      for (let i = 0; i < coords.length; i++) {
        const d = getDistanceMeters(currentLat, currentLng, coords[i][0], coords[i][1]);
        if (d < minDistance) {
          minDistance = d;
          minIdx = i;
        }
      }
      const fraction = minIdx / (coords.length - 1);
      const stepIdx = Math.min(
        Math.floor(fraction * routeData.steps.length),
        routeData.steps.length - 1
      );
      return routeData.steps[stepIdx];
    }

    return routeData.steps[0];
  }, [routeData, activeStatus, currentLat, currentLng]);

  const activeInstruction =
    activeStep?.instruction || routeData?.steps?.[0]?.instruction || report.alamat_lokasi;

  // Helper to render white turn-by-turn maneuver arrow icon for the mobile HUD
  const getManeuverArrow = (step?: any, fallbackText?: string) => {
    const type = (step?.type || "").toLowerCase();
    const modifier = (step?.modifier || "").toLowerCase();
    const text = (step?.instruction || fallbackText || "").toLowerCase();

    // 1. Arrive at destination
    if (type === "arrive" || text.includes("tiba") || text.includes("sampai")) {
      return <Flag className="h-6 w-6 text-white stroke-[2.8]" />;
    }

    // 2. U-Turn
    if (modifier.includes("uturn") || text.includes("putar balik")) {
      return <RotateCcw className="h-6 w-6 text-white stroke-[2.8]" />;
    }

    // 3. Sharp or Slight Left (serong kiri)
    if (modifier === "slight left" || text.includes("serong kiri")) {
      return <ArrowUpLeft className="h-6 w-6 text-white stroke-[3]" />;
    }

    // 4. Sharp or Slight Right (serong kanan)
    if (modifier === "slight right" || text.includes("serong kanan")) {
      return <ArrowUpRight className="h-6 w-6 text-white stroke-[3]" />;
    }

    // 5. Left turn (belok kiri / arah kiri)
    if (modifier.includes("left") || text.includes("kiri")) {
      return <CornerUpLeft className="h-6 w-6 text-white stroke-[3]" />;
    }

    // 6. Right turn (belok kanan / arah kanan)
    if (modifier.includes("right") || text.includes("kanan")) {
      return <CornerUpRight className="h-6 w-6 text-white stroke-[3]" />;
    }

    // 7. Straight / Terus / Lanjut (lurus)
    return <ArrowUp className="h-6 w-6 text-white stroke-[3]" />;
  };

  return (
    <>
      {/* Mobile Top Floating Maneuver HUD Banner (Google Maps Turn-by-Turn Style) */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-40 pointer-events-auto animate-in slide-in-from-top duration-300">
        <div className="bg-[#014e44] text-white p-3 px-4 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-white truncate leading-snug">
                {activeInstruction}
              </h4>
              <span className="text-[10px] text-white/90 font-medium">
                {routeData?.formattedDistance || "1.2 km"} • {displayDistance}m tersisa
              </span>
            </div>
          </div>
          {/* White Maneuver Arrow on the Right Side (Turn Left / Right / Straight) */}
          <div
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-white/10"
            title={activeStep?.modifier || activeInstruction}
          >
            {getManeuverArrow(activeStep, activeInstruction)}
          </div>
        </div>
      </div>

      {/* Main Drawer Container: Fixed Bottom Sheet on Mobile, Left Sidebar on Desktop */}
      <div
        className={`fixed sm:absolute bottom-0 sm:bottom-auto sm:top-0 z-40 w-full sm:w-[420px] bg-white rounded-t-[28px] sm:rounded-none shadow-[0_-8px_30px_rgba(0,0,0,0.18)] sm:shadow-2xl border-t sm:border-t-0 sm:border-r border-slate-200/90 flex flex-col transition-all duration-300 ease-out overflow-hidden pb-safe ${isRailVisible ? "left-0 sm:left-[68px]" : "left-0"
          } ${mobileNavState === "compact"
            ? (activeStatus === "idle" ? "h-[145px] sm:h-full" : "h-[110px] sm:h-full")
            : "h-[82vh] sm:h-full"
          }`}
      >
        {/* Mobile Top Drag Handle */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setMobileNavState((prev) => (prev === "compact" ? "expanded" : "compact"))}
          className="pt-2 pb-1 flex flex-col items-center justify-center sm:hidden cursor-grab active:cursor-grabbing touch-none select-none bg-white flex-shrink-0"
          title="Geser ke atas untuk detail lengkap atau ke bawah untuk menutup"
        >
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Mobile Compact Driving Bar (Rendered on mobile when collapsed) */}
        {mobileNavState === "compact" && (
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="sm:hidden px-4 pb-2 pt-0.5 flex items-center justify-between gap-3 flex-shrink-0"
          >
            {/* Left Controls: Close Button & Quick Recenter Button */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={onClose}
                className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                title="Tutup Navigasi"
              >
                <X className="h-4 w-4" />
              </button>
              {onRecenterTruck && (
                <button
                  type="button"
                  onClick={onRecenterTruck}
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer",
                    isMapPannedAway
                      ? "bg-[#0EB29A] text-white animate-pulse shadow-md shadow-[#0EB29A]/40"
                      : "bg-slate-100 text-[#0EB29A] hover:bg-slate-200"
                  )}
                  title={isMotor ? "Pusatkan Kamera ke Posisi Motor" : "Pusatkan Kamera ke Posisi Truk"}
                >
                  <Crosshair className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Center ETA & Speed (Tap to expand) */}
            <div
              onClick={() => setMobileNavState("expanded")}
              className="flex-1 min-w-0 text-center cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-base font-black text-emerald-600">
                  {routeData?.formattedDuration || "5 mnt"}
                </span>
                <span className="text-xs">🍃</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {`${gpsSpeedKmh || 0} km/j`}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium truncate">
                {displayDistance}m • {routeData?.formattedDistance || "1.2 km"}
              </div>
            </div>

            {/* Right Action Button */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {activeStatus === "idle" && (
                <button
                  onClick={handleStartTask}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white text-xs font-black shadow-md shadow-[#0EB29A]/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="h-3 w-3 fill-white" />
                  <span>Mulai</span>
                </button>
              )}

              {activeStatus === "otw" && (
                isWithin100Meters ? (
                  <button
                    onClick={() => {
                      updateStatus("tahap_pengambilan");
                      updateTruckLocationApi({
                        laporanId: report.id,
                        pengepulId: user?.id || 30,
                        latitude: report.latitude,
                        longitude: report.longitude,
                        heading: 0,
                        kecepatanKmh: 0,
                        statusJemput: "tahap_pengambilan",
                      });
                    }}
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-[#0EB29A] text-white text-xs font-black shadow-md shadow-emerald-500/30 animate-pulse flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Ambil</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setMobileNavState("expanded")}
                    className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2B3752] text-xs font-bold border border-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Detail</span>
                    <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                )
              )}

              {activeStatus === "tahap_pengambilan" && (
                <button
                  onClick={() => onOpenVerificationModal?.(report)}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white text-xs font-black shadow-md shadow-[#0EB29A]/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Foto</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Expanded Collapse Bar (Only shown on mobile when expanded) */}
        {mobileNavState === "expanded" && (
          <div className="sm:hidden px-4 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <span className="text-[11px] font-bold text-slate-500">Panel Navigasi Lengkap</span>
            <button
              onClick={() => setMobileNavState("compact")}
              className="text-[11px] font-bold text-[#0EB29A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ciutkan ke Peta</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Top Header: Title & Close Button */}
        <div className={`p-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0 ${mobileNavState === "compact" ? "hidden sm:flex" : "flex"}`}>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[#0EB29A]/15 text-[#0EB29A] flex items-center justify-center font-bold">
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#2B3752]">Petunjuk Arah Rute</h3>
              <p className="text-[11px] text-slate-500">Navigasi Terintegrasi Google Maps Style</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Voice Guidance Toggle & Audio Wave Indicator */}
            <button
              type="button"
              onClick={() => {
                const muted = voiceNavigator.toggleMute();
                setIsVoiceMuted(muted);
                if (!muted) {
                  voiceNavigator.testVoice();
                }
              }}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${!isVoiceMuted
                  ? "bg-[#0EB29A]/15 border-[#0EB29A]/40 text-[#0EB29A] shadow-xs"
                  : "bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600"
                }`}
              title={!isVoiceMuted ? "Suara Navigasi Aktif (Klik untuk Bisukan)" : "Suara Navigasi Bisu (Klik untuk Aktifkan)"}
            >
              {!isVoiceMuted ? (
                <div className="flex items-center gap-1">
                  <Volume2 className="h-4 w-4" />
                  {isVoiceSpeaking ? (
                    <span className="flex items-center gap-0.5 px-0.5">
                      <span className="w-1 h-3 bg-[#0EB29A] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1 h-2 bg-[#0EB29A] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1 h-3.5 bg-[#0EB29A] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold hidden sm:inline">Suara</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <VolumeX className="h-4 w-4" />
                  <span className="text-[10px] font-bold hidden sm:inline">Bisu</span>
                </div>
              )}
            </button>

            <button
              onClick={onBackToDetail}
              className="text-[11px] font-bold text-[#0EB29A] hover:bg-[#0EB29A]/10 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Detail
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#2B3752] transition-colors cursor-pointer"
              title="Tutup Petunjuk Rute"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Travel Mode Selector: Mobil / Motor / Jalan Kaki */}
        <div className={`p-3 bg-slate-50 border-b border-slate-100 flex-shrink-0 ${mobileNavState === "compact" ? "hidden sm:block" : "block"}`}>
          <div className="grid grid-cols-3 gap-2 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs">
            <button
              onClick={() => onTravelModeChange("driving")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${travelMode === "driving"
                  ? "bg-[#0EB29A] text-white shadow-md shadow-[#0EB29A]/20"
                  : "text-slate-600 hover:text-[#2B3752] hover:bg-slate-50"
                }`}
            >
              <Car className="h-4 w-4" />
              <span>Mobil</span>
            </button>

            <button
              onClick={() => onTravelModeChange("motorcycle")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${travelMode === "motorcycle"
                  ? "bg-[#0EB29A] text-white shadow-md shadow-[#0EB29A]/20"
                  : "text-slate-600 hover:text-[#2B3752] hover:bg-slate-50"
                }`}
            >
              <Bike className="h-4 w-4" />
              <span>Motor</span>
            </button>

            <button
              onClick={() => onTravelModeChange("walking")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${travelMode === "walking"
                  ? "bg-[#0EB29A] text-white shadow-md shadow-[#0EB29A]/20"
                  : "text-slate-600 hover:text-[#2B3752] hover:bg-slate-50"
                }`}
            >
              <Footprints className="h-4 w-4" />
              <span>Jalan Kaki</span>
            </button>
          </div>

          {/* Origin & Destination Waypoints Display */}
          <div className="mt-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 relative">
            {/* Connector Line */}
            <div className="absolute left-[23px] top-[28px] bottom-[28px] w-0.5 bg-slate-200 border-dashed" />

            {/* Origin */}
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center z-10 flex-shrink-0">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Titik Keberangkatan</span>
                <p className="text-xs font-bold text-[#2B3752] truncate">{originLabel}</p>
              </div>
            </div>

            {/* Destination */}
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-5 rounded-full bg-red-500/20 text-red-600 flex items-center justify-center z-10 flex-shrink-0">
                <MapPin className="h-3 w-3 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Tujuan Titik Sampah</span>
                <p className="text-xs font-bold text-[#2B3752] truncate">{report.alamat_lokasi}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area: ETA, Summary, and Step-by-Step Directions */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${mobileNavState === "compact" ? "hidden sm:block" : "block"}`}>
          {/* Pengepul Mission Control Center (Only when logged in as role 'pengepul') */}
          {user?.role === "pengepul" && (
            <div className="p-4 rounded-2xl bg-white border-2 border-[#0EB29A] shadow-md shadow-[#0EB29A]/10 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {user.avatar_url || user.foto_profil ? (
                    <img
                      src={user.avatar_url || user.foto_profil || ""}
                      alt={user.name}
                      className="h-7 w-7 rounded-xl object-cover border border-[#0EB29A] shadow-xs"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-[#0EB29A] to-[#2E6E65] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <VehicleIcon className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-black text-[#2B3752]">Misi Pengambilan Sampah</h4>
                    <p className="text-[10px] text-slate-500">Mitra: {user.name}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${activeStatus === "idle"
                      ? "bg-slate-100 text-slate-600 border-slate-200"
                      : activeStatus === "otw"
                        ? "bg-amber-100 text-amber-800 border-amber-300 animate-pulse"
                        : activeStatus === "tahap_pengambilan"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-blue-100 text-blue-800 border-blue-300"
                    }`}
                >
                  {activeStatus === "idle" && "Belum Dimulai"}
                  {activeStatus === "otw" && "🚗 OTW ke Lokasi"}
                  {activeStatus === "tahap_pengambilan" && "🧹 Tahap Pengambilan"}
                  {activeStatus === "selesai" && "✓ Selesai"}
                </span>
              </div>

              {/* State 1: IDLE */}
              {activeStatus === "idle" && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Klaim titik timbunan ini untuk memulai rute perjalanan, pengangkutan sampah, dan pencairan reward poin reputasi.
                  </p>
                  <button
                    onClick={handleStartTask}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white text-xs font-black shadow-md shadow-[#0EB29A]/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>Mulai Penugasan Sekarang</span>
                  </button>
                </div>
              )}

              {/* State 2: OTW (Pelacakan Truk Realtime) */}
              {activeStatus === "otw" && (
                <div className="space-y-3">
                  {/* Realtime Truck Tracking HUD Card */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#2B3752] to-[#1e273b] text-white shadow-xl border border-slate-700 space-y-2.5">
                    {/* Top Bar: Driver Info & Mode Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-[#0EB29A] flex items-center justify-center text-white shadow-md shadow-[#0EB29A]/40">
                          <VehicleIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-300 font-bold uppercase block tracking-wider">
                            {isMotor ? "Armada Sepeda Motor Pengepul" : "Armada Truk Pengepul"}
                          </span>
                          <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>GPS HP Siaga</span>
                          </h5>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0EB29A]/20 text-emerald-300 border border-[#0EB29A]/50">
                        {`${gpsSpeedKmh || 0} km/j`}
                      </span>
                    </div>

                    {/* GPS NYATA HP METRICS */}
                    <div className="space-y-2 pt-1 border-t border-white/10">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[9.5px] text-slate-400 block font-medium">Sisa Jarak</span>
                          <strong className="text-sm font-black text-white">{displayDistance}m</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[9.5px] text-slate-400 block font-medium">Kecepatan HP</span>
                          <strong className="text-sm font-black text-[#0EB29A]">{gpsSpeedKmh || 0} km/j</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[9.5px] text-slate-400 block font-medium">Akurasi Satelit</span>
                          <strong className="text-sm font-black text-emerald-300">±{gpsAccuracy || 5}m</strong>
                        </div>
                      </div>

                      {/* Tombol Kontrol Simulasi Pergerakan Otomatis (Fitur 3: bg-white) */}
                      {onToggleSimulateDrive && (
                        <button
                          type="button"
                          onClick={onToggleSimulateDrive}
                          className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-[#2B3752] text-xs font-black shadow-md border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                        >
                          <Play
                            className={`h-3.5 w-3.5 ${
                              isSimulatingDrive
                                ? "text-amber-500 fill-amber-500 animate-pulse"
                                : "text-[#0EB29A] fill-[#0EB29A]"
                            }`}
                          />
                          <span>
                            {isSimulatingDrive
                              ? `⏸️ Jeda Simulasi Gerak ${vehicleLabel} Otomatis`
                              : `▶️ Jalankan Simulasi Gerak ${vehicleLabel} Otomatis`}
                          </span>
                        </button>
                      )}

                      {/* Auto Center Toggle & Quick Test */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (onRecenterTruck) {
                              onRecenterTruck();
                            } else {
                              onToggleAutoCenterGps?.();
                            }
                          }}
                          className={`flex-1 py-1.5 px-2.5 rounded-xl text-[10.5px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${autoCenterGps && !isMapPannedAway
                              ? "bg-[#0EB29A]/20 border-[#0EB29A] text-emerald-300"
                              : "bg-white/5 border-white/15 text-slate-300 hover:text-white"
                            }`}
                        >
                          <Crosshair className={`h-3.5 w-3.5 ${autoCenterGps && !isMapPannedAway ? "text-[#0EB29A]" : ""}`} />
                          <span>{autoCenterGps && !isMapPannedAway ? (isMotor ? "🎯 Ikuti Posisi Motor (Aktif)" : "🎯 Ikuti Posisi Truk (Aktif)") : (isMotor ? "🎯 Pusatkan ke Motor" : "🎯 Pusatkan ke Truk")}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsSimulatedNear(true);
                            onJumpNearTarget?.();
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold border border-white/15 cursor-pointer whitespace-nowrap"
                          title="Uji coba tiba dalam radius 45m"
                        >
                          ⚡ Tes Tiba (45m)
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-300 italic leading-snug">
                        📡 Bawa HP Anda berjalan atau berkendara menuju titik. {vehicleLabel} di peta seluruh pengguna bergerak mengikuti GPS HP Anda secara realtime.
                      </p>

                      {gpsError && (
                        <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-[10px] font-medium">
                          ⚠️ {gpsError}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isWithin100Meters ? (
                    <div className="space-y-1.5">
                      <button
                        disabled
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-200 text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                      >
                        <span>🔒 Tahap Pengambilan (Terkunci: Jarak {displayDistance}m &gt; 100m)</span>
                      </button>
                      <p className="text-[10px] text-slate-500 italic leading-snug">
                        Ikon {vehicleLabel.toLowerCase()} hijau bergerak di peta menyusuri jalan. Tombol akan terbuka otomatis saat jarak {vehicleLabel.toLowerCase()} ≤ 100 meter dari lokasi sampah.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-bold flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>{vehicleLabel} telah tiba di lokasi (radius ≤ 100m)! Siap memulai tahap pembersihan.</span>
                      </div>
                      <button
                        onClick={() => {
                          updateStatus("tahap_pengambilan");
                          updateTruckLocationApi({
                            laporanId: report.id,
                            pengepulId: user?.id || 30,
                            latitude: report.latitude,
                            longitude: report.longitude,
                            heading: 0,
                            kecepatanKmh: 0,
                            statusJemput: "tahap_pengambilan",
                          });
                          if (typeof BroadcastChannel !== "undefined") {
                            try {
                              const ch = new BroadcastChannel("uinic_armada_tracking");
                              ch.postMessage({
                                type: "TRUCK_LOCATION_UPDATE",
                                data: {
                                  laporan_id: report.id,
                                  pengepul_id: user?.id || 30,
                                  pengepul_nama: user?.name || "Pak Joko (Mitra Pengepul)",
                                  latitude: report.latitude,
                                  longitude: report.longitude,
                                  heading: 0,
                                  kecepatan_kmh: 0,
                                  status_jemput: "tahap_pengambilan",
                                },
                              });
                              ch.close();
                            } catch { }
                          }
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-[#0EB29A] text-white text-xs font-black shadow-md shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Mulai Tahap Pengambilan</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* State 3: TAHAP PENGAMBILAN */}
              {activeStatus === "tahap_pengambilan" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-snug">
                    <span className="font-bold block mb-1">🧹 Sedang Dalam Proses Pembersihan</span>
                    Pilah sampah plastik/organik dan angkut ke armada. Setelah lokasi bersih, klik tombol di bawah untuk verifikasi foto dan klaim reward.
                  </div>

                  <button
                    onClick={() => onOpenVerificationModal?.(report)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white text-xs font-black shadow-md shadow-[#0EB29A]/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Selesai Mengambil & Input Foto Bersih</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="h-8 w-8 rounded-full border-3 border-[#0EB29A] border-t-transparent animate-spin" />
              <p className="text-xs font-semibold">Menghitung rute navigasi terbaik...</p>
            </div>
          ) : routeData ? (
            <>
              {/* ETA & Distance Highlight Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0EB29A]/10 via-[#2E6E65]/5 to-slate-50 border border-[#0EB29A]/30">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#0EB29A]">
                    {routeData.formattedDuration}
                  </span>
                  <span className="text-sm font-bold text-[#2B3752]">
                    ({routeData.formattedDistance})
                  </span>
                </div>

                <p className="text-xs font-bold text-[#2E6E65] mt-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                  <span>{routeData.summaryStreet}</span>
                </p>

                <div className="mt-3 pt-3 border-t border-[#0EB29A]/15 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#0EB29A]" />
                    <span>Kondisi lalu lintas lancar</span>
                  </span>
                  <span className="font-semibold text-[#2E6E65]">Rute Tercepat</span>
                </div>
              </div>

              {/* Quick Warning / AI Insight Banner */}
              {report.is_resiko_banjir && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs">
                  <ShieldAlert className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-red-700 block">Peringatan Jalur Rawan</span>
                    <p className="text-[11px] text-red-600 mt-0.5">
                      Titik tujuan dilaporkan mengalami sumbatan air. Waspadai genangan jika terjadi hujan.
                    </p>
                  </div>
                </div>
              )}

              {/* Step-by-Step Directions Accordion */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#2B3752]">
                    Langkah Demi Langkah ({routeData.steps.length} manuver)
                  </span>
                  <button
                    onClick={() => setShowAllSteps(!showAllSteps)}
                    className="text-[11px] font-bold text-[#0EB29A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showAllSteps ? "Ciutkan" : "Lihat Semua"}</span>
                    {showAllSteps ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>

                {showAllSteps && (
                  <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 shadow-xs overflow-hidden">
                    {routeData.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {getStepIcon(step.type, step.modifier)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#2B3752] leading-snug">
                            {step.instruction}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                            <span>{step.distanceMeters < 1000 ? `${step.distanceMeters} m` : `${(step.distanceMeters / 1000).toFixed(1)} km`}</span>
                            {step.name && step.name !== "jalan utama" && (
                              <>
                                <span>•</span>
                                <span className="text-slate-500 truncate">{step.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Tidak ada data rute yang tersedia.
            </div>
          )}
        </div>

        {/* Bottom Floating Bar in Panel: Close / Reset Button */}
        <div className={`p-3 border-t border-slate-100 bg-white flex items-center gap-2 flex-shrink-0 ${mobileNavState === "compact" ? "hidden sm:flex" : "flex"}`}>
          <button
            onClick={onBackToDetail}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2B3752] text-xs font-bold transition-colors cursor-pointer"
          >
            Lihat Detail Lokasi
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#0EB29A] hover:bg-[#0ca18b] text-white text-xs font-bold shadow-md shadow-[#0EB29A]/20 transition-all cursor-pointer"
          >
            Selesai / Tutup Rute
          </button>
        </div>
      </div>
    </>
  );
}
