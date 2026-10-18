"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Compass,
  Layers,
  Locate,
  ZoomIn,
  ZoomOut,
  ShieldAlert,
  Coins,
  ExternalLink,
  X,
  BookOpen,
  Gift,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Flame,
  Check,
  AlertTriangle,
  Radio,
  BellRing,
  Truck,
} from "lucide-react";
import type { Map as LeafletMap, Marker as LeafletMarker, Layer as LeafletLayer } from "leaflet";
import { SearchFloatingBar } from "./search-floating-bar";
import { PlaceDetailDrawer } from "./place-detail-drawer";
import { CreateReportModal } from "./create-report-modal";
import { RouteDirectionPanel } from "./route-direction-panel";
import { MiniRailSidebar } from "./mini-rail-sidebar";
import { RailDrawerPanel } from "./rail-drawer-panel";
import { LoginModal } from "./login-modal";
import { PengepulVerificationModal } from "./pengepul-verification-modal";
import { EditProfileModal } from "./edit-profile-modal";
import { CitizenReportTrackerModal } from "@/components/shared/citizen-report-tracker-modal";
import { MobileNav } from "@/components/layouts/mobile-nav";
import { User, LaporanSampah, PeringatanDini } from "@/types";
import {
  fetchLaporanListApi,
  fetchPeringatanDiniApi,
  logoutApi,
  MOCK_LAPORAN_SAMPAH,
  MOCK_PERINGATAN_DINI,
  ActiveArmadaTruck,
  fetchActiveArmadaApi,
  fetchDispatchedReportIdsApi,
  updateTruckLocationApi,
  cancelPenjemputanApi,
  updatePengepulOnlineStatusApi,
} from "@/lib/api-client";
import {
  getStoredUser,
  getStoredToken,
  setStoredSession,
  clearStoredSession,
  getBookmarkedIds,
  toggleBookmarkedId,
  getDispatchedReportIds,
} from "@/lib/auth-storage";
import { getLiveWeather, WeatherData } from "@/lib/weather";
import { getDistanceMeters, cn } from "@/lib/utils";
import { getDirections, RouteDirectionData, calculateBearing } from "@/lib/routing";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useGpsTracker, GpsPosition } from "@/hooks/use-gps-tracker";
import { voiceNavigator } from "@/lib/voice-navigation";
import { createHeatLayer } from "@/lib/heatmap";
import { siteConfig } from "@/config/site";
import "leaflet/dist/leaflet.css";

/**
 * Shortest rotational path angle unwrapping
 */
function normalizeRotation(prevAngle: number, targetHeading: number): number {
  const targetAngle = -targetHeading;
  let diff = (targetAngle - prevAngle) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return prevAngle + diff;
}

/**
 * Cardinal direction label in Indonesian (Utara, Barat, Timur, Selatan)
 */
