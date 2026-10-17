"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { calculateBearing } from "@/lib/routing";

export interface GpsPosition {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number;
  speed: number; // m/s
  speedKmh: number;
  timestamp: number;
}

export interface UseGpsTrackerOptions {
  enabled?: boolean;
  highAccuracy?: boolean;
  minDistanceMeters?: number; // Only fire if moved by at least X meters
  onLocationUpdate?: (pos: GpsPosition) => void;
}

/**
 * Hook for high-precision real-time GPS tracking (navigator.geolocation.watchPosition)
 * Specifically optimized for mobile road trips, driving, and live vehicle navigation.
 */
export function useGpsTracker(options: UseGpsTrackerOptions = {}) {
  const {
    enabled = false,
    highAccuracy = true,
    minDistanceMeters = 1,
    onLocationUpdate,
  } = options;

  const [position, setPosition] = useState<GpsPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prevPositionRef = useRef<GpsPosition | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const onLocationUpdateRef = useRef(onLocationUpdate);

  useEffect(() => {
    onLocationUpdateRef.current = onLocationUpdate;
  }, [onLocationUpdate]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const startTracking = useCallback(() => {
    if (typeof window === "undefined" || !navigator?.geolocation) {
      if (typeof window !== "undefined" && !window.isSecureContext) {
        setError(
          "Sensor GPS diblokir karena koneksi HTTP non-SSL. Pada HP Android, buka chrome://flags/#unsafely-treat-insecure-origin-as-secure dan tambahkan origin URL ini."
        );
      } else {
        setError("Perangkat atau browser Anda tidak mendukung Geolocation GPS.");
      }
      return;
    }

    stopTracking();
    setError(null);
    setIsTracking(true);

    const geoOptions: PositionOptions = {
      enableHighAccuracy: highAccuracy,
      maximumAge: 1000, // Only accept fresh GPS fixes
      timeout: 10000,
    };

    const handleSuccess = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = pos.coords.accuracy || 10;
      const timestamp = pos.timestamp || Date.now();

      let heading = pos.coords.heading ?? 0;
      let rawSpeed = pos.coords.speed ?? 0;

      // If device doesn't supply heading or speed, compute from delta
      const prev = prevPositionRef.current;
      if (prev) {
        const dLat = (lat - prev.lat) * (Math.PI / 180);
        const dLng = (lng - prev.lng) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(prev.lat * (Math.PI / 180)) *
            Math.cos(lat * (Math.PI / 180)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distMeters = 6371000 * c;

        // Skip jitter if stationary (< minDistanceMeters)
        if (distMeters < minDistanceMeters) {
          return;
        }

        if (!pos.coords.heading && distMeters > 2) {
          heading = calculateBearing(prev.lat, prev.lng, lat, lng);
        }

        if (!pos.coords.speed && timestamp > prev.timestamp) {
          const timeSec = (timestamp - prev.timestamp) / 1000;
          if (timeSec > 0) {
            rawSpeed = distMeters / timeSec;
          }
        }
      }

      const speedKmh = Math.max(0, Math.round(rawSpeed * 3.6));

      const newPos: GpsPosition = {
        lat,
        lng,
        accuracy: Math.round(accuracy),
        heading: Math.round(heading),
        speed: Math.round(rawSpeed * 10) / 10,
        speedKmh,
        timestamp,
      };

      prevPositionRef.current = newPos;
      setPosition(newPos);
      if (onLocationUpdateRef.current) {
        onLocationUpdateRef.current(newPos);
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      let msg = "Terjadi kendala saat membaca sensor GPS.";
      if (err.code === err.PERMISSION_DENIED) {
        msg = "Izin akses lokasi GPS ditolak oleh browser/HP.";
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        msg = "Sinyal GPS satelit tidak terdeteksi. Pastikan GPS HP dalam mode Akurasi Tinggi.";
      } else if (err.code === err.TIMEOUT) {
        msg = "Batas waktu pembacaan sinyal GPS terlampaui.";
      }
      setError(msg);
    };

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        geoOptions
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengaktifkan watchPosition GPS.");
      setIsTracking(false);
    }
  }, [highAccuracy, minDistanceMeters, stopTracking]);

  useEffect(() => {
    if (enabled) {
      startTracking();
    } else {
      stopTracking();
    }
    return () => {
      stopTracking();
    };
  }, [enabled, startTracking, stopTracking]);

  const isSecure = typeof window !== "undefined" ? window.isSecureContext : true;

  return {
    position,
    isTracking,
    error,
    isSecure,
    startTracking,
    stopTracking,
  };
}
