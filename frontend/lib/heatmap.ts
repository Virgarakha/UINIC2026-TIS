/**
 * Leaflet Heatmap Layer Utility
 * Membangun visualisasi peta panas (heat density) untuk sebaran timbunan sampah
 */

export interface HeatmapOptions {
  radius?: number;
  blur?: number;
  maxZoom?: number;
  max?: number;
  minOpacity?: number;
  gradient?: Record<number, string>;
}

export async function createHeatLayer(
  L: any,
  points: [number, number, number][],
  options: HeatmapOptions = {}
) {
  if (typeof window === "undefined" || !L) return null;

  try {
    // Ensure L is on global window object for leaflet.heat UMD definition
    (window as any).L = L;
    await import("leaflet.heat");

    if (typeof (L as any).heatLayer === "function") {
      const defaultOptions: HeatmapOptions = {
        radius: 35,
        blur: 22,
        maxZoom: 16,
        max: 1.0,
        minOpacity: 0.35,
        gradient: {
          0.15: "#0EB29A", // Low density (Brand Teal)
          0.35: "#3b82f6", // Medium-low (Blue)
          0.55: "#eab308", // Medium (Yellow)
          0.75: "#f97316", // High (Orange)
          1.0: "#ef4444",  // Critical Hotspot (Red)
        },
        ...options,
      };

      return (L as any).heatLayer(points, defaultOptions);
    }
  } catch (err) {
    console.warn("Failed to initialize Leaflet heatLayer:", err);
  }

  return null;
}