function getCardinalDirection(deg: number): { label: string; code: string } {
  const normalized = ((deg % 360) + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return { label: "Utara", code: "U" };
  if (normalized >= 22.5 && normalized < 67.5) return { label: "Timur Laut", code: "TL" };
  if (normalized >= 67.5 && normalized < 112.5) return { label: "Timur", code: "T" };
  if (normalized >= 112.5 && normalized < 157.5) return { label: "Tenggara", code: "TG" };
  if (normalized >= 157.5 && normalized < 202.5) return { label: "Selatan", code: "S" };
  if (normalized >= 202.5 && normalized < 247.5) return { label: "Barat Daya", code: "BD" };
  if (normalized >= 247.5 && normalized < 292.5) return { label: "Barat", code: "B" };
  return { label: "Barat Laut", code: "BL" };
}

/**
 * Creates dynamic Leaflet DivIcon for the waste collection truck.
 * Scales proportionally with map zoom to match real road lane widths.
 */
function createTruckDivIcon(
  L: any,
  truck: {
    driverName: string;
    status: string;
    heading: number;
  },
  zoom: number,
  isHeadingUp: boolean = false
) {
  // Proportional vehicle scaling matching road width, slightly larger when zoomed out
  let width: number;
  if (zoom >= 18) width = 22;
  else if (zoom === 17) width = 18;
  else if (zoom === 16) width = 14;
  else if (zoom === 15) width = 12;
  else if (zoom === 14) width = 10;
  else if (zoom === 13) width = 9;
  else if (zoom === 12) width = 8;
  else width = 7;

  const height = Math.round(width * 2.3);
  const isPickingUp = truck.status === "tahap_pengambilan";
  const isStandby = truck.status === "siaga_online" || truck.status === "online";
  const statusText = isPickingUp ? "Tahap Pengambilan" : isStandby ? "Siaga (Online)" : "OTW ke Lokasi";
  const badgeBg = isPickingUp ? "bg-emerald-600" : isStandby ? "bg-teal-600" : "bg-[#0EB29A]";
  const heading = truck.heading ?? 0;
  const badgeCounterRotate = isHeadingUp ? `rotate(${heading}deg)` : "rotate(0deg)";

  // Floating status badge scaling
  let badgeHtml = "";
  if (zoom >= 15) {
    const scale = zoom >= 17 ? 0.95 : zoom === 16 ? 0.85 : 0.75;
    badgeHtml = `
      <div class="mb-0.5 px-2 py-0.5 rounded-full bg-[#2B3752]/95 border border-[#0EB29A] text-white text-[10px] font-black shadow-xl flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md pointer-events-none origin-bottom transition-transform duration-300" style="transform: scale(${scale}) ${badgeCounterRotate};">
        <span class="h-1.5 w-1.5 rounded-full ${isPickingUp ? "bg-emerald-400" : "bg-[#0EB29A]"} animate-ping"></span>
        <span class="tracking-tight text-white">${truck.driverName}</span>
        <span class="text-[8.5px] px-1.5 py-0.2 rounded-full ${badgeBg} text-white font-bold uppercase tracking-wider">${statusText}</span>
      </div>
    `;
  } else if (zoom >= 12) {
    badgeHtml = `
      <div class="mb-0.5 px-1.5 py-0.2 rounded-full bg-[#2B3752]/95 border border-[#0EB29A] text-white text-[8.5px] font-black shadow-md flex items-center gap-1 whitespace-nowrap pointer-events-none origin-bottom transition-transform duration-300" style="transform: scale(0.7) ${badgeCounterRotate};">
        <span class="h-1.5 w-1.5 rounded-full ${isPickingUp ? "bg-emerald-400" : "bg-[#0EB29A]"}"></span>
        <span class="tracking-tight text-white">${truck.driverName.split(" ")[0] || "Pengepul"}</span>
      </div>
    `;
  }

  const truckHtml = `
    <div class="collector-truck-container relative flex flex-col items-center cursor-pointer select-none" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);">
      ${badgeHtml}
      <div class="truck-body-rotator relative flex items-center justify-center transition-transform duration-300 ease-out" style="transform: rotate(${heading}deg); transform-origin: center center; width: ${width}px; height: ${height}px;">
        ${zoom >= 15 ? `
          <div class="absolute -top-2.5 left-1/2 -translate-x-1/2 w-6 h-4 bg-gradient-to-t from-emerald-400/35 via-yellow-200/15 to-transparent rounded-t-full pointer-events-none animate-pulse"></div>
          <div class="absolute -top-0.5 left-0.5 h-1 w-1 rounded-full bg-yellow-300/80 blur-[0.5px]"></div>
          <div class="absolute -top-0.5 right-0.5 h-1 w-1 rounded-full bg-yellow-300/80 blur-[0.5px]"></div>
        ` : ""}
        <div class="absolute inset-x-0.5 inset-y-0.5 bg-black/40 rounded-sm blur-[1px] -z-10 translate-y-0.5"></div>
        <img src="/images/truck-collector.png" alt="Armada Truk Pengepul" class="w-full h-full object-contain filter drop-shadow-sm select-none pointer-events-none" />
      </div>
    </div>
  `;

  return L.divIcon({
    className: "custom-truck-marker-icon",
    html: truckHtml,
    iconSize: [160, 130],
    iconAnchor: [80, 65],
  });
}

/**
 * Creates the HTML content for the Leaflet popup bubble anchored directly above the collector truck.
 * Follows the style from image 2 with a downward pointing tip, profile photo, driver name, rating,
 * and contact action buttons.
 */
function createTruckPopupHtml(truck: {
  driverName: string;
  status: string;
  avatarUrl?: string;
  rating?: number;
  platNomor?: string;
  jenisKendaraan?: string;
  telepon?: string;
  alamat?: string;
}) {
  const driverName = truck.driverName || "Pak Joko (Mitra Pengepul)";
  const rating = truck.rating || 4.9;
  const platNomor = truck.platNomor || "N 8472 AB";
  const jenisKendaraan = truck.jenisKendaraan || "Truk Bak Hidrolik Mini DLH";
  const telepon = truck.telepon || "0812-3456-7890";
  const avatarUrl =
    truck.avatarUrl ||
    "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&auto=format&fit=crop&q=80";

  const isPickingUp = truck.status === "tahap_pengambilan";
  const isStandby = truck.status === "siaga_online" || truck.status === "online";
  const statusLabel = isPickingUp
    ? "Tahap Pengambilan di Lokasi"
    : isStandby
    ? "Siap Menjemput Sampah (Online • Siaga)"
    : "Sedang Menuju Lokasi (OTW)";
  const statusBg = isPickingUp
    ? "#ecfdf5"
    : isStandby
    ? "rgba(13, 148, 136, 0.12)"
    : "rgba(14, 178, 154, 0.1)";
  const statusColor = isPickingUp ? "#047857" : isStandby ? "#0d9488" : "#0EB29A";
  const statusBorder = isPickingUp
    ? "#a7f3d0"
    : isStandby
    ? "rgba(13, 148, 136, 0.3)"
    : "rgba(14, 178, 154, 0.25)";
  const cleanPhone = telepon.replace(/[^0-9]/g, "");

  return `
    <div class="truck-popup-card" style="width: 270px; font-family: system-ui, -apple-system, sans-serif; background: #ffffff; text-align: left;">
      <!-- Top Banner with Gradient -->
      <div style="background: linear-gradient(135deg, #0EB29A 0%, #2E6E65 50%, #2B3752 100%); padding: 12px 14px 26px 14px; position: relative; color: #ffffff;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding-right: 22px;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.95;">
            🚚 Profil Mitra Pengepul
          </span>
          <span style="background: rgba(255,255,255,0.22); padding: 2px 7px; border-radius: 999px; font-size: 9px; font-weight: 700; white-space: nowrap;">
            ✓ Terverifikasi
          </span>
        </div>
      </div>

      <!-- Card Content Body -->
      <div style="padding: 0 14px 14px 14px; margin-top: -20px; position: relative; background: #ffffff;">
        <!-- Avatar and Vehicle Plate -->
        <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 8px;">
          <div style="position: relative;">
            <img src="${avatarUrl}" alt="${driverName}" style="width: 48px; height: 48px; border-radius: 12px; object-fit: cover; border: 3px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15); display: block;" />
            <span style="position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; border-radius: 50%; background: #10b981; border: 2px solid #ffffff;"></span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 9.5px; color: #64748b; font-weight: 600;">Mitra Resmi DLH</span>
            <div style="font-size: 10.5px; color: #0EB29A; font-weight: 800;">${platNomor}</div>
          </div>
        </div>

        <!-- Name and Role -->
        <h4 style="font-size: 14px; font-weight: 800; color: #2B3752; margin: 0 0 2px 0; line-height: 1.25;">
          ${driverName}
        </h4>
        <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.2;">
          ${jenisKendaraan}
        </p>

        <!-- Rating Section -->
        <div style="display: flex; align-items: center; gap: 6px; background: #fffbeb; border: 1px solid #fef3c7; padding: 4px 8px; border-radius: 8px; margin-bottom: 8px;">
          <span style="color: #f59e0b; font-size: 12px; letter-spacing: -1px;">⭐⭐⭐⭐⭐</span>
          <span style="font-size: 12px; font-weight: 800; color: #2B3752;">${rating.toFixed(1)}</span>
          <span style="font-size: 10px; color: #92400e; margin-left: auto; font-weight: 600;">(64+ Ulasan)</span>
        </div>

        <!-- Mission Status Banner -->
        <div style="padding: 6px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; margin-bottom: 10px; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusBorder};">
          <div style="display: flex; align-items: center; gap: 5px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0;"></span>
            <span>${statusLabel}</span>
          </div>
          ${
            truck.alamat
              ? `<div style="font-size: 10px; font-weight: 500; opacity: 0.85; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">📍 ${truck.alamat}</div>`
              : ""
          }
        </div>

        <!-- Action Buttons: Telepon & WhatsApp -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          <a href="tel:${telepon}" style="display: flex; align-items: center; justify-content: center; gap: 4px; padding: 7px 10px; border-radius: 8px; background: #0EB29A; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; text-align: center; box-shadow: 0 2px 4px rgba(14, 178, 154, 0.2);">
            📞 Telepon
          </a>
          <a href="https://wa.me/${cleanPhone}" target="_blank" rel="noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 4px; padding: 7px 10px; border-radius: 8px; background: #2E6E65; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; text-align: center; box-shadow: 0 2px 4px rgba(46, 110, 101, 0.2);">
            💬 WhatsApp
          </a>
        </div>
      </div>
    </div>
  `;
}

export interface GoogleMapsViewProps {
  showMobileNav?: boolean;
}

export function GoogleMapsView({ showMobileNav = true }: GoogleMapsViewProps = {}) {
  const geo = useGeolocation();
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = React.useRef<LeafletMap | null>(null);
  const markersRef = React.useRef<Record<number, LeafletMarker>>({});
  const [mapZoom, setMapZoom] = React.useState<number>(14);
  const routeLayersRef = React.useRef<{
    polylineBorder?: any;
    polylineInner?: any;
    originMarker?: any;
  }>({});
  const collectorTruckMarkerRef = React.useRef<any>(null);
  const armadaMarkersRef = React.useRef<Map<string, any>>(new Map());
  const leafletLibRef = React.useRef<any>(null);
  const [activeArmadaList, setActiveArmadaList] = React.useState<ActiveArmadaTruck[]>([]);

  const [reports, setReports] = React.useState<LaporanSampah[]>(MOCK_LAPORAN_SAMPAH);
  const [selectedReport, setSelectedReport] = React.useState<LaporanSampah | null>(null);
  const [isMapReady, setIsMapReady] = React.useState(false);
  const [currentWeather, setCurrentWeather] = React.useState<WeatherData | null>(null);

  // Role Mode State (Warga vs Driver Pengepul)
  const [roleViewMode, setRoleViewMode] = React.useState<"warga" | "pengepul">("warga");
  const [trackingReport, setTrackingReport] = React.useState<LaporanSampah | null>(null);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = React.useState<boolean>(false);
  const [dispatchedReportIds, setDispatchedReportIds] = React.useState<number[]>([]);

  // Realtime Collector Truck State
  const [collectorLocation, setCollectorLocation] = React.useState<{
    lat: number;
    lng: number;
    heading: number;
  } | null>(null);
  const [isSimulatingDrive, setIsSimulatingDrive] = React.useState<boolean>(false);
  const [simulationIndex, setSimulationIndex] = React.useState<number>(0);
  const [navigationMode, setNavigationMode] = React.useState<"gps" | "simulation">("gps");
  const [autoCenterGps, setAutoCenterGps] = React.useState<boolean>(true);
  const [isMapPannedAway, setIsMapPannedAway] = React.useState<boolean>(false);
  const [isHeadingUpEnabled, setIsHeadingUpEnabled] = React.useState<boolean>(true);
  const [deviceCompassHeading, setDeviceCompassHeading] = React.useState<number | null>(null);
  const [mapRotation, setMapRotation] = React.useState<number>(0);
  const autoCenterGpsRef = React.useRef<boolean>(true);
  const lastGpsBroadcastRef = React.useRef<number>(0);
  const lastArmadaFingerprintRef = React.useRef<string>("");
  const lastBackendLocationUpdateRef = React.useRef<number>(0);

  React.useEffect(() => {
    autoCenterGpsRef.current = autoCenterGps;
  }, [autoCenterGps]);

  // Hardware compass sensor (deviceorientation) for mobile gyroscope orientation
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if ((e as any).webkitCompassHeading !== undefined && (e as any).webkitCompassHeading !== null) {
        setDeviceCompassHeading(Math.round((e as any).webkitCompassHeading));
      } else if (e.alpha !== null && e.alpha !== undefined) {
        const comp = (360 - e.alpha) % 360;
        setDeviceCompassHeading(Math.round(comp));
      }
    };

    const win = window as any;
    if ("ondeviceorientationabsolute" in win) {
      window.addEventListener("deviceorientationabsolute", handleOrientation as any);
    }
    if ("ondeviceorientation" in win) {
      window.addEventListener("deviceorientation", handleOrientation as any);
    }

    win.__setVehicleHeading = (h: number) => {
      setCollectorLocation((prev) => (prev ? { ...prev, heading: h } : { lat: geo.latitude || -7.9826, lng: geo.longitude || 112.6308, heading: h }));
      setDeviceCompassHeading(h);
    };

    return () => {
      window.removeEventListener("deviceorientationabsolute", handleOrientation as any);
      window.removeEventListener("deviceorientation", handleOrientation as any);
      delete win.__setVehicleHeading;
    };
  }, [geo.latitude, geo.longitude]);

  // User Authentication & Mini-Rail state
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = React.useState(false);
  const [activeRailPanel, setActiveRailPanel] = React.useState<"saved" | "recent" | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = React.useState<number[]>([]);

  // Pengepul Mission & Verification State
  const [pengepulMissionStatus, setPengepulMissionStatus] = React.useState<
    "idle" | "otw" | "tahap_pengambilan" | "selesai"
  >("idle");
  const [isVerificationModalOpen, setIsVerificationModalOpen] = React.useState(false);
  const [verificationTargetReport, setVerificationTargetReport] = React.useState<LaporanSampah | null>(null);
  const [celebrationBanner, setCelebrationBanner] = React.useState<{
    title: string;
    points: number;
    score: number;
  } | null>(null);

  // Pengepul Driver Online / Offline Status (Truk hanya muncul ketika status Online)
  const [isPengepulOnline, setIsPengepulOnline] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("uinic_pengepul_online");
      if (stored !== null) {
        setIsPengepulOnline(stored === "true");
      }
    }
  }, []);

  // Armada & Driver Idle Tracking (> 10 minutes without movement/activity)
  const ARMADA_IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes (600,000 ms)
  const [lastMovementTimestamp, setLastMovementTimestamp] = React.useState<number>(0);
  const [isDriverIdle, setIsDriverIdle] = React.useState<boolean>(false);
  const prevMovementPosRef = React.useRef<{ lat: number; lng: number } | null>(null);

  // Initialize movement timestamp on client mount (prevents Next.js prerender unstable Date.now warning)
  React.useEffect(() => {
    setLastMovementTimestamp(Date.now());
  }, []);

  // In-App Directions (Route) state
  const [activeRouteReport, setActiveRouteReport] = React.useState<LaporanSampah | null>(null);
  const [routeData, setRouteData] = React.useState<RouteDirectionData | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = React.useState(false);
  const [travelMode, setTravelMode] = React.useState<"driving" | "motorcycle" | "walking">("driving");

  // Determine effective vehicle heading and cardinal direction (Utara, Barat, Timur, Selatan)
  const truckHeading = collectorLocation?.heading ?? 0;
  const effectiveHeading = truckHeading !== 0 ? truckHeading : (deviceCompassHeading ?? 0);
  const isHeadingUpMode =
    Boolean(activeRouteReport) &&
    pengepulMissionStatus === "otw" &&
    autoCenterGps &&
    !isMapPannedAway &&
    isHeadingUpEnabled &&
    !isDriverIdle;
  const cardinal = getCardinalDirection(effectiveHeading);

  // Smooth angle unwrapping transition for map rotation
  React.useEffect(() => {
    if (isHeadingUpMode) {
      setMapRotation((prev) => normalizeRotation(prev, effectiveHeading));
    } else {
      setMapRotation((prev) => normalizeRotation(prev, 0));
    }
  }, [isHeadingUpMode, effectiveHeading]);

  // Recenter map camera on collector truck towards destination & restore Heading-Up alignment
  const handleRecenterOnTruck = React.useCallback(() => {
    setAutoCenterGps(true);
    setIsMapPannedAway(false);
    setIsHeadingUpEnabled(true);
    setLastMovementTimestamp(Date.now());
    setIsDriverIdle(false);

    const targetLat =
      collectorLocation?.lat ??
      geo.latitude ??
      routeData?.coordinates?.[0]?.[0] ??
      -7.9826;
    const targetLng =
      collectorLocation?.lng ??
      geo.longitude ??
      routeData?.coordinates?.[0]?.[1] ??
      112.6308;

    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      const targetZoom = Math.max(currentZoom, 16);
      mapInstanceRef.current.flyTo([targetLat, targetLng], targetZoom, {
        duration: 0.8,
        easeLinearity: 0.25,
      });
    }
  }, [collectorLocation, geo.latitude, geo.longitude, routeData]);

  // Toggle Pengepul Online / Offline Status (Truk armada tampil di peta saat Online, hilang saat Offline)
  const handleTogglePengepulOnline = React.useCallback(
    (targetState?: boolean) => {
      const nextState = targetState !== undefined ? targetState : !isPengepulOnline;
      setIsPengepulOnline(nextState);
      if (typeof window !== "undefined") {
        localStorage.setItem("uinic_pengepul_online", nextState ? "true" : "false");
      }

      if (nextState) {
        setLastMovementTimestamp(Date.now());
        setIsDriverIdle(false);
        if (!collectorLocation) {
          const lat = geo.latitude || -7.9826;
          const lng = geo.longitude || 112.6308;
          setCollectorLocation({
            lat,
            lng,
            heading: 0,
          });
        }
      }

      // Persist status and location to backend database so other users see this truck on their maps
      const curLat = collectorLocation?.lat || geo.latitude || -7.9826;
      const curLng = collectorLocation?.lng || geo.longitude || 112.6308;
      updatePengepulOnlineStatusApi({
        pengepulId: user?.id,
        isOnline: nextState,
        latitude: curLat,
        longitude: curLng,
        heading: effectiveHeading || 0,
        kecepatanKmh: 0,
      }).catch((err) => console.warn("Error updating pengepul online status in DB:", err));

      // Broadcast update across tabs and clients
      if (typeof BroadcastChannel !== "undefined") {
        try {
          const ch = new BroadcastChannel("uinic_armada_tracking");
          const truckLaporanId = activeRouteReport?.id || (user?.id ? user.id * 1000 : 9999);

          if (nextState) {
            ch.postMessage({
              type: "TRUCK_LOCATION_UPDATE",
              data: {
                id: user?.id ? user.id * 100 : 999,
                laporan_id: truckLaporanId,
                pengepul_id: user?.id || 30,
                pengepul_nama: user?.name || "Pak Joko (Mitra Pengepul)",
                pengepul_foto: user?.avatar_url || user?.foto_profil,
                status_jemput: activeRouteReport ? pengepulMissionStatus : "siaga_online",
                latitude: curLat,
                longitude: curLng,
                heading: effectiveHeading || 0,
                kecepatan_kmh: 0,
                waktu_update_lokasi: new Date().toISOString(),
              },
            });
          } else {
            ch.postMessage({
              type: "TRUCK_MISSION_FINISHED",
              laporan_id: truckLaporanId,
              pengepul_id: user?.id || 30,
            });
          }
          ch.close();
        } catch {}
      }
    },
    [isPengepulOnline, collectorLocation, geo, activeRouteReport, user, pengepulMissionStatus, effectiveHeading]
  );

  // High-Precision Real-time GPS Tracker for mobile driving navigation
  const handleGpsLocationUpdate = React.useCallback(
    (pos: GpsPosition) => {
      if (navigationMode !== "gps") return;

      // Check if driver has physically moved (> 5 meters or speed > 1 km/h)
      const prevPos = prevMovementPosRef.current;
      const movedDistance = prevPos
        ? getDistanceMeters(prevPos.lat, prevPos.lng, pos.lat, pos.lng)
        : 100;

      if (pos.speedKmh > 1 || movedDistance >= 5) {
        prevMovementPosRef.current = { lat: pos.lat, lng: pos.lng };
        setLastMovementTimestamp(Date.now());
        setIsDriverIdle(false);
      }

      setCollectorLocation({
        lat: pos.lat,
        lng: pos.lng,
        heading: pos.heading,
      });

      if (autoCenterGpsRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.panTo([pos.lat, pos.lng], {
          animate: true,
          duration: 0.5,
        });
      }

      // If active mission is OTW and driver is NOT idle, broadcast to backend and observers (throttled to 1.5s)
      if (pengepulMissionStatus === "otw" && activeRouteReport && !isDriverIdle) {
        const now = Date.now();
        if (now - lastGpsBroadcastRef.current >= 1500) {
          lastGpsBroadcastRef.current = now;

          updateTruckLocationApi({
            laporanId: activeRouteReport.id,
            pengepulId: user?.id || 30,
            latitude: pos.lat,
            longitude: pos.lng,
            heading: pos.heading,
            kecepatanKmh: pos.speedKmh,
            statusJemput: "menuju_lokasi",
          }).catch((err) => console.warn("GPS broadcast error:", err));

          if (typeof BroadcastChannel !== "undefined") {
            try {
              const ch = new BroadcastChannel("uinic_armada_tracking");
              ch.postMessage({
                type: "TRUCK_LOCATION_UPDATE",
                data: {
                  laporan_id: activeRouteReport.id,
                  pengepul_id: user?.id || 30,
                  pengepul_nama: user?.name || "Pak Joko (Mitra Pengepul)",
                  latitude: pos.lat,
                  longitude: pos.lng,
                  heading: pos.heading,
                  kecepatan_kmh: pos.speedKmh,
                  status_jemput: "menuju_lokasi",
                },
              });
              ch.close();
            } catch {}
          }
        }
      } else if (user?.role === "pengepul" && isPengepulOnline && !isDriverIdle) {
        // Also periodically sync standby coordinates to DB so other users see live movement
        const now = Date.now();
        if (now - lastGpsBroadcastRef.current >= 3000) {
          lastGpsBroadcastRef.current = now;
          updatePengepulOnlineStatusApi({
            pengepulId: user?.id,
            isOnline: true,
            latitude: pos.lat,
            longitude: pos.lng,
            heading: pos.heading,
            kecepatanKmh: pos.speedKmh,
          }).catch(() => {});
        }
      }
    },
    [navigationMode, pengepulMissionStatus, activeRouteReport, user, isPengepulOnline, isDriverIdle]
  );

  const gpsTracker = useGpsTracker({
    enabled: Boolean(activeRouteReport) && navigationMode === "gps",
    highAccuracy: true,
    minDistanceMeters: 1,
    onLocationUpdate: handleGpsLocationUpdate,
  });

  // Periodic check: If driver or armada has been idle for > 10 minutes, hide truck icon
  React.useEffect(() => {
    const checkInterval = setInterval(() => {
      const isMissionActive =
        pengepulMissionStatus === "otw" || pengepulMissionStatus === "tahap_pengambilan";

      if (isMissionActive && lastMovementTimestamp > 0) {
        const idleDuration = Date.now() - lastMovementTimestamp;
        if (idleDuration >= ARMADA_IDLE_TIMEOUT_MS) {
          if (!isDriverIdle) {
            setIsDriverIdle(true);
          }
        } else {
          if (isDriverIdle) {
            setIsDriverIdle(false);
          }
        }
      } else {
        if (isDriverIdle) {
          setIsDriverIdle(false);
        }
      }

      // Also filter out any stale armada in activeArmadaList
      setActiveArmadaList((prev) => {
        const now = Date.now();
        const filtered = prev.filter((t) => {
          const updateStr = t.waktu_update_lokasi || (t as any).updated_at;
          if (!updateStr) return true;
          const time = new Date(updateStr).getTime();
          return isNaN(time) || now - time < ARMADA_IDLE_TIMEOUT_MS;
        });
        if (filtered.length !== prev.length) {
          return filtered;
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [pengepulMissionStatus, lastMovementTimestamp, isDriverIdle, ARMADA_IDLE_TIMEOUT_MS]);

  // Testing helper for automated verification of idle state
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__setDriverIdleForTesting = (isIdle: boolean) => {
        setIsDriverIdle(isIdle);
        setLastMovementTimestamp(isIdle ? Date.now() - 11 * 60 * 1000 : Date.now());
      };
    }
  }, []);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("all");

  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = React.useState(false);
  const [mapLayer, setMapLayer] = React.useState<"streets" | "satellite">("streets");
  const [showHeatmap, setShowHeatmap] = React.useState<boolean>(false);
  const [showHazardZones, setShowHazardZones] = React.useState<boolean>(true);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = React.useState<boolean>(false);
  const [warnings, setWarnings] = React.useState<PeringatanDini[]>(MOCK_PERINGATAN_DINI);
  const heatmapLayerRef = React.useRef<any>(null);
  const hazardLayersRef = React.useRef<any[]>([]);

  // Load stored user session and bookmarks on mount
  React.useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    if (stored?.role === "pengepul") {
      setRoleViewMode("pengepul");
    }
    setBookmarkedIds(getBookmarkedIds());
    setDispatchedReportIds(getDispatchedReportIds());
  }, []);

  // Fetch reports from database on initial load
  React.useEffect(() => {
    let isMounted = true;
    fetchLaporanListApi().then((data) => {
      if (isMounted && data && data.length > 0) {
        setReports(data);
        const serverDispatched = data
          .filter((r) => r.is_dispatched || r.status?.kode === "siap_diambil_pengepul")
          .map((r) => r.id);
        if (serverDispatched.length > 0) {
          setDispatchedReportIds((prev) => [...new Set([...prev, ...serverDispatched])]);
        }
      }
    });

    // Also fetch cross-device dispatched pickup report IDs
    fetchDispatchedReportIdsApi().then((ids) => {
      if (isMounted && ids && ids.length > 0) {
        setDispatchedReportIds((prev) => [...new Set([...prev, ...ids])]);
      }
    });

    // Also fetch active early warning disaster broadcasts
    fetchPeringatanDiniApi().then((warns) => {
      if (isMounted && warns && warns.length > 0) {
        setWarnings(warns);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle URL query ?id=X to automatically focus & open report drawer
  React.useEffect(() => {
    if (typeof window === "undefined" || !reports || reports.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    if (idParam) {
      const rep = reports.find((r) => r.id === parseInt(idParam, 10));
      if (rep) {
        setSelectedReport(rep);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([rep.latitude, rep.longitude], 16, { duration: 1.0 });
        }
      }
    }
  }, [reports]);

  // Load weather for selected report
  React.useEffect(() => {
    if (!selectedReport) return;
    let isMounted = true;
    getLiveWeather(selectedReport.latitude, selectedReport.longitude).then((data) => {
      if (isMounted) setCurrentWeather(data);
    });
    return () => {
      isMounted = false;
    };
  }, [selectedReport]);

  // Filter reports
  const filteredReports = React.useMemo(() => {
    return reports.filter((rep) => {
      const matchQuery =
        !searchQuery ||
        rep.alamat_lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchQuery) return false;

      if (activeCategory === "all") return true;
      if (activeCategory === "banjir")
        return (rep.tipe_bahaya || "").toLowerCase().includes("banjir") || rep.is_resiko_banjir;
      if (activeCategory === "wabah")
        return (
          (rep.tipe_bahaya || "").toLowerCase().includes("wabah") ||
          (rep.tipe_bahaya || "").toLowerCase().includes("dbd")
        );
      if (activeCategory === "kebakaran")
        return (
          (rep.tipe_bahaya || "").toLowerCase().includes("kebakaran") ||
          (rep.tipe_bahaya || "").toLowerCase().includes("metana")
        );
      if (activeCategory === "bau") return (rep.tipe_bahaya || "").toLowerCase().includes("bau");
      if (activeCategory === "pengepul") return rep.status?.kode === "siap_diambil_pengepul";

      return true;
    });
  }, [reports, searchQuery, activeCategory]);

  // Initialize Leaflet Map
  React.useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((leafletModule) => {
      if (!isMounted || !mapContainerRef.current) return;
      const L = (leafletModule as any).default || leafletModule;
      leafletLibRef.current = L;
      if (typeof window !== "undefined") {
        (window as any).L = L;
      }

      // Handle re-mounts / strict mode container reuse
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const centerLat = -7.9826;
        const centerLng = 112.6308;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 14,
          zoomControl: false,
        });

        // Official Google Maps Tile Layer (100% Authentic Google Maps View, No API Key Required)
        const streetTiles = L.tileLayer(
          "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
          {
            maxZoom: 20,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
            attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>',
          }
        );

        streetTiles.addTo(map);
        mapInstanceRef.current = map;
        setIsMapReady(true);

        const updateZoom = () => {
          if (map) setMapZoom(map.getZoom());
        };
        map.on("zoom", updateZoom);
        map.on("zoomend", updateZoom);
        setMapZoom(map.getZoom());

        const handleUserDrag = () => {
          setIsMapPannedAway(true);
          setAutoCenterGps(false);
        };
        map.on("dragstart", handleUserDrag);

        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 200);
      }
    }).catch((err) => {
      console.error("Leaflet initialization failed:", err);
    });

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);
      clearRouteLayers();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setIsMapReady(false);
    };
  }, []);

  // Recalculate map dimensions whenever navigation mode toggles to prevent clipping
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [activeRouteReport]);

  // Update map tile layer (streets vs satellite)
  React.useEffect(() => {
    if (!mapInstanceRef.current) return;

    import("leaflet").then((leafletModule) => {
      const L = (leafletModule as any).default || leafletModule;
      const map = mapInstanceRef.current;
      if (!map) return;

      map.eachLayer((layer: LeafletLayer) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });

      if (mapLayer === "satellite") {
        L.tileLayer(
          "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
          {
            maxZoom: 20,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
            attribution: '&copy; <a href="https://maps.google.com">Google Maps Satellite</a>',
          }
        ).addTo(map);
      } else {
        L.tileLayer(
          "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
          {
            maxZoom: 20,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
            attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>',
          }
        ).addTo(map);
      }
    });
  }, [mapLayer, isMapReady]);

  // Synchronize Heatmap Layer (Garbage Density)
  React.useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (!showHeatmap) {
      if (heatmapLayerRef.current) {
        map.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }
      return;
    }

    import("leaflet").then(async (leafletModule) => {
      const L = (leafletModule as any).default || leafletModule;
      if (!mapInstanceRef.current) return;

      // Remove existing heat layer if already present
      if (heatmapLayerRef.current) {
        map.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }

      // Convert filtered reports into weighted heatmap points [lat, lng, intensity]
      const heatPoints: [number, number, number][] = filteredReports.map((r) => {
        const vol = r.analisis_ai?.volume_sampah_m3 || 1.0;
        const isHazard = Boolean(r.tipe_bahaya || r.is_resiko_banjir);
        const weight = Math.min(Math.max(vol / 2.5 + (isHazard ? 0.35 : 0.15), 0.4), 1.0);
        return [r.latitude, r.longitude, weight];
      });

      const layer = await createHeatLayer(L, heatPoints, {
        radius: 42,
        blur: 24,
        maxZoom: 16,
        max: 1.0,
        minOpacity: 0.38,
        gradient: {
          0.15: "#0EB29A", // Low Density (Mint Teal)
          0.4: "#3b82f6",  // Moderate (Blue)
          0.65: "#eab308", // Elevated (Yellow)
          0.85: "#f97316", // High (Orange)
          1.0: "#ef4444",  // Severe Hotspot (Red)
        },
      });

      if (layer && mapInstanceRef.current && showHeatmap) {
        layer.addTo(mapInstanceRef.current);
        heatmapLayerRef.current = layer;
      }
    });

    return () => {
      if (heatmapLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }
    };
  }, [showHeatmap, filteredReports]);

  // Synchronize Geofenced Hazard Pulse Circles & Danger Buffers
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapReady) return;

    // Clean up previous hazard layers
    hazardLayersRef.current.forEach((layer) => {
      try {
        map.removeLayer(layer);
      } catch {}
    });
    hazardLayersRef.current = [];

    if (!showHazardZones) return;

    import("leaflet").then((leafletModule) => {
      const L = (leafletModule as any).default || leafletModule;
      if (!mapInstanceRef.current) return;

      const newLayers: any[] = [];

      // Consolidate hazard targets from warnings and high-risk reports
      const activeHazardTargets: Array<{
        id: number | string;
        lat: number;
        lng: number;
        level: string;
        tipeBahaya: string;
        radiusMeters: number;
        lokasi: string;
        report?: LaporanSampah;
      }> = [];

      // 1. Prioritize active warning broadcasts
      warnings.forEach((w) => {
        const matchedReport =
          w.laporan ||
          reports.find((r) => r.id === w.laporan_id) ||
          MOCK_LAPORAN_SAMPAH.find((r) => r.id === w.laporan_id);

        const lat =
          matchedReport?.latitude ||
          (w.id === 1 ? -7.9826 : w.id === 2 ? -7.9712 : -7.9901);
        const lng =
          matchedReport?.longitude ||
          (w.id === 1 ? 112.6308 : w.id === 2 ? 112.6342 : 112.6219);
        const radius = w.radius_terdampak_meter || 500;
        const loc = matchedReport?.alamat_lokasi || "Wilayah Kota Malang";

        activeHazardTargets.push({
          id: `warn_${w.id}`,
          lat,
          lng,
          level: w.level_peringatan || "AWAS",
          tipeBahaya: w.tipe_bahaya || "Bencana Sampah",
          radiusMeters: radius,
          lokasi: loc,
          report: matchedReport,
        });
      });

      // 2. If no warnings loaded yet, detect critical flood/hazard reports
      if (activeHazardTargets.length === 0) {
        reports.forEach((r) => {
          if (r.is_resiko_banjir || r.tipe_bahaya) {
            activeHazardTargets.push({
              id: `rep_${r.id}`,
              lat: r.latitude,
              lng: r.longitude,
              level: r.is_resiko_banjir ? "AWAS" : "SIAGA",
              tipeBahaya: r.tipe_bahaya || "Potensi Banjir",
              radiusMeters: r.is_resiko_banjir ? 800 : 400,
              lokasi: r.alamat_lokasi,
              report: r,
            });
          }
        });
      }

      activeHazardTargets.forEach((t) => {
        const isAwas = t.level === "AWAS";
        const color = isAwas ? "#ef4444" : "#f59e0b";

        // Circle 1: Outer Buffer Perimeter (Animated dashed border)
        const outerCircle = L.circle([t.lat, t.lng], {
          radius: t.radiusMeters,
          color,
          fillColor: color,
          fillOpacity: isAwas ? 0.12 : 0.08,
          weight: 2,
          dashArray: "6, 8",
        }).addTo(map);

        // Circle 2: Inner Core Critical Perimeter (35% of total radius)
        const innerCircle = L.circle([t.lat, t.lng], {
          radius: Math.round(t.radiusMeters * 0.35),
          color,
          fillColor: color,
          fillOpacity: isAwas ? 0.24 : 0.16,
          weight: 1.5,
        }).addTo(map);

        // Floating Tag on the top perimeter of the hazard zone
        // 1 degree latitude ~= 111,000 meters
        const latOffset = (t.radiusMeters / 111000) * 0.96;
        const tagIcon = L.divIcon({
          className: "custom-hazard-tag-marker",
          html: `
            <div style="transform: translate(-50%, -100%);">
              <div class="px-2.5 py-1 rounded-full ${
                isAwas ? "bg-rose-600 shadow-rose-600/50" : "bg-amber-600 shadow-amber-600/50"
              } text-white text-[10px] font-black shadow-lg border-2 border-white flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:scale-105 transition-transform">
                <span class="inline-block w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>${t.level}: ${t.tipeBahaya} (${t.radiusMeters}m)</span>
              </div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const tagMarker = L.marker([t.lat + latOffset, t.lng], {
          icon: tagIcon,
          zIndexOffset: 350,
        }).addTo(map);

        if (t.report) {
          tagMarker.on("click", () => {
            setSelectedReport(t.report!);
          });
        }

        newLayers.push(outerCircle, innerCircle, tagMarker);
      });

      hazardLayersRef.current = newLayers;
    });

    return () => {
      hazardLayersRef.current.forEach((layer) => {
        try {
          map.removeLayer(layer);
        } catch {}
      });
      hazardLayersRef.current = [];
    };
  }, [showHazardZones, warnings, reports, isMapReady]);

  // Synchronize Markers
  React.useEffect(() => {
    if (!mapInstanceRef.current) return;

    import("leaflet").then((leafletModule) => {
      const L = leafletModule.default || leafletModule;
      const map = mapInstanceRef.current;
      if (!map) return;

      // Remove existing markers
      Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
      markersRef.current = {};

      // Lucide React SVG icon templates for attractive waste & status pins
      const LUCIDE_PIN_ICONS = {
        trash: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 drop-shadow-xs"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
        recycle: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 drop-shadow-xs"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"></path><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"></path><path d="m14 16-3 3 3 3"></path><path d="M8.293 13.596 7.196 9.5 3.1 10.598"></path><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"></path><path d="m13.378 9.633 4.096 1.098 1.097-4.096"></path></svg>`,
        flame: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 drop-shadow-xs"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"></path></svg>`,
        alert: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 drop-shadow-xs"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`,
      };

      filteredReports.forEach((rep) => {
        const isSelected = selectedReport?.id === rep.id;
        const hazardStr = (rep.tipe_bahaya || "").toLowerCase();

        let iconSvg = LUCIDE_PIN_ICONS.trash;
        let pinBgColor = "#e11d48"; // rose-600

        if (rep.status?.kode === "siap_diambil_pengepul") {
          iconSvg = LUCIDE_PIN_ICONS.recycle;
          pinBgColor = "#0EB29A";
        } else if (hazardStr.includes("kebakaran") || hazardStr.includes("metana")) {
          iconSvg = LUCIDE_PIN_ICONS.flame;
          pinBgColor = "#ea580c"; // orange-600
        } else if (hazardStr.includes("bau") || hazardStr.includes("toksik")) {
          iconSvg = LUCIDE_PIN_ICONS.trash;
          pinBgColor = "#2E6E65";
        } else if (hazardStr.includes("wabah") || hazardStr.includes("dbd")) {
          iconSvg = LUCIDE_PIN_ICONS.alert;
          pinBgColor = "#f59e0b"; // amber-500
        } else {
          // Default / banjir / tumpukan sampah
          iconSvg = LUCIDE_PIN_ICONS.trash;
          pinBgColor = "#e11d48";
        }

        // Check for neighboring reports within 100 meters
        const nearbyCount = filteredReports.filter(
          (other) =>
            other.id !== rep.id &&
            getDistanceMeters(rep.latitude, rep.longitude, other.latitude, other.longitude) <= 100
        ).length;

        const isDispatched =
          dispatchedReportIds.includes(rep.id) ||
          Boolean(rep.is_dispatched) ||
          activeArmadaList.some((t) => t.laporan_id === rep.id) ||
          rep.status?.kode === "siap_diambil_pengepul";
        const isPengepulRole = user?.role === "pengepul" || roleViewMode === "pengepul";
        const showShockwave = isDispatched && isPengepulRole;

        // Precision Map Pin: 40px wide, 48px tall, sharp needle tip anchored precisely at [20, 48]
        const markerHtml = `
          <div class="relative flex flex-col items-center cursor-pointer group select-none">
            <!-- Floating Address Pill above the pin head -->
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#2B3752]/95 backdrop-blur-xs text-white text-[10px] font-bold whitespace-nowrap shadow-md max-w-[150px] truncate border border-slate-700/50 pointer-events-auto transition-transform group-hover:scale-105">
              ${rep.alamat_lokasi}
            </div>

            ${
              nearbyCount > 0
                ? `<div class="absolute -top-12 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-[#0EB29A] text-white text-[8px] font-bold shadow-xs whitespace-nowrap border border-white/60">${nearbyCount + 1} titik berdekatan</div>`
                : ""
            }

            <!-- Selection Ring / Ping -->
            ${
              isSelected
                ? '<span class="animate-ping absolute top-0 left-1/2 -translate-x-1/2 inline-flex h-9 w-9 rounded-full bg-red-400 opacity-60 pointer-events-none"></span>'
                : ""
            }

            ${
              showShockwave
                ? `
                <style>
                  @keyframes shockwave-ring {
                    0% {
                      transform: translate(-50%, -50%) scale(0.2);
                      opacity: 0.95;
                    }
                    50% {
                      opacity: 0.45;
                    }
                    100% {
                      transform: translate(-50%, -50%) scale(3.5);
                      opacity: 0;
                    }
                  }
                  .shockwave-ring-1 {
                    animation: shockwave-ring 2.4s cubic-bezier(0.1, 0.45, 0.3, 1) infinite !important;
                    transform-origin: center center;
                  }
                  .shockwave-ring-2 {
                    animation: shockwave-ring 2.4s cubic-bezier(0.1, 0.45, 0.3, 1) infinite 0.8s !important;
                    transform-origin: center center;
                  }
                  .shockwave-ring-3 {
                    animation: shockwave-ring 2.4s cubic-bezier(0.1, 0.45, 0.3, 1) infinite 1.6s !important;
                    transform-origin: center center;
                  }
                </style>

                <!-- Green Transparent Shockwave (Gelombang Kejut Hijau Transparan Pengepul) -->
                <div class="absolute bottom-0 left-1/2 pointer-events-none z-0">
                  <div class="shockwave-ring-1 absolute top-0 left-0 w-28 h-28 rounded-full border-2 border-emerald-400/90 bg-emerald-500/25 shadow-[0_0_30px_rgba(16,185,129,0.7)]"></div>
                  <div class="shockwave-ring-2 absolute top-0 left-0 w-44 h-44 rounded-full border-2 border-emerald-400/70 bg-emerald-400/15 shadow-[0_0_45px_rgba(52,211,153,0.5)]"></div>
                  <div class="shockwave-ring-3 absolute top-0 left-0 w-60 h-60 rounded-full border border-emerald-300/50 bg-emerald-300/10 shadow-[0_0_60px_rgba(110,231,183,0.35)]"></div>
                  <div class="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-400/60 blur-xs animate-pulse"></div>
                </div>

                <!-- High-Priority Order Dispatch Tag Above the Pin -->
                <div class="absolute -top-12 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-[#0EB29A] text-white text-[9.5px] font-black uppercase tracking-wider shadow-xl border-2 border-white flex items-center gap-1.5 whitespace-nowrap animate-bounce z-20">
                  <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span>⚡ PERMINTAAN JEMPUT</span>
                </div>
              `
                : ""
            }

            <!-- Precision SVG Pin: Pointy tip at exact [20, 47.5] bottom center -->
            <div class="relative transition-transform duration-200 group-hover:scale-110 ${
              isSelected ? "scale-115" : ""
            }">
              <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="filter drop-shadow-md">
                <path d="M20 47.5 C19.2 47.5 4 31 4 19.5 C4 10.4 11.2 3 20 3 C28.8 3 36 10.4 36 19.5 C36 31 20.8 47.5 20 47.5 Z" fill="${showShockwave ? "#059669" : pinBgColor}" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
              </svg>

              <!-- Centered White Icon inside the Pin Bulb -->
              <div class="absolute top-[8px] left-1/2 -translate-x-1/2 text-white flex items-center justify-center pointer-events-none">
                ${showShockwave ? LUCIDE_PIN_ICONS.recycle : iconSvg}
              </div>

              ${
                nearbyCount > 0
                  ? `<span class="absolute -top-1 -right-1 bg-[#0EB29A] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border-2 border-white shadow-md flex items-center"><span>+${nearbyCount}</span></span>`
                  : ""
              }
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: "custom-gmap-pin",
          html: markerHtml,
          iconSize: [40, 48],
          iconAnchor: [20, 48],
        });

        const marker = L.marker([rep.latitude, rep.longitude], { icon: customIcon });

        marker.on("click", () => {
          setSelectedReport(rep);
          const currentMap = mapInstanceRef.current;
          if (currentMap) {
            currentMap.flyTo([rep.latitude, rep.longitude], 16, { duration: 0.8 });
          }
        });

        marker.addTo(map);
        markersRef.current[rep.id] = marker;
      });
    });
  }, [filteredReports, selectedReport, isMapReady, dispatchedReportIds, user?.role, roleViewMode, activeArmadaList]);

  // Invalidate map size when drawers toggle to ensure tiles remain seamless
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedReport, activeRouteReport, activeRailPanel]);

  // Realtime Simulation / Drive along route coordinates
  React.useEffect(() => {
    if (
      !isSimulatingDrive ||
      pengepulMissionStatus !== "otw" ||
      !routeData?.coordinates ||
      routeData.coordinates.length < 2
    ) {
      return;
    }

    const coords = routeData.coordinates;
    const interval = setInterval(() => {
      setLastMovementTimestamp(Date.now());
      setIsDriverIdle(false);

      setSimulationIndex((prev) => {
        const next = prev + 1;
        if (next >= coords.length) {
          setIsSimulatingDrive(false);
          voiceNavigator.announceArrival();
          const last = coords[coords.length - 1];
          const prevLast = coords[coords.length - 2] || last;
          const heading = calculateBearing(prevLast[0], prevLast[1], last[0], last[1]);
          setCollectorLocation({
            lat: last[0],
            lng: last[1],
            heading,
          });

          // Broadcast arrival to backend and other browsers
          if (activeRouteReport) {
            updateTruckLocationApi({
              laporanId: activeRouteReport.id,
              pengepulId: user?.id || 30,
              latitude: last[0],
              longitude: last[1],
              heading,
              kecepatanKmh: 0,
              statusJemput: "tahap_pengambilan",
            });
            if (typeof BroadcastChannel !== "undefined") {
              try {
                const ch = new BroadcastChannel("uinic_armada_tracking");
                ch.postMessage({
                  type: "TRUCK_LOCATION_UPDATE",
                  data: {
                    laporan_id: activeRouteReport.id,
                    pengepul_id: user?.id || 30,
                    pengepul_nama: user?.name || "Pak Joko (Mitra Pengepul)",
                    latitude: last[0],
                    longitude: last[1],
                    heading,
                    kecepatan_kmh: 0,
                    status_jemput: "tahap_pengambilan",
                  },
                });
                ch.close();
              } catch {}
            }
          }

          return coords.length - 1;
        }

        const currPoint = coords[prev];
        const nextPoint = coords[next];
        const heading = calculateBearing(currPoint[0], currPoint[1], nextPoint[0], nextPoint[1]);

        // Voice guidance for next turn maneuver along the route
        if (routeData?.steps && routeData.steps.length > 0) {
          const stepIdx = Math.min(
            Math.floor((next / coords.length) * routeData.steps.length),
            routeData.steps.length - 1
          );
          const activeStep = routeData.steps[stepIdx];
          if (activeStep && activeStep.instruction) {
            voiceNavigator.announceManeuver(activeStep.instruction, activeStep.distanceMeters);
          }
        }

        setCollectorLocation({
          lat: nextPoint[0],
          lng: nextPoint[1],
          heading,
        });

        // Broadcast moving truck location to backend (throttled to 3.5s) and other local tabs via BroadcastChannel
        if (activeRouteReport) {
          const now = Date.now();
          if (now - lastBackendLocationUpdateRef.current >= 3500 || next >= routeData.coordinates.length - 1) {
            lastBackendLocationUpdateRef.current = now;
            updateTruckLocationApi({
              laporanId: activeRouteReport.id,
              pengepulId: user?.id || 30,
              latitude: nextPoint[0],
              longitude: nextPoint[1],
              heading,
              kecepatanKmh: 35,
              statusJemput: "menuju_lokasi",
            });
          }
          if (typeof BroadcastChannel !== "undefined") {
            try {
              const ch = new BroadcastChannel("uinic_armada_tracking");
              ch.postMessage({
                type: "TRUCK_LOCATION_UPDATE",
                data: {
                  laporan_id: activeRouteReport.id,
                  pengepul_id: user?.id || 30,
                  pengepul_nama: user?.name || "Pak Joko (Mitra Pengepul)",
                  latitude: nextPoint[0],
                  longitude: nextPoint[1],
                  heading,
                  kecepatan_kmh: 35,
                  status_jemput: "menuju_lokasi",
                },
              });
              ch.close();
            } catch {}
          }
        }

        // Smoothly pan map to follow the truck if autoCenter is active
        if (autoCenterGpsRef.current && mapInstanceRef.current) {
          mapInstanceRef.current.panTo([nextPoint[0], nextPoint[1]], {
            animate: true,
            duration: 0.6,
          });
        }

        return next;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isSimulatingDrive, pengepulMissionStatus, routeData, activeRouteReport, user]);

  // Synchronize Active Armada Trucks across all clients, tabs, and devices (Optimized Realtime Pattern)
  React.useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const loadActiveArmada = async () => {
      // 1. Skip network request if browser tab is hidden or minimized (Page Visibility API)
      if (typeof document !== "undefined" && document.hidden) return;
      // 2. Skip if device is currently offline
      if (typeof navigator !== "undefined" && !navigator.onLine) return;

      try {
        const [data, serverDispatchedIds] = await Promise.all([
          fetchActiveArmadaApi(),
          fetchDispatchedReportIdsApi(),
        ]);

        if (isMounted && Array.isArray(data)) {
          const now = Date.now();
          const activeOnly = data.filter((t) => {
            const updateStr = t.waktu_update_lokasi || (t as any).updated_at;
            if (!updateStr) return true;
            const time = new Date(updateStr).getTime();
            return isNaN(time) || now - time < ARMADA_IDLE_TIMEOUT_MS;
          });

          // Cross-device sync: combine backend dispatched IDs + active armada missions
          const activeMissionReportIds = activeOnly
            .map((t) => t.laporan_id)
            .filter((id): id is number => typeof id === "number" && id > 0);
          const combinedDispatched = [...new Set([...(serverDispatchedIds || []), ...activeMissionReportIds])];
          if (combinedDispatched.length > 0) {
            setDispatchedReportIds((prev) => {
              const merged = [...new Set([...prev, ...combinedDispatched])];
              if (merged.length !== prev.length) {
                return merged;
              }
              return prev;
            });
          }

          // 3. Deep Fingerprint Guard: Avoid React state mutation if coordinates & status are identical
          const fingerprint = activeOnly
            .map(
              (t) =>
                `${t.id}_${t.latitude.toFixed(5)}_${t.longitude.toFixed(5)}_${Math.round(t.heading || 0)}_${t.status_jemput}`
            )
            .join("|");

          if (fingerprint !== lastArmadaFingerprintRef.current) {
            lastArmadaFingerprintRef.current = fingerprint;
            setActiveArmadaList(activeOnly);
          }
        }
      } catch {
        // silent fallback
      }
    };

    // Initial fetch
    loadActiveArmada();

    // Adaptive interval: 4500ms (reduces HTTP polling by 70%)
    pollInterval = setInterval(loadActiveArmada, 4500);

    // Visibility change handler: pause when backgrounded, immediately sync once when foregrounded
    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        loadActiveArmada();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("uinic_armada_tracking");
        channel.onmessage = (event) => {
          if (!isMounted || !event?.data) return;
          const msg = event.data;
          if (msg.type === "TRUCK_LOCATION_UPDATE" && msg.data) {
            const incoming: ActiveArmadaTruck = {
              id: msg.data.id || (msg.data.laporan_id ? msg.data.laporan_id * 100 : 999),
              laporan_id: msg.data.laporan_id,
              pengepul_id: msg.data.pengepul_id,
              pengepul_nama: msg.data.pengepul_nama || "Pak Joko (Mitra Pengepul)",
              status_jemput: msg.data.status_jemput || "menuju_lokasi",
              latitude: msg.data.latitude,
              longitude: msg.data.longitude,
              heading: msg.data.heading || 0,
              kecepatan_kmh: msg.data.kecepatan_kmh || 35,
              waktu_update_lokasi: new Date().toISOString(),
            };
            setActiveArmadaList((prev) => {
              const idx = prev.findIndex((t) => t.laporan_id === incoming.laporan_id);
              if (idx >= 0) {
                // If position difference is negligible, avoid re-rendering
                const current = prev[idx];
                const dLat = Math.abs(current.latitude - incoming.latitude);
                const dLng = Math.abs(current.longitude - incoming.longitude);
                const dHead = Math.abs((current.heading || 0) - (incoming.heading || 0));
                if (dLat < 0.00002 && dLng < 0.00002 && dHead < 2 && current.status_jemput === incoming.status_jemput) {
                  return prev;
                }
                const updated = [...prev];
                updated[idx] = { ...updated[idx], ...incoming };
                return updated;
              }
              return [...prev, incoming];
            });
          } else if (msg.type === "TRUCK_MISSION_FINISHED" || msg.type === "TRUCK_MISSION_CANCELLED") {
            setActiveArmadaList((prev) => prev.filter((t) => t.laporan_id !== msg.laporan_id));
            setDispatchedReportIds((prev) => prev.filter((id) => id !== msg.laporan_id));
          } else if (msg.type === "CITIZEN_PICKUP_REQUESTED" && msg.reportId) {
            setDispatchedReportIds((prev) => {
              if (!prev.includes(msg.reportId)) {
                return [...prev, msg.reportId];
              }
              return prev;
            });
            if (msg.latitude && msg.longitude && mapInstanceRef.current && (user?.role === "pengepul" || roleViewMode === "pengepul")) {
              mapInstanceRef.current.flyTo([msg.latitude, msg.longitude], 16, { duration: 1.2 });
            }
          }
        };
      } catch {}
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      if (channel) {
        channel.close();
      }
    };
  }, [ARMADA_IDLE_TIMEOUT_MS]);

  // Multi-Armada Truck Map Layer (Rendered for ALL users: cross-client, other accounts, citizens)
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapReady) return;

    const renderMarkers = (L: any) => {
      if (!mapInstanceRef.current) return;

      const activeKeys = new Set<string>();
      const now = Date.now();

      activeArmadaList.forEach((truck) => {
        // If current tab is actively driving this specific truck along the local route,
        // OR this truck belongs to the currently logged in pengepul on this tab,
        // let collectorTruckMarkerRef handle the local rendering governed by isPengepulOnline.
        const isCurrentTabDriver =
          (activeRouteReport?.id === truck.laporan_id &&
            (pengepulMissionStatus === "otw" || pengepulMissionStatus === "tahap_pengambilan")) ||
          (user?.role === "pengepul" && truck.pengepul_id === user?.id);

        if (isCurrentTabDriver) {
          return;
        }

        // If truck is idle for more than 10 minutes, do not render its icon
        const updateStr = truck.waktu_update_lokasi || (truck as any).updated_at;
        if (updateStr) {
          const updateTime = new Date(updateStr).getTime();
          if (!isNaN(updateTime) && now - updateTime >= ARMADA_IDLE_TIMEOUT_MS) {
            return;
          }
        }

        const truckKey = `truck_${truck.laporan_id || truck.id}`;
        activeKeys.add(truckKey);

        const driverName = truck.pengepul_nama || "Pak Joko (Mitra Pengepul)";
        const heading = truck.heading ?? 0;

        const truckIcon = createTruckDivIcon(
          L,
          {
            driverName,
            status: truck.status_jemput,
            heading,
          },
          mapZoom,
          isHeadingUpMode
        );

        const popupHtml = createTruckPopupHtml({
          driverName,
          status: truck.status_jemput,
          avatarUrl: truck.pengepul_foto,
          rating: truck.pengepul_rating,
          platNomor: truck.pengepul_plat_nomor,
          jenisKendaraan: truck.pengepul_jenis_kendaraan,
          telepon: truck.pengepul_telepon,
          alamat: truck.laporan?.alamat_lokasi,
        });

        const popupOptions = {
          offset: [0, -26] as [number, number],
          className: "custom-truck-leaflet-popup",
          closeButton: true,
          autoPan: true,
        };

        const existingMarker = armadaMarkersRef.current.get(truckKey);
        if (existingMarker) {
          // High performance: setLatLng uses CSS translate3d directly
          existingMarker.setLatLng([truck.latitude, truck.longitude]);

          const prevHeading = (existingMarker as any)._lastHeading;
          const prevStatus = (existingMarker as any)._lastStatus;
          const prevZoom = (existingMarker as any)._lastZoom;

          // Only recreate DOM element if rotation heading, status, or zoom level changed
          if (
            prevHeading === undefined ||
            Math.abs(prevHeading - heading) > 2 ||
            prevStatus !== truck.status_jemput ||
            prevZoom !== mapZoom
          ) {
            existingMarker.setIcon(truckIcon);
            existingMarker.setPopupContent(popupHtml);
            (existingMarker as any)._lastHeading = heading;
            (existingMarker as any)._lastStatus = truck.status_jemput;
            (existingMarker as any)._lastZoom = mapZoom;
          }
        } else {
          const marker = L.marker([truck.latitude, truck.longitude], {
            icon: truckIcon,
            zIndexOffset: 1250,
          }).addTo(mapInstanceRef.current);

          marker.bindPopup(popupHtml, popupOptions);
          (marker as any)._lastHeading = heading;
          (marker as any)._lastStatus = truck.status_jemput;
          (marker as any)._lastZoom = mapZoom;

          armadaMarkersRef.current.set(truckKey, marker);
        }
      });

      // Clean up markers that are no longer active
      armadaMarkersRef.current.forEach((marker, key) => {
        if (!activeKeys.has(key)) {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.removeLayer(marker);
          }
          armadaMarkersRef.current.delete(key);
        }
      });
    };

    if (leafletLibRef.current) {
      renderMarkers(leafletLibRef.current);
    } else {
      import("leaflet").then((leafletModule) => {
        const L = (leafletModule as any).default || leafletModule;
        leafletLibRef.current = L;
        renderMarkers(L);
      });
    }
  }, [activeArmadaList, isMapReady, activeRouteReport, pengepulMissionStatus, mapZoom, isHeadingUpMode]);

  // Realtime Local Collector Truck Layer (Rendered ONLY when pengepul is ONLINE & active)
  React.useEffect(() => {
    const isPengepul = user?.role === "pengepul";
    const isMissionActive =
      pengepulMissionStatus === "otw" || pengepulMissionStatus === "tahap_pengambilan";

    // Mobil HANYA muncul jika pengepul mengaktifkan status Online (atau sedang aktif menjalankan misi) dan tidak idle > 10 menit
    const shouldShowTruck =
      ((isPengepul && isPengepulOnline) || isMissionActive) &&
      isPengepulOnline &&
      !isDriverIdle;

    // If penugasan is NOT active or driver is idle > 10 mins or OFFLINE, cleanly remove truck marker from the map
    if (!shouldShowTruck) {
      if (collectorTruckMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(collectorTruckMarkerRef.current);
        collectorTruckMarkerRef.current = null;
      }
      return;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Determine current truck position
    const defaultLat = geo.latitude || -7.9826;
    const defaultLng = geo.longitude || 112.6308;
    const currentLat = collectorLocation?.lat ?? (routeData?.coordinates?.[0]?.[0] || defaultLat);
    const currentLng = collectorLocation?.lng ?? (routeData?.coordinates?.[0]?.[1] || defaultLng);
    const heading = collectorLocation?.heading ?? 0;

    const renderLocalTruck = (L: any) => {
      if (!mapInstanceRef.current) return;

      const driverName = user?.name || "Pak Joko (Mitra Pengepul)";
      const currentStatus =
        pengepulMissionStatus === "idle" ? "siaga_online" : pengepulMissionStatus;

      const popupOptions = {
        offset: [0, -26] as [number, number],
        className: "custom-truck-leaflet-popup",
        closeButton: true,
        autoPan: true,
      };

      if (!collectorTruckMarkerRef.current) {
        const truckIcon = createTruckDivIcon(
          L,
          {
            driverName,
            status: currentStatus,
            heading,
          },
          mapZoom,
          isHeadingUpMode
        );

        const localPopupHtml = createTruckPopupHtml({
          driverName,
          status: currentStatus,
          avatarUrl:
            user?.avatar_url ||
            user?.foto_profil ||
            "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&auto=format&fit=crop&q=80",
          rating: 4.9,
          platNomor: "N 8472 AB",
          jenisKendaraan: "Truk Bak Hidrolik Mini DLH",
          telepon: user?.no_telepon || (user as any)?.phone || "0812-3456-7890",
          alamat: activeRouteReport?.alamat_lokasi,
        });

        const marker = L.marker([currentLat, currentLng], {
          icon: truckIcon,
          zIndexOffset: 1200,
        }).addTo(mapInstanceRef.current);

        marker.bindPopup(localPopupHtml, popupOptions);
        (marker as any)._lastHeading = heading;
        (marker as any)._lastStatus = currentStatus;
        (marker as any)._lastZoom = mapZoom;

        collectorTruckMarkerRef.current = marker;
      } else {
        // High performance: setLatLng uses CSS translate3d without recreating DOM elements
        collectorTruckMarkerRef.current.setLatLng([currentLat, currentLng]);

        const prevHeading = (collectorTruckMarkerRef.current as any)._lastHeading;
        const prevStatus = (collectorTruckMarkerRef.current as any)._lastStatus;
        const prevZoom = (collectorTruckMarkerRef.current as any)._lastZoom;

        // Only recreate DOM element if rotation heading (>2 deg), status, or zoom level changed
        if (
          prevHeading === undefined ||
          Math.abs(prevHeading - heading) > 2 ||
          prevStatus !== currentStatus ||
          prevZoom !== mapZoom
        ) {
          const truckIcon = createTruckDivIcon(
            L,
            {
              driverName,
              status: currentStatus,
              heading,
            },
            mapZoom,
            isHeadingUpMode
          );

          const localPopupHtml = createTruckPopupHtml({
            driverName,
            status: currentStatus,
            avatarUrl:
              user?.avatar_url ||
              user?.foto_profil ||
              "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&auto=format&fit=crop&q=80",
            rating: 4.9,
            platNomor: "N 8472 AB",
            jenisKendaraan: "Truk Bak Hidrolik Mini DLH",
            telepon: user?.no_telepon || (user as any)?.phone || "0812-3456-7890",
            alamat: activeRouteReport?.alamat_lokasi,
          });

          collectorTruckMarkerRef.current.setIcon(truckIcon);
          collectorTruckMarkerRef.current.setPopupContent(localPopupHtml);
          (collectorTruckMarkerRef.current as any)._lastHeading = heading;
          (collectorTruckMarkerRef.current as any)._lastStatus = currentStatus;
          (collectorTruckMarkerRef.current as any)._lastZoom = mapZoom;
        }
      }
    };

    if (leafletLibRef.current) {
      renderLocalTruck(leafletLibRef.current);
    } else {
      import("leaflet").then((leafletModule) => {
        const L = (leafletModule as any).default || leafletModule;
        leafletLibRef.current = L;
        renderLocalTruck(L);
      });
    }
  }, [pengepulMissionStatus, collectorLocation, user, isMapReady, routeData, mapZoom, isHeadingUpMode, isDriverIdle, isPengepulOnline]);

  // Clear any existing route polyline layers, origin beacon marker, and collector truck
  const clearRouteLayers = () => {
    const map = mapInstanceRef.current;
    if (map) {
      if (routeLayersRef.current.polylineBorder) {
        map.removeLayer(routeLayersRef.current.polylineBorder);
      }
      if (routeLayersRef.current.polylineInner) {
        map.removeLayer(routeLayersRef.current.polylineInner);
      }
      if (routeLayersRef.current.originMarker) {
        map.removeLayer(routeLayersRef.current.originMarker);
      }
      if (collectorTruckMarkerRef.current) {
        map.removeLayer(collectorTruckMarkerRef.current);
        collectorTruckMarkerRef.current = null;
      }
    }
    routeLayersRef.current = {};
    setCollectorLocation(null);
    setIsSimulatingDrive(false);
    setSimulationIndex(0);
    setNavigationMode("gps");
  };

  // Request in-app road routing direction (Google Maps Style)
  const handleRequestRoute = async (
    destReport: LaporanSampah,
    mode: "driving" | "motorcycle" | "walking" = travelMode
  ) => {
    setActiveRouteReport(destReport);
    setIsRoutingLoading(true);

    const originLat = gpsTracker.position?.lat || geo.latitude || -7.9826;
    const originLng = gpsTracker.position?.lng || geo.longitude || 112.6308;
    const origin: [number, number] = [originLat, originLng];
    const dest: [number, number] = [destReport.latitude, destReport.longitude];

    try {
      const data = await getDirections(origin, dest, mode, destReport.alamat_lokasi);
      setRouteData(data);

      if (typeof window !== "undefined") {
        const leafletModule = await import("leaflet");
        const L = leafletModule.default || leafletModule;
        const map = mapInstanceRef.current;

        if (map) {
          clearRouteLayers();

          // 1. High-contrast outer stroke casing (Navy #2B3752)
          const polylineBorder = L.polyline(data.coordinates, {
            color: "#2B3752",
            weight: 7,
            opacity: 0.85,
            lineCap: "round",
            lineJoin: "round",
          }).addTo(map);

          // 2. Primary vibrant mint teal navigation path line (#0EB29A)
          const polylineInner = L.polyline(data.coordinates, {
            color: "#0EB29A",
            weight: 4.5,
            opacity: 0.95,
            lineCap: "round",
            lineJoin: "round",
          }).addTo(map);

          // 3. Origin Beacon Marker (Blue pulsating Google Maps My Location dot)
          const originBeaconHtml = `
            <div class="relative w-6 h-6 flex items-center justify-center">
              <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-500 opacity-60"></span>
              <div class="h-6 w-6 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-[11px] font-black">
                📍
              </div>
            </div>
          `;
          const originIcon = L.divIcon({
            className: "gmaps-origin-beacon",
            html: originBeaconHtml,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });
          const originMarker = L.marker([originLat, originLng], { icon: originIcon }).addTo(map);

          routeLayersRef.current = {
            polylineBorder,
            polylineInner,
            originMarker,
          };

          // Smoothly fit bounds so the entire route trajectory is visible
          map.fitBounds(polylineBorder.getBounds(), {
            padding: [70, 70],
            maxZoom: 16,
          });
        }
      }
    } catch (err) {
      console.error("Failed to render route directions:", err);
    } finally {
      setIsRoutingLoading(false);
    }
  };

  const handleTravelModeChange = (mode: "driving" | "motorcycle" | "walking") => {
    setTravelMode(mode);
    if (activeRouteReport) {
      handleRequestRoute(activeRouteReport, mode);
    }
  };

  const handleCloseRoute = () => {
    if (activeRouteReport) {
      cancelPenjemputanApi(activeRouteReport.id, user?.id);
      if (typeof BroadcastChannel !== "undefined") {
        try {
          const ch = new BroadcastChannel("uinic_armada_tracking");
          ch.postMessage({
            type: "TRUCK_MISSION_CANCELLED",
            laporan_id: activeRouteReport.id,
          });
          ch.close();
        } catch {}
      }
    }
    voiceNavigator.stop();
    clearRouteLayers();
    setActiveRouteReport(null);
    setRouteData(null);
    setPengepulMissionStatus("idle");
    setCollectorLocation(null);
    setIsSimulatingDrive(false);
    setSimulationIndex(0);
    setIsMapPannedAway(false);
    setAutoCenterGps(true);
    if (selectedReport && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedReport.latitude, selectedReport.longitude], 16, { duration: 0.8 });
    }
  };

  // Handler when user creates a new report
  const handleReportCreated = (newReport: LaporanSampah, weather: WeatherData) => {
    setReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);
    setSelectedReport(newReport);
    setCurrentWeather(weather);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([newReport.latitude, newReport.longitude], 16, { duration: 1.2 });
    }
  };

  // Fly to user GPS location
  const handleFlyToMyLocation = () => {
    if (!geo.latitude || !geo.longitude || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([geo.latitude, geo.longitude], 16, { duration: 1.0 });
  };

  const handleLogout = async () => {
    const token = getStoredToken();
    clearStoredSession();
    setUser(null);
    setRoleViewMode("warga");
    setActiveRailPanel(null);
    if (token) {
      try {
        await logoutApi(token);
      } catch (e) {
        console.error("Logout error:", e);
      }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 select-none">
      {/* 1. Leaflet Fullscreen Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full z-0"
        style={{
          transform: isHeadingUpMode ? `rotate(${mapRotation}deg) scale(1.35)` : "none",
          transformOrigin: "center center",
          transition: isHeadingUpMode ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)" : "transform 0.3s ease-out",
        }}
      />

      {/* Mini Rail Sidebar (Google Maps Left Rail - Visible when logged in) */}
      {user && (
        <MiniRailSidebar
          user={user}
          onToggleMenu={() => setIsSideMenuOpen(true)}
          onOpenSaved={() => {
            setSelectedReport(null);
            setActiveRailPanel(activeRailPanel === "saved" ? null : "saved");
          }}
          onOpenRecent={() => {
            setSelectedReport(null);
            setActiveRailPanel(activeRailPanel === "recent" ? null : "recent");
          }}
          activePanel={activeRailPanel}
          onFlyToLocation={(lat, lng, zoom = 15) => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
            }
          }}
          onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
          onLogout={handleLogout}
          isPengepulOnline={isPengepulOnline}
          onTogglePengepulOnline={handleTogglePengepulOnline}
        />
      )}

      {/* Rail Drawer Panel (Saved reports / Recent history) */}
      {user && activeRailPanel && (
        <RailDrawerPanel
          type={activeRailPanel}
          reports={reports}
          bookmarkedIds={bookmarkedIds}
          onSelectReport={(rep) => {
            setActiveRailPanel(null);
            setSelectedReport(rep);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([rep.latitude, rep.longitude], 16, { duration: 0.8 });
            }
          }}
          onClose={() => setActiveRailPanel(null)}
          onToggleBookmark={(id) => {
            toggleBookmarkedId(id);
            setBookmarkedIds(getBookmarkedIds());
          }}
        />
      )}

      {/* 2b. Google Maps Floating Search Bar & Category Chips */}
      {!selectedReport && !activeRouteReport && !activeRailPanel && (
        <SearchFloatingBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onMenuToggle={() => setIsSideMenuOpen(true)}
          totalResults={filteredReports.length}
          user={user}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          isRailVisible={Boolean(user)}
          roleViewMode={roleViewMode}
          onOpenTrackerModal={() => {
            setTrackingReport(reports[0] || null);
            setIsTrackerModalOpen(true);
          }}
        />
      )}

      {/* 2c. Pengepul Online / Offline Floating Switch Pill */}
      {user?.role === "pengepul" && !activeRouteReport && (
        <div className="absolute top-[138px] right-3 sm:top-4 sm:right-6 z-20 animate-in fade-in slide-in-from-top-2 duration-300">
          <button
            type="button"
            onClick={() => handleTogglePengepulOnline()}
            className={cn(
              "flex items-center gap-2.5 px-3.5 py-2 rounded-full shadow-xl border backdrop-blur-md transition-all duration-200 cursor-pointer select-none",
              isPengepulOnline
                ? "bg-emerald-600/95 hover:bg-emerald-700 text-white border-emerald-400/80 shadow-emerald-600/25 ring-2 ring-emerald-500/30"
                : "bg-white/95 hover:bg-slate-50 text-slate-700 border-slate-200 shadow-slate-300/40"
            )}
            title={isPengepulOnline ? "Klik untuk Offline (Sembunyikan Armada)" : "Klik untuk Online (Aktifkan Armada & Siaga)"}
          >
            <div
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center transition-transform",
                isPengepulOnline ? "bg-white text-emerald-600" : "bg-slate-100 text-slate-400"
              )}
            >
              <Truck className="h-4 w-4" />
            </div>
            <div className="flex flex-col text-left leading-tight pr-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    isPengepulOnline ? "bg-emerald-300 animate-pulse" : "bg-slate-300"
                  )}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {isPengepulOnline ? "Armada Online" : "Armada Offline"}
                </span>
              </div>
              <span
                className={cn(
                  "text-[11px] font-extrabold",
                  isPengepulOnline ? "text-emerald-100" : "text-slate-500"
                )}
              >
                {isPengepulOnline ? "Siaga Penjemputan" : "Mode Istirahat"}
              </span>
            </div>
            {/* Toggle switch track */}
            <div
              className={cn(
                "w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ml-0.5",
                isPengepulOnline ? "bg-emerald-400/60" : "bg-slate-200"
              )}
            >
              <div
                className={cn(
                  "h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out",
                  isPengepulOnline ? "translate-x-4" : "translate-x-0"
                )}
              />
            </div>
          </button>
        </div>
      )}

      {/* 3. In-App Navigation Route Direction Panel OR Place Detail Card Drawer */}
      {activeRouteReport ? (
        <RouteDirectionPanel
          report={activeRouteReport}
          routeData={routeData}
          isLoading={isRoutingLoading}
          travelMode={travelMode}
          onTravelModeChange={handleTravelModeChange}
          onClose={handleCloseRoute}
          onBackToDetail={() => {
            setActiveRouteReport(null);
          }}
          originLabel={
            geo.latitude && geo.longitude
              ? "Lokasi Anda (GPS Terdeteksi)"
              : "Alun-Alun Kota Malang (Titik Awal)"
          }
          isRailVisible={Boolean(user)}
          user={user}
          currentLat={collectorLocation?.lat ?? gpsTracker.position?.lat ?? geo.latitude}
          currentLng={collectorLocation?.lng ?? gpsTracker.position?.lng ?? geo.longitude}
          missionStatus={pengepulMissionStatus}
          onMissionStatusChange={(st) => {
            setPengepulMissionStatus(st);
            if (st === "otw") {
              handleTogglePengepulOnline(true);
              setLastMovementTimestamp(Date.now());
              setIsDriverIdle(false);
              setAutoCenterGps(true);
              setIsMapPannedAway(false);
              let truckLat = -7.9826;
              let truckLng = 112.6308;
              if (navigationMode === "simulation") {
                if (routeData?.coordinates?.length) {
                  const p0 = routeData.coordinates[0];
                  const p1 = routeData.coordinates[1] || p0;
                  const brng = calculateBearing(p0[0], p0[1], p1[0], p1[1]);
                  setCollectorLocation({ lat: p0[0], lng: p0[1], heading: brng });
                  setSimulationIndex(0);
                  truckLat = p0[0];
                  truckLng = p0[1];
                }
                setIsSimulatingDrive(true);
              } else {
                // Real-World Mobile GPS Mode
                const lat = gpsTracker.position?.lat ?? geo.latitude ?? (routeData?.coordinates?.[0]?.[0] || -7.9826);
                const lng = gpsTracker.position?.lng ?? geo.longitude ?? (routeData?.coordinates?.[0]?.[1] || 112.6308);
                const heading = gpsTracker.position?.heading ?? 0;
                setCollectorLocation({ lat, lng, heading });
                setIsSimulatingDrive(false);
                truckLat = lat;
                truckLng = lng;
              }
              // Immediately center camera on truck at driving zoom
              if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
                mapInstanceRef.current.flyTo([truckLat, truckLng], 16, {
                  duration: 0.9,
                  easeLinearity: 0.25,
                });
              }
            } else if (st === "tahap_pengambilan" || st === "selesai" || st === "idle") {
              setIsSimulatingDrive(false);
            }
          }}
          isSimulatingDrive={isSimulatingDrive}
          onToggleSimulateDrive={() => setIsSimulatingDrive((prev) => !prev)}
          navigationMode={navigationMode}
          onNavigationModeChange={(mode) => {
            setNavigationMode(mode);
            if (mode === "gps") {
              setIsSimulatingDrive(false);
              if (gpsTracker.position) {
                setCollectorLocation({
                  lat: gpsTracker.position.lat,
                  lng: gpsTracker.position.lng,
                  heading: gpsTracker.position.heading,
                });
              }
            } else if (mode === "simulation" && pengepulMissionStatus === "otw") {
              setIsSimulatingDrive(true);
            }
          }}
          gpsAccuracy={gpsTracker.position?.accuracy ?? null}
          gpsSpeedKmh={gpsTracker.position?.speedKmh ?? 0}
          gpsError={gpsTracker.error}
          autoCenterGps={autoCenterGps}
          onToggleAutoCenterGps={() => {
            if (!autoCenterGps || isMapPannedAway) {
              handleRecenterOnTruck();
            } else {
              setAutoCenterGps(false);
              setIsMapPannedAway(true);
            }
          }}
          onRecenterTruck={handleRecenterOnTruck}
          isMapPannedAway={isMapPannedAway}
          onJumpNearTarget={() => {
            if (activeRouteReport) {
              const destLat = activeRouteReport.latitude;
              const destLng = activeRouteReport.longitude;
              const nearLat = destLat - 0.0003;
              const nearLng = destLng - 0.0003;
              const heading = 45;
              setCollectorLocation({
                lat: nearLat,
                lng: nearLng,
                heading,
              });
              setIsSimulatingDrive(false);
              updateTruckLocationApi({
                laporanId: activeRouteReport.id,
                pengepulId: user?.id || 30,
                latitude: nearLat,
                longitude: nearLng,
                heading,
                kecepatanKmh: 0,
                statusJemput: "menuju_lokasi",
              }).catch(() => {});
              if (typeof BroadcastChannel !== "undefined") {
                try {
                  const ch = new BroadcastChannel("uinic_armada_tracking");
                  ch.postMessage({
                    type: "TRUCK_LOCATION_UPDATE",
                    data: {
                      laporan_id: activeRouteReport.id,
                      pengepul_id: user?.id || 30,
                      pengepul_nama: user?.name || "Pak Joko (Mitra Pengepul)",
                      latitude: nearLat,
                      longitude: nearLng,
                      heading,
                      kecepatan_kmh: 0,
                      status_jemput: "menuju_lokasi",
                    },
                  });
                  ch.close();
                } catch {}
              }
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([nearLat, nearLng], 17, {
                  duration: 0.8,
                });
              }
            }
          }}
          onOpenVerificationModal={(rep) => {
            setVerificationTargetReport(rep);
            setIsVerificationModalOpen(true);
          }}
        />
      ) : selectedReport ? (
        <PlaceDetailDrawer
          report={selectedReport}
          allReports={reports}
          weather={currentWeather}
          user={user}
          roleViewMode={roleViewMode}
          onOpenTracker={(rep) => {
            setTrackingReport(rep);
            setIsTrackerModalOpen(true);
          }}
          onSelectReport={(rep) => {
            setSelectedReport(rep);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([rep.latitude, rep.longitude], 16, { duration: 0.8 });
            }
          }}
          onReportUpdated={(updatedRep) => {
            setSelectedReport(updatedRep);
            setReports((prev) =>
              prev.map((r) => (r.id === updatedRep.id ? updatedRep : r))
            );
          }}
          onReportDispatched={(repId) => {
            setDispatchedReportIds((prev) => [...new Set([...prev, repId])]);
          }}
          onClose={() => {
            setSelectedReport(null);
            handleCloseRoute();
          }}
          onOpenRoute={(rep) => {
            handleRequestRoute(rep);
          }}
          isRailVisible={Boolean(user)}
          isBookmarked={Boolean(selectedReport && bookmarkedIds.includes(selectedReport.id))}
          onToggleBookmark={(id) => {
            toggleBookmarkedId(id);
            setBookmarkedIds(getBookmarkedIds());
          }}
        />
      ) : null}

      {/* 3b. Floating Recenter on Truck Button (Google Maps Style - only shown when panned away) */}
      {activeRouteReport && isMapPannedAway && (
        <div className="fixed bottom-[125px] left-4 sm:bottom-8 sm:left-[440px] z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            type="button"
            onClick={handleRecenterOnTruck}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-xs font-black select-none",
              isMapPannedAway
                ? "bg-white text-[#0EB29A] border-2 border-[#0EB29A] scale-105 shadow-[#0EB29A]/30 hover:bg-[#0EB29A]/10 animate-pulse"
                : "bg-white/95 text-[#2B3752] border border-slate-200 hover:border-[#0EB29A] hover:bg-white backdrop-blur-md"
            )}
            title="Pusatkan kamera peta ke armada truk Anda menuju titik tujuan"
          >
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0",
                isMapPannedAway ? "bg-[#0EB29A] text-white" : "bg-[#0EB29A]/15 text-[#0EB29A]"
              )}
            >
              <Compass
                className={cn("h-4 w-4", isMapPannedAway ? "animate-spin" : "")}
                style={{ animationDuration: "4s" }}
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="leading-tight text-xs font-black">
                {isMapPannedAway ? "Pusatkan Kembali" : "Recentered"}
              </span>
              <span className="text-[9px] font-bold text-slate-400 leading-none">
                {isMapPannedAway
                  ? "Peta digeser • Ketuk untuk ikuti"
                  : `Mengikuti Arah (${cardinal.label})`}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* 3c. Floating Compass Needle & Cardinal Heading Widget (Google Maps Navigation Style) */}
      {activeRouteReport && (
        <div className="fixed top-20 right-4 sm:top-6 sm:right-6 z-30 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={() => {
              if (isMapPannedAway) {
                handleRecenterOnTruck();
              } else {
                setIsHeadingUpEnabled((prev) => !prev);
              }
            }}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-2xl shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-md select-none",
              isHeadingUpMode
                ? "shadow-[#0EB29A]/20"
                : ""
            )}
            title={
              isHeadingUpMode
                ? `Mode: Mengikuti Arah Kemudi (${cardinal.label} ${Math.round(((effectiveHeading % 360) + 360) % 360)}°). Ketuk untuk kunci arah Utara.`
                : "Mode: Kunci Arah Utara (North-Up). Ketuk untuk mengikuti arah kemudi."
            }
          >
            {/* Rotating Compass Dial */}
            <div className="relative w-7 h-7 rounded-full  border border-slate-300/80 flex items-center justify-center shadow-inner flex-shrink-0">
              {/* Compass Needle (Rotates to always point towards magnetic North) */}
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
                style={{
                  transform: `rotate(${mapRotation}deg)`,
                }}
              >
                {/* North Pointer (Red) */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[3px] border-x-transparent border-b-[8px] border-b-rose-600 drop-shadow-xs" />
                {/* Center Pin */}
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 z-10 border border-white" />
                {/* South Pointer (Slate) */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[3px] border-x-transparent border-t-[8px] border-t-slate-400" />
              </div>
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[7.5px] font-black text-rose-600 pointer-events-none">
                U
              </span>
            </div>

            {/* Direction & Degree Label */}
          
          </button>
        </div>
      )}

      {/* 3d. Floating Idle Alert Banner (Hidden truck notice when idle > 10 minutes) */}
      {isDriverIdle && (pengepulMissionStatus === "otw" || pengepulMissionStatus === "tahap_pengambilan") && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 text-white shadow-2xl backdrop-blur-md border border-amber-400/40 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span>Armada idle (&gt; 10 mnt) • Ikon disembunyikan</span>
            <button
              type="button"
              onClick={() => {
                setLastMovementTimestamp(Date.now());
                setIsDriverIdle(false);
                handleRecenterOnTruck();
              }}
              className="ml-1.5 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-[11px] shadow-sm cursor-pointer transition-all active:scale-95"
            >
              Aktifkan
            </button>
          </div>
        </div>
      )}

      {/* Quick Floating Banner when route is active but user is viewing place details */}
      {!activeRouteReport && routeData && selectedReport && (
        <div className="absolute top-20 sm:top-5 left-1/2 -translate-x-1/2 z-20 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => setActiveRouteReport(selectedReport)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 border border-[#0EB29A] text-[#2B3752] font-bold text-xs shadow-2xl hover:bg-slate-50 transition-all cursor-pointer backdrop-blur-md"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#0EB29A] animate-pulse" />
            <span>Rute Aktif: {routeData.formattedDuration} ({routeData.formattedDistance})</span>
            <span className="text-[#0EB29A] text-[11px] underline ml-1">Buka Petunjuk Arah →</span>
          </button>
        </div>
      )}

      {/* Floating Celebration Banner for Pengepul Cleanliness Reward */}
      {celebrationBanner && (
        <div className="absolute top-20 sm:top-5 left-1/2 -translate-x-1/2 z-40 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/98 border-2 border-emerald-500 text-[#2B3752] shadow-2xl backdrop-blur-md">
            <span className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-md">
              ✓
            </span>
            <div>
              <strong className="text-xs font-black text-emerald-900 block">
                Misi Pembersihan Berhasil! (+{celebrationBanner.points} Poin Diterima)
              </strong>
              <span className="text-[11px] text-slate-600 block">
                Skor Kebersihan AI: {celebrationBanner.score}/100 • Saldo poin Anda telah diperbarui.
              </span>
            </div>
            <button
              onClick={() => setCelebrationBanner(null)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 ml-2 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Prominent Floating Action Button (+) for Instant Reporting (Hidden on Mobile) */}
      {!activeRouteReport && (
        <div
          className={cn(
            "absolute right-6 bottom-8 z-30 flex-col items-end gap-3",
            selectedReport ? "hidden" : "hidden sm:flex"
          )}
        >
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2.5 h-14 px-5 rounded-full bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white font-bold text-sm shadow-2xl shadow-[#0EB29A]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white"
            title="Laporkan Titik Timbunan Sampah Baru (GPS & AI)"
          >
            <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
            <span className="tracking-tight">Lapor Sampah</span>
          </button>
        </div>
      )}

      {/* 5. Google Maps Bottom Left: Layer Switcher & Heatmap Popover (Hidden on Mobile) */}
      {!selectedReport && !activeRouteReport && (
        <div
          className={cn(
            "hidden sm:block absolute bottom-8 z-20 transition-all duration-300",
            user ? "left-4 sm:left-[84px]" : "left-6"
          )}
        >
        {/* Layer Popover Menu */}
        {isLayerMenuOpen && (
          <div className="mb-2 p-3.5 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 text-[#2B3752] space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-[#2B3752]">Lapisan Peta</span>
              <button
                type="button"
                onClick={() => setIsLayerMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Base Map Options */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Peta Dasar
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMapLayer("streets")}
                  className={cn(
                    "p-2 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer relative",
                    mapLayer === "streets"
                      ? "border-[#0EB29A] bg-[#0EB29A]/10 text-[#0EB29A] font-bold shadow-xs"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  )}
                >
                  <div className="h-8 w-full rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <Compass className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] leading-tight">Peta Jalan</span>
                  {mapLayer === "streets" && (
                    <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-[#0EB29A] text-white flex items-center justify-center text-[8px]">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMapLayer("satellite")}
                  className={cn(
                    "p-2 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer relative",
                    mapLayer === "satellite"
                      ? "border-[#0EB29A] bg-[#0EB29A]/10 text-[#0EB29A] font-bold shadow-xs"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  )}
                >
                  <div className="h-8 w-full rounded-lg bg-slate-800 flex items-center justify-center text-slate-200">
                    <Layers className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] leading-tight">Citra Satelit</span>
                  {mapLayer === "satellite" && (
                    <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-[#0EB29A] text-white flex items-center justify-center text-[8px]">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Overlays / Analysis Layer: Hazard Zones & Heatmap */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Analisis Kepadatan & Risiko
              </span>

              {/* Hazard Buffer Zones Toggle */}
              <button
                type="button"
                onClick={() => setShowHazardZones(!showHazardZones)}
                className={cn(
                  "w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer",
                  showHazardZones
                    ? "border-rose-400 bg-rose-500/10 text-rose-950 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-7 w-7 rounded-lg flex items-center justify-center shadow-xs",
                      showHazardZones
                        ? "bg-gradient-to-tr from-rose-500 to-red-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-tight">Zona Bahaya Bencana</span>
                    <span className="text-[10px] text-slate-500">Radius luapan & metana</span>
                  </div>
                </div>

                <div
                  className={cn(
                    "w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out",
                    showHazardZones ? "bg-rose-500" : "bg-slate-200"
                  )}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out",
                      showHazardZones ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </div>
              </button>

              {/* Heatmap Toggle */}
              <button
                type="button"
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={cn(
                  "w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer",
                  showHeatmap
                    ? "border-amber-400 bg-amber-500/10 text-amber-900 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-7 w-7 rounded-lg flex items-center justify-center shadow-xs",
                      showHeatmap
                        ? "bg-gradient-to-tr from-orange-500 to-red-500 text-white"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    <Flame className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-tight">Heatmap Sebaran</span>
                    <span className="text-[10px] text-slate-500">Gradien volume & risiko</span>
                  </div>
                </div>

                <div
                  className={cn(
                    "w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out",
                    showHeatmap ? "bg-orange-500" : "bg-slate-200"
                  )}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out",
                      showHeatmap ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Main Trigger Button */}
        <button
          type="button"
          onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
          className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-white shadow-xl shadow-slate-200/70 border border-slate-200/90 hover:scale-105 transition-all cursor-pointer"
          title="Ubah Lapisan & Zona Bahaya Peta"
        >
          <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-200 bg-[#2B3752] flex items-center justify-center text-white relative">
            <Layers className="h-5 w-5" />
            {showHazardZones && (
              <span className="absolute -top-1 -left-1 h-3.5 w-3.5 rounded-full bg-rose-500 border border-white flex items-center justify-center shadow-xs">
                <AlertTriangle className="h-2 w-2 text-white" />
              </span>
            )}
            {showHeatmap && (
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-orange-500 border border-white flex items-center justify-center shadow-xs">
                <Flame className="h-2 w-2 text-white" />
              </span>
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-[#2B3752]">Lapisan</span>
            <span className="text-[10px] text-slate-400 font-medium capitalize">
              {showHazardZones && showHeatmap
                ? "Bahaya + Panas 🔥"
                : showHazardZones
                ? "Zona Bahaya ⚠️"
                : showHeatmap
                ? "Peta + Heatmap 🔥"
                : mapLayer === "streets"
                ? "Peta Jalan"
                : "Citra Satelit"}
            </span>
          </div>
        </button>
      </div>
      )}

      {/* Heatmap Density Legend (when heatmap is enabled) */}
      {showHeatmap && (
        <div className="absolute bottom-8 right-[200px] z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200/90 text-xs space-y-1.5 animate-in fade-in slide-in-from-bottom-2 hidden sm:block">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-[#2B3752] flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-rose-500" />
              <span>Kepadatan Sampah</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">AI & Volume</span>
          </div>
          <div className="h-2.5 w-44 rounded-full bg-gradient-to-r from-[#0EB29A] via-[#eab308] to-[#ef4444] shadow-inner" />
          <div className="flex justify-between text-[9px] text-slate-500 font-bold">
            <span>Rendah</span>
            <span>Sedang</span>
            <span className="text-red-600 font-black">Kritis (Hotspot)</span>
          </div>
        </div>
      )}

      {/* 6. Google Maps Bottom Right: Zoom & My Location Controls */}
      <div className="absolute right-6 bottom-28 z-20 flex flex-col gap-2">
        <button
          onClick={handleFlyToMyLocation}
          className="h-10 w-10 rounded-xl bg-white shadow-xl shadow-slate-200/70 border border-slate-200/90 flex items-center justify-center text-[#2B3752] hover:text-[#0EB29A] hover:bg-slate-50 transition-colors cursor-pointer"
          title="Lokasi Saya"
        >
          <Locate className="h-5 w-5" />
        </button>

        <div className="flex flex-col rounded-xl bg-white shadow-xl shadow-slate-200/70 border border-slate-200/90 overflow-hidden divide-y divide-slate-100">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="h-9 w-10 flex items-center justify-center text-[#2B3752] hover:text-[#0EB29A] hover:bg-slate-50 transition-colors cursor-pointer"
            title="Perbesar"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="h-9 w-10 flex items-center justify-center text-[#2B3752] hover:text-[#0EB29A] hover:bg-slate-50 transition-colors cursor-pointer"
            title="Perkecil"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 7. Side Navigation Drawer (Google Maps Hamburger Menu) */}
      {isSideMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSideMenuOpen(false)}
          />
          <div className="relative z-10 w-80 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-200 border-r border-slate-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#0EB29A] to-[#2E6E65] text-white flex items-center justify-center font-bold shadow-md shadow-[#0EB29A]/30">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#2B3752]">{siteConfig.name}</h3>
                  <span className="text-[10px] text-[#0EB29A] font-bold">AI Multi-Hazard Maps</span>
                </div>
              </div>
              <button
                onClick={() => setIsSideMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-[#2B3752] rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="my-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-[#0EB29A] text-white font-bold text-xs flex items-center justify-center">
                  {user ? user.name.slice(0, 2).toUpperCase() : "TM"}
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#2B3752] block truncate max-w-[130px]">
                    {user ? user.name : "Tamu (Belum Masuk)"}
                  </strong>
                  <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                    {user
                      ? user.role === "admin"
                        ? "Administrator DLH"
                        : "Warga Teladan"
                      : "Mode Tamu"}
                  </span>
                </div>
              </div>
              {user ? (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Coins className="h-3.5 w-3.5" />
                  <span>{user.poin} Poin</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsSideMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#0EB29A] rounded-lg hover:bg-[#2E6E65] transition-colors cursor-pointer"
                >
                  Masuk
                </button>
              )}
            </div>

            {/* Menu Links */}
            <div className="flex-1 py-2 space-y-1 overflow-y-auto text-xs font-semibold">
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setIsSideMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#0EB29A]/15 text-[#2E6E65] font-bold"
              >
                <Compass className="h-4 w-4 text-[#0EB29A]" />
                <span>Peta Radar Utama</span>
              </button>

              <Link
                href="/peringatan"
                onClick={() => setIsSideMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#2B3752] hover:bg-slate-50 transition-colors"
              >
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <span>Pusat Peringatan Dini</span>
              </Link>

              <Link
                href="/rewards"
                onClick={() => setIsSideMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#2B3752] hover:bg-slate-100 transition-colors"
              >
                <Gift className="h-4 w-4 text-amber-500" />
                <span>Katalog Rewards Poin</span>
              </Link>

              <Link
                href="/edukasi"
                onClick={() => setIsSideMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#2B3752] hover:bg-slate-100 transition-colors"
              >
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span>Panduan Pilah Sampah</span>
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setIsSideMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#2B3752] hover:bg-slate-100 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-purple-500" />
                <span>Portal Dashboard</span>
              </Link>

              {user && (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsSideMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-left font-semibold cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  <span>Keluar Akun</span>
                </button>
              )}

              <div className="pt-3 pb-1 border-t border-slate-100 text-[10px] uppercase font-bold text-slate-400 px-3">
                Integrasi Admin
              </div>

              <a
                href={siteConfig.links.backendAdmin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[#2B3752] hover:bg-slate-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#0EB29A]" />
                  Admin Command Center
                </span>
                <ExternalLink className="h-3.5 w-3.5 opacity-50" />
              </a>
            </div>

            {/* Footer Emergency info */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center justify-between">
                <span>Call Center BPBD:</span>
                <strong className="text-red-600 font-bold">112</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Dinas Lingkungan Hidup:</span>
                <strong className="text-[#2B3752] font-bold">0811-3000-888</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal Lapor Baru (Auto-GPS + Weather + Gemini Vision) */}
      <CreateReportModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onReportCreated={handleReportCreated}
      />

      {/* 9. Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setRoleViewMode(loggedInUser.role === "pengepul" ? "pengepul" : "warga");
        }}
      />

      {/* 10. Modal Verifikasi Kebersihan & Reward Pengepul */}
      {user && verificationTargetReport && (
        <PengepulVerificationModal
          isOpen={isVerificationModalOpen}
          onClose={() => {
            setIsVerificationModalOpen(false);
            setVerificationTargetReport(null);
          }}
          report={verificationTargetReport}
          user={user}
          onVerificationSuccess={(updatedReport, awardedPoints, aiResult) => {
            // Update reports state
            setReports((prev) =>
              prev.map((r) => (r.id === updatedReport.id ? updatedReport : r))
            );
            if (selectedReport?.id === updatedReport.id) {
              setSelectedReport(updatedReport);
            }
            if (activeRouteReport?.id === updatedReport.id) {
              setActiveRouteReport(updatedReport);
            }

            // Update user reward points in state & localStorage
            const updatedUser: User = {
              ...user,
              poin: (user.poin || 0) + awardedPoints,
            };
            setUser(updatedUser);
            setStoredSession(updatedUser);

            // Update mission status
            setPengepulMissionStatus("selesai");

            if (typeof BroadcastChannel !== "undefined") {
              try {
                const ch = new BroadcastChannel("uinic_armada_tracking");
                ch.postMessage({
                  type: "TRUCK_MISSION_FINISHED",
                  laporan_id: updatedReport.id,
                });
                ch.close();
              } catch {}
            }

            // Show celebration banner on map
            setCelebrationBanner({
              title: updatedReport.alamat_lokasi,
              points: awardedPoints,
              score: aiResult.skor_kebersihan,
            });

            // Smoothly close route after short delay
            setTimeout(() => {
              handleCloseRoute();
            }, 2500);
          }}
        />
      )}

      {/* 11. Modal Edit Profil Akun Mitra */}
      {user && (
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          user={user}
          onProfileUpdated={(updatedUser) => {
            setUser(updatedUser);
            setStoredSession(updatedUser);

            if (typeof BroadcastChannel !== "undefined") {
              try {
                const ch = new BroadcastChannel("uinic_armada_tracking");
                ch.postMessage({
                  type: "USER_PROFILE_UPDATED",
                  user: updatedUser,
                });
                ch.close();
              } catch {}
            }
          }}
        />
      )}

      {/* 12. Mobile Bottom Navigation Bar (Fixed on mobile screens) */}
      {showMobileNav && !activeRouteReport && (
        <MobileNav />
      )}

      {/* 13. Citizen Live Delivery Tracker Modal */}
      <CitizenReportTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        report={trackingReport || selectedReport || reports[0] || null}
        onViewOnMap={(rep) => {
          setSelectedReport(rep);
          handleRecenterOnTruck();
        }}
      />
    </div>
  );
}
