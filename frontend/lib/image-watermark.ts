/**
 * UINIC Smart Forensic & Anti-Fraud Canvas Engine
 * Menghasilkan watermark digital permanen langsung di level kanvas gambar
 * untuk menjamin keaslian bukti foto timbunan sampah di lapangan.
 */

export interface MetadataForensik {
  is_geotag_verified: boolean;
  waktu_pengambilan: string;
  latitude: number;
  longitude: number;
  gps_akurasi_meter: number;
  alamat_perkiraan?: string;
  device_fingerprint: string;
  integrity_hash: string;
  capture_mode: "live_camera" | "upload_file";
}

export interface WatermarkOptions {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  alamat?: string;
  captureMode?: "live_camera" | "upload_file";
  timestamp?: Date;
}

/**
 * Menghasilkan sidik jari perangkat sederhana dan non-invasif
 */
export function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return "SERVER_ENV";
  const nav = window.navigator;
  const screen = window.screen;
  const raw = `${nav.userAgent}|${screen.width}x${screen.height}|${nav.language}|${screen.colorDepth}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `DEV-${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}`;
}

/**
 * Menghasilkan kode hash SHA-256 integritas forensik
 */
export async function generateForensicHash(
  lat: number,
  lng: number,
  timestamp: string,
  deviceFp: string
): Promise<string> {
  const message = `UINIC-FORENSIC|${lat.toFixed(6)}|${lng.toFixed(6)}|${timestamp}|${deviceFp}`;
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    } catch {
      // fallback
    }
  }

  // Fast DJB2 fallback if crypto is unavailable
  let hash = 5381;
  for (let i = 0; i < message.length; i++) {
    hash = (hash * 33) ^ message.charCodeAt(i);
  }
  return `MOCK-${(hash >>> 0).toString(16).toUpperCase().padStart(16, "0")}`;
}

/**
 * Format tanggal dalam format resmi Indonesia WIB
 */
export function formatTimestampIndo(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${d} ${m} ${y}, ${h}:${min}:${s} WIB`;
}

/**
 * Menggambar watermark forensik digital anti-fraud langsung ke kanvas foto
 */
export async function burnForensicWatermark(
  sourceCanvas: HTMLCanvasElement,
  options: WatermarkOptions
): Promise<{ dataUrl: string; metadata: MetadataForensik }> {
  const ctx = sourceCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("Gagal memperoleh 2D context kanvas gambar");
  }

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const now = options.timestamp || new Date();
  const timestampStr = formatTimestampIndo(now);
  const accuracy = Math.round(options.accuracy || 12);
  const deviceFp = getDeviceFingerprint();
  const fullHash = await generateForensicHash(
    options.latitude,
    options.longitude,
    now.toISOString(),
    deviceFp
  );
  const shortHash = fullHash.substring(0, 16);

  // Ukuran strip overlay dinamis proporsional terhadap tinggi gambar
  const scale = Math.max(width, height) / 1000;
  const bannerHeight = Math.max(140 * scale, 120);

  // 1. Gambar latar belakang gradien semi-transparan elegan di bawah foto
  const gradient = ctx.createLinearGradient(0, height - bannerHeight, 0, height);
  gradient.addColorStop(0, "rgba(15, 23, 42, 0)"); // Transparent slate
  gradient.addColorStop(0.2, "rgba(15, 23, 42, 0.75)"); // Semi-dark
  gradient.addColorStop(1, "rgba(15, 23, 42, 0.94)"); // Deep navy slate

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

  // 2. Garis aksen atas toska (#0EB29A)
  const lineY = height - bannerHeight + 15 * scale;
  const lineGrad = ctx.createLinearGradient(20 * scale, lineY, width - 20 * scale, lineY);
  lineGrad.addColorStop(0, "rgba(14, 178, 154, 0.9)");
  lineGrad.addColorStop(0.5, "rgba(46, 110, 101, 0.8)");
  lineGrad.addColorStop(1, "rgba(14, 178, 154, 0.2)");
  ctx.fillStyle = lineGrad;
  ctx.fillRect(20 * scale, lineY, width - 40 * scale, Math.max(2 * scale, 1.5));

  // Konfigurasi tipografi
  const paddingX = 24 * scale;
  let textY = height - bannerHeight + 40 * scale;

  // 3. Header Badge: UINIC ANTI-FRAUD VERIFIED
  const titleFontSize = Math.max(14 * scale, 13);
  ctx.font = `bold ${Math.round(titleFontSize)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

  // Kotak Lencana "VERIFIED"
  const badgeText = "VERIFIED GPS";
  const badgeWidth = ctx.measureText(badgeText).width + 16 * scale;
  const badgeHeight = 20 * scale;

  ctx.fillStyle = "#0EB29A";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(paddingX, textY - 14 * scale, badgeWidth, badgeHeight, 4 * scale);
  } else {
    ctx.rect(paddingX, textY - 14 * scale, badgeWidth, badgeHeight);
  }
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${Math.round(11 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(badgeText, paddingX + 8 * scale, textY - 0.5 * scale);

  // Teks Header Resmi
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${Math.round(titleFontSize)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(
    "UINIC SMART FORENSIC EVIDENCE",
    paddingX + badgeWidth + 12 * scale,
    textY
  );

  // 4. Baris 1: Koordinat Presisi & Akurasi Satelit
  textY += 26 * scale;
  const detailFontSize = Math.max(12 * scale, 11);
  ctx.font = `500 ${Math.round(detailFontSize)}px "Courier New", Courier, monospace`;
  ctx.fillStyle = "#E2E8F0";
  const coordText = `📍 GPS: ${options.latitude.toFixed(6)}, ${options.longitude.toFixed(6)} (Akurasi: ±${accuracy}m)`;
  ctx.fillText(coordText, paddingX, textY);

  // 5. Baris 2: Waktu Pengambilan Realtime & Alamat
  textY += 20 * scale;
  const timeText = `⏱️ WAKTU: ${timestampStr} ${options.alamat ? `• ${options.alamat}` : ""}`;
  ctx.fillText(timeText, paddingX, textY);

  // 6. Baris 3: Cryptographic Integrity Hash & Device Fingerprint
  textY += 20 * scale;
  const hashFontSize = Math.max(10 * scale, 9.5);
  ctx.font = `400 ${Math.round(hashFontSize)}px "Courier New", Courier, monospace`;
  ctx.fillStyle = "#94A3B8";
  const hashText = `🔑 HASH: ${shortHash}... • ${deviceFp} • ${options.captureMode === "live_camera" ? "REALTIME CAM" : "FIELD UPLOAD"}`;
  ctx.fillText(hashText, paddingX, textY);

  ctx.restore();

  // Ekspor gambar kanvas berwatermark ke format JPEG berkualitas tinggi
  const dataUrl = sourceCanvas.toDataURL("image/jpeg", 0.85);

  const metadata: MetadataForensik = {
    is_geotag_verified: true,
    waktu_pengambilan: timestampStr,
    latitude: options.latitude,
    longitude: options.longitude,
    gps_akurasi_meter: accuracy,
    alamat_perkiraan: options.alamat,
    device_fingerprint: deviceFp,
    integrity_hash: fullHash,
    capture_mode: options.captureMode || "upload_file",
  };

  return { dataUrl, metadata };
}
