"use client";

import { useState, useEffect } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: -7.9826, // Malang default
    longitude: 112.6308,
    accuracy: null,
    error: null,
    isLoading: false,
  });

  const fetchLocation = (highAccuracy = true) => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    setState((prev) => ({ ...prev, isLoading: true }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          error: error.message,
          isLoading: false,
        }));
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  };

  useEffect(() => {
    fetchLocation(true);

    // Auto-sync when permission status changes (e.g. user toggles Allow in browser)
    if (typeof navigator !== "undefined" && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((permissionStatus) => {
          permissionStatus.onchange = () => {
            if (permissionStatus.state === "granted") {
              fetchLocation(true);
            }
          };
        })
        .catch(() => {});
    }
  }, []);

  const refresh = () => {
    fetchLocation(true);
  };

  return { ...state, refresh };
}
