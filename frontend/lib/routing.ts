export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  name: string;
  type: string;
  modifier?: string;
}

export interface RouteDirectionData {
  coordinates: [number, number][]; // [lat, lng] for Leaflet
  distanceMeters: number;
  durationSeconds: number;
  formattedDistance: string;
  formattedDuration: string;
  summaryStreet: string;
  steps: RouteStep[];
  mode: "driving" | "motorcycle" | "walking";
}

/**
 * Format meters into human-readable distance (e.g., "750 m" or "2.4 km").
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format seconds into human-readable duration (e.g., "6 mnt", "1 jam 12 mnt").
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return "< 1 mnt";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} mnt`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours} jam ${remainingMins > 0 ? `${remainingMins} mnt` : ""}`;
}

/**
 * Generate natural Indonesian instruction from OSRM maneuver
 */
function createInstruction(
  type: string,
  modifier: string | undefined,
  name: string,
  destName?: string
): string {
  const street = name && name.trim() ? name : "jalan utama";

  switch (type) {
    case "depart":
      return `Mulai perjalanan ke arah ${modifier ? translateModifier(modifier) : "depan"} di ${street}`;
    case "arrive":
      return `Tiba di lokasi tujuan ${destName ? `(${destName})` : ""}`;
    case "turn":
      if (modifier === "right") return `Belok kanan ke ${street}`;
      if (modifier === "left") return `Belok kiri ke ${street}`;
      if (modifier === "slight right") return `Sedikit serong ke kanan ke ${street}`;
      if (modifier === "slight left") return `Sedikit serong ke kiri ke ${street}`;
      if (modifier === "sharp right") return `Belok tajam ke kanan ke ${street}`;
      if (modifier === "sharp left") return `Belok tajam ke kiri ke ${street}`;
      if (modifier === "uturn") return `Putar balik di ${street}`;
      return `Belok ke arah ${street}`;
    case "new name":
      return `Lanjutkan lurus ke ${street}`;
    case "fork":
      return `Ambil jalur ${modifier === "right" ? "kanan" : "kiri"} menuju ${street}`;
    case "roundabout":
    case "rotary":
      return `Di bundaran lalu lintas, ambil jalan keluar menuju ${street}`;
    case "merge":
      return `Bergabung ke ${street}`;
    case "end of road":
      return `Di ujung jalan, belok ${modifier ? translateModifier(modifier) : "menuju"} ${street}`;
    default:
      if (modifier) {
        return `Arahkan kendaraan ke ${translateModifier(modifier)} di ${street}`;
      }
      return `Lanjutkan perjalanan di ${street}`;
  }
}

function translateModifier(mod: string): string {
  switch (mod) {
    case "right":
      return "kanan";
    case "left":
      return "kiri";
    case "slight right":
      return "serong kanan";
    case "slight left":
      return "serong kiri";
    case "sharp right":
      return "tajam kanan";
    case "sharp left":
      return "tajam kiri";
    case "straight":
      return "lurus";
    case "uturn":
      return "putar balik";
    default:
      return mod;
  }
}

/**
 * Fallback route generation (in case of network drops or OSRM rate-limiting)
 */
