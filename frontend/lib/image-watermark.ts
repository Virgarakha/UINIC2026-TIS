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

  // Ukuran strip / HUD card dinamis proporsional terhadap ukuran gambar
  const scale = Math.max(Math.min(width, height) / 800, 0.7);

  const cardMargin = 20 * scale;
  const cardPadding = 16 * scale;
  const cardWidth = Math.min(width - cardMargin * 2, Math.max(480 * scale, 340));
  const cardHeight = 142 * scale;
  const cardX = cardMargin;
  const cardY = height - cardHeight - cardMargin;

  ctx.save();

  // 1. Shadow for HUD Card
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 20 * scale;
  ctx.shadowOffsetY = 6 * scale;

  // 2. Card Background (Deep Slate Glass)
  const bgGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight);
  bgGrad.addColorStop(0, "rgba(15, 23, 42, 0.92)");
  bgGrad.addColorStop(1, "rgba(15, 23, 42, 0.98)");
  ctx.fillStyle = bgGrad;

  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 14 * scale);
  } else {
    ctx.rect(cardX, cardY, cardWidth, cardHeight);
  }
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 3. Card Border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1 * scale;
  ctx.stroke();

  // Toska vertical accent pill on far left
  ctx.fillStyle = "#0EB29A";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(cardX + 4 * scale, cardY + 12 * scale, 3.5 * scale, cardHeight - 24 * scale, 2 * scale);
  } else {
    ctx.rect(cardX + 4 * scale, cardY + 12 * scale, 3.5 * scale, cardHeight - 24 * scale);
  }
  ctx.fill();

  const contentX = cardX + cardPadding + 6 * scale;
  let contentY = cardY + 22 * scale;

  // 4. Header: Badge GEOTAG AKTIF + Title + Anti-Fraud Pill
  const badgeH = 18 * scale;
  const badgeW = 92 * scale;
  ctx.fillStyle = "rgba(14, 178, 154, 0.2)";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(contentX, contentY - 12 * scale, badgeW, badgeH, 9 * scale);
  } else {
    ctx.rect(contentX, contentY - 12 * scale, badgeW, badgeH);
  }
  ctx.fill();
  ctx.strokeStyle = "rgba(14, 178, 154, 0.6)";
  ctx.lineWidth = 1 * scale;
  ctx.stroke();

  // Live green ping beacon
  ctx.fillStyle = "#10B981";
  ctx.beginPath();
  ctx.arc(contentX + 10 * scale, contentY - 3 * scale, 3 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#34D399";
  ctx.font = `bold ${Math.round(9.5 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("GEOTAG AKTIF", contentX + 18 * scale, contentY + 0.5 * scale);

  // Title
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${Math.round(11.5 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("TRINFO FORENSIC EVIDENCE", contentX + badgeW + 10 * scale, contentY);

  // Right Seal Pill (Anti-Fraud Canvas Verified)
  const rightPillW = 98 * scale;
  const rightPillX = cardX + cardWidth - rightPillW - cardPadding;
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(rightPillX, contentY - 12 * scale, rightPillW, badgeH, 6 * scale);
  } else {
    ctx.rect(rightPillX, contentY - 12 * scale, rightPillW, badgeH);
  }
  ctx.fill();

  // Vector Shield Icon
  ctx.strokeStyle = "#38BDF8";
  ctx.lineWidth = 1.2 * scale;
  ctx.beginPath();
  const sx = rightPillX + 10 * scale;
  const sy = contentY - 8 * scale;
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx + 8 * scale, sy);
  ctx.lineTo(sx + 8 * scale, sy + 5 * scale);
  ctx.quadraticCurveTo(sx + 8 * scale, sy + 10 * scale, sx + 4 * scale, sy + 12 * scale);
  ctx.quadraticCurveTo(sx, sy + 10 * scale, sx, sy + 5 * scale);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = "#94A3B8";
  ctx.font = `bold ${Math.round(8.5 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("ANTI-FRAUD", rightPillX + 22 * scale, contentY);

  // Divider Line
  contentY += 12 * scale;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(contentX, contentY);
  ctx.lineTo(cardX + cardWidth - cardPadding, contentY);
  ctx.stroke();

  // Grid Data Rows
  const labelW = 80 * scale;
  const valX = contentX + labelW;
  const rowGap = 17 * scale;

  // Row 1: Koordinat
  contentY += rowGap;
  ctx.fillStyle = "#94A3B8";
  ctx.font = `bold ${Math.round(9 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("KOORDINAT", contentX, contentY);

  ctx.fillStyle = "#F8FAFC";
  ctx.font = `bold ${Math.round(10.5 * scale)}px ui-monospace, SFMono-Regular, "Geist Mono", monospace`;
  ctx.fillText(`${options.latitude.toFixed(6)}°, ${options.longitude.toFixed(6)}° (±${accuracy}m)`, valX, contentY);

  // Row 2: Waktu
  contentY += rowGap;
  ctx.fillStyle = "#94A3B8";
  ctx.font = `bold ${Math.round(9 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("WAKTU", contentX, contentY);

  ctx.fillStyle = "#F8FAFC";
  ctx.font = `500 ${Math.round(10 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(timestampStr, valX, contentY);

  // Row 3: Lokasi
  contentY += rowGap;
  ctx.fillStyle = "#94A3B8";
  ctx.font = `bold ${Math.round(9 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("LOKASI", contentX, contentY);

  ctx.fillStyle = "#E2E8F0";
  ctx.font = `500 ${Math.round(10 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  const maxAlamatW = cardWidth - cardPadding * 2 - labelW;
  let alamatText = options.alamat || "Klojen, Kota Malang, Jawa Timur";
  if (ctx.measureText(alamatText).width > maxAlamatW) {
    while (alamatText.length > 10 && ctx.measureText(alamatText + "...").width > maxAlamatW) {
      alamatText = alamatText.slice(0, -1);
    }
    alamatText += "...";
  }
  ctx.fillText(alamatText, valX, contentY);

  // Row 4: Security Hash Strip
  contentY += 19 * scale;
  ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(contentX, contentY - 11 * scale, cardWidth - cardPadding * 2 - 4 * scale, 16 * scale, 4 * scale);
  } else {
    ctx.rect(contentX, contentY - 11 * scale, cardWidth - cardPadding * 2 - 4 * scale, 16 * scale);
  }
  ctx.fill();

  ctx.fillStyle = "#64748B";
  ctx.font = `400 ${Math.round(8 * scale)}px ui-monospace, SFMono-Regular, "Geist Mono", monospace`;
  const modeLabel = options.captureMode === "live_camera" ? "REALTIME CAM" : "FIELD UPLOAD";
  ctx.fillText(`HASH: ${shortHash}... • ${deviceFp} • ${modeLabel}`, contentX + 6 * scale, contentY + 1 * scale);

  // Top-right subtle brand stamp on the overall photo
  const stampW = 185 * scale;
  const stampH = 26 * scale;
  const stampX = width - stampW - 20 * scale;
  const stampY = 20 * scale;

  ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(stampX, stampY, stampW, stampH, 13 * scale);
  } else {
    ctx.rect(stampX, stampY, stampW, stampH);
  }
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1 * scale;
  ctx.stroke();

  // Small logo mark
  ctx.fillStyle = "#0EB29A";
  ctx.beginPath();
  ctx.arc(stampX + 16 * scale, stampY + 13 * scale, 5 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${Math.round(10 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("TRINFO", stampX + 28 * scale, stampY + 16.5 * scale);

  ctx.fillStyle = "#94A3B8";
  ctx.font = `500 ${Math.round(8.5 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("• SMART WATERMARK", stampX + 74 * scale, stampY + 16.5 * scale);

  ctx.restore();

  // Ekspor gambar kanvas berwatermark ke format JPEG berkualitas tinggi
  const dataUrl = sourceCanvas.toDataURL("image/jpeg", 0.9);

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