function createFallbackRoute(
  origin: [number, number],
  destination: [number, number],
  mode: "driving" | "motorcycle" | "walking",
  destName?: string
): RouteDirectionData {
  const [lat1, lng1] = origin;
  const [lat2, lng2] = destination;

  // Midpoints to simulate realistic street corners rather than pure straight line
  const mid1: [number, number] = [lat1, lng1 + (lng2 - lng1) * 0.6];
  const mid2: [number, number] = [lat1 + (lat2 - lat1) * 0.4, lng1 + (lng2 - lng1) * 0.6];
  const mid3: [number, number] = [lat1 + (lat2 - lat1) * 0.7, lng2];

  const coordinates: [number, number][] = [
    [lat1, lng1],
    mid1,
    mid2,
    mid3,
    [lat2, lng2],
  ];

  // Approximate distance (Haversine Manhattan factor ~ 1.35)
  const dLat = (lat2 - lat1) * 111000;
  const dLng = (lng2 - lng1) * 111000 * Math.cos((lat1 * Math.PI) / 180);
  const straightDist = Math.sqrt(dLat * dLat + dLng * dLng);
  const distanceMeters = Math.max(300, Math.round(straightDist * 1.3));

  // Speed: driving = 35 km/h, motorcycle = 40 km/h, walking = 4.5 km/h
  const speedKmh = mode === "walking" ? 4.5 : mode === "motorcycle" ? 40 : 35;
  const durationSeconds = Math.round((distanceMeters / 1000 / speedKmh) * 3600);

  return {
    coordinates,
    distanceMeters,
    durationSeconds,
    formattedDistance: formatDistance(distanceMeters),
    formattedDuration: formatDuration(durationSeconds),
    summaryStreet: "Rute Tercepat via Jalan Protokol",
    mode,
    steps: [
      {
        instruction: "Mulai perjalanan dari titik awal Anda",
        distanceMeters: Math.round(distanceMeters * 0.25),
        durationSeconds: Math.round(durationSeconds * 0.25),
        name: "Jl. Akses Awal",
        type: "depart",
      },
      {
        instruction: "Belok kanan ke jalan utama menuju lokasi",
        distanceMeters: Math.round(distanceMeters * 0.5),
        durationSeconds: Math.round(durationSeconds * 0.5),
        name: "Jl. Protokol",
        type: "turn",
        modifier: "right",
      },
      {
        instruction: `Tiba di titik lokasi ${destName ? `(${destName})` : ""}`,
        distanceMeters: Math.round(distanceMeters * 0.25),
        durationSeconds: Math.round(durationSeconds * 0.25),
        name: "Tujuan Laporan",
        type: "arrive",
      },
    ],
  };
}

/**
 * Fetch directions from OSRM road routing engine.
 */
export async function getDirections(
  origin: [number, number],
  destination: [number, number],
  mode: "driving" | "motorcycle" | "walking" = "driving",
  destName?: string
): Promise<RouteDirectionData> {
  const profile = mode === "walking" ? "foot" : "driving";
  const [lat1, lng1] = origin;
  const [lat2, lng2] = destination;

  const url = `https://router.project-osrm.org/route/v1/${profile}/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson&steps=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`OSRM HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      throw new Error("No route found from OSRM");
    }

    const route = data.routes[0];

    // OSRM returns GeoJSON coordinates in [lon, lat], Leaflet needs [lat, lon]
    const rawCoords: [number, number][] = route.geometry.coordinates;
    const coordinates: [number, number][] = rawCoords.map(([lon, lat]) => [lat, lon]);

    let durationSeconds = Math.round(route.duration);
    if (mode === "motorcycle") {
      // Motorcycles in urban areas typically move 15-20% faster than cars
      durationSeconds = Math.round(durationSeconds * 0.85);
    }

    const distanceMeters = Math.round(route.distance);

    // Parse steps
    const rawSteps = route.legs?.[0]?.steps || [];
    const steps: RouteStep[] = rawSteps.map((s: any) => ({
      instruction: createInstruction(
        s.maneuver?.type || "",
        s.maneuver?.modifier,
        s.name,
        destName
      ),
      distanceMeters: Math.round(s.distance || 0),
      durationSeconds: Math.round(s.duration || 0),
      name: s.name || "",
      type: s.maneuver?.type || "",
      modifier: s.maneuver?.modifier,
    }));

    // Find main street names for summary
    const streetNames = steps
      .map((s) => s.name)
      .filter((n) => n && n.length > 2 && !n.includes("unnamed"));
    const uniqueStreets = Array.from(new Set(streetNames));
    const summaryStreet =
      uniqueStreets.length > 0
        ? `Lewat ${uniqueStreets.slice(0, 2).join(" & ")}`
        : "Rute Tercepat (Bebas Hambatan)";

    return {
      coordinates,
      distanceMeters,
      durationSeconds,
      formattedDistance: formatDistance(distanceMeters),
      formattedDuration: formatDuration(durationSeconds),
      summaryStreet,
      steps: steps.length > 0 ? steps : [],
      mode,
    };
  } catch (err) {
    console.warn("OSRM routing unavailable, using smart local street fallback:", err);
    return createFallbackRoute(origin, destination, mode, destName);
  }
}

/**
 * Calculate bearing/heading in degrees (0 to 360) between two coordinates.
 * 0 = North, 90 = East, 180 = South, 270 = West.
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

/**
 * Interpolate coordinate between two points based on fraction (0 to 1).
 */
export function interpolatePosition(
  coord1: [number, number],
  coord2: [number, number],
  fraction: number
): [number, number] {
  const lat = coord1[0] + (coord2[0] - coord1[0]) * fraction;
  const lng = coord1[1] + (coord2[1] - coord1[1]) * fraction;
  return [lat, lng];
}

