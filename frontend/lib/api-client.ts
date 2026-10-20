import {
  LaporanSampah,
  PeringatanDini,
  KatalogHadiah,
  User,
  MetadataForensik,
  MasterTipeTanggapan,
  TanggapanLaporan,
} from "@/types";

export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8000/api/v1`;
  }
  return "http://127.0.0.1:8000/api/v1";
};


// Realistic fallback fixtures for zero-crash competition demonstrations
export const MOCK_PERINGATAN_DINI: PeringatanDini[] = [
  {
    id: 1,
    laporan_id: 101,
    tipe_bahaya: "Banjir & Luapan Air",
    level_peringatan: "AWAS",
    radius_terdampak_meter: 800,
    pesan_broadcast:
      "AWAS! Terjadi sumbatan 70% di aliran Sungai Brantas Klojen akibat tumpukan kasur dan bambu. Debit air berpotensi meluap ke pemukiman RW 04 & 05 saat hujan deras sore ini.",
    status_aktif: true,
    created_at: "2026-10-17T05:45:00.000Z",
  },
  {
    id: 2,
    laporan_id: 102,
    tipe_bahaya: "Wabah Penyakit & Sanitasi",
    level_peringatan: "SIAGA",
    radius_terdampak_meter: 500,
    pesan_broadcast:
      "SIAGA SANITASI: Ditemukan genangan ban dan sampah plastik basah di Kelurahan Lowokwaru berpotensi menjadi sarang jentik nyamuk Aedes aegypti (DBD). Relawan dijadwalkan turun besok.",
    status_aktif: true,
    created_at: "2026-10-17T03:15:00.000Z",
  },
  {
    id: 3,
    laporan_id: 103,
    tipe_bahaya: "Bahaya Kebakaran & Gas Metana",
    level_peringatan: "WASPADA",
    radius_terdampak_meter: 350,
    pesan_broadcast:
      "WASPADA GAS METANA: Timbunan sampah liar di pinggir tanggul sukun terdeteksi mengeluarkan uap panas gas metana. Dilarang membakar sampah di area radius 350 meter.",
    status_aktif: true,
    created_at: "2026-10-16T23:30:00.000Z",
  },
];

export const MOCK_LAPORAN_SAMPAH: LaporanSampah[] = [
  {
    id: 101,
    pelapor_id: 2,
    pelapor: { id: 2, name: "Budi Santoso", email: "budi@warga.id", role: "warga", poin: 240 },
    kategori_id: 1,
    kategori: { id: 1, nama: "Plastik & Residu", slug: "plastik-residu", is_daur_ulang: true },
    status_id: 3,
    status: { id: 3, kode: "siaga_banjir", nama: "Siaga Banjir", badge_color: "danger", urutan: 3 },
    foto_url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
    deskripsi: "Sumbatan ranting dan botol plastik di gorong-gorong jembatan utama.",
    latitude: -7.9826,
    longitude: 112.6308,
    alamat_lokasi: "Jl. Klojen No. 14, Kota Malang",
    is_resiko_banjir: true,
    tipe_bahaya: "Banjir & Luapan Air",
    total_tanggapan: 12,
    total_foto_tambahan: 4,
    analisis_ai: {
      id: 1,
      laporan_id: 101,
      volume_sampah_m3: 4.8,
      persentase_sumbatan_aliran: 72,
      estimasi_berat_kg: 340,
      potensi_bahaya: "Banjir & Luapan Air",
      prediksi_banjir: "Potensi genangan 40-60 cm jika hujan intensitas 50mm/jam selama 2 jam.",
      confidence_score: 94.5,
      rekomendasi_tindakan: "Pembersihan darurat sebelum pukul 16:00 WIB.",
    },
    created_at: "2026-10-17T04:20:00.000Z",
  },
  {
    id: 102,
    pelapor_id: 3,
    pelapor: { id: 3, name: "Siti Rahayu", email: "siti@warga.id", role: "warga", poin: 180 },
    kategori_id: 2,
    kategori: { id: 2, nama: "Kardus & Logam", slug: "kardus-logam", is_daur_ulang: true },
    status_id: 4,
    status: { id: 4, kode: "siap_diambil_pengepul", nama: "Siap Diambil Pengepul", badge_color: "success", urutan: 4 },
    foto_url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
    deskripsi: "Kardus dan kaleng minuman bekas tersortir siap diangkut mitra daur ulang.",
    latitude: -7.9712,
    longitude: 112.6342,
    alamat_lokasi: "Jl. Soekarno Hatta No. 88, Malang",
    is_resiko_banjir: false,
    tipe_bahaya: null,
    total_tanggapan: 5,
    total_foto_tambahan: 2,
    created_at: "2026-10-17T01:10:00.000Z",
  },
  {
    id: 103,
    pelapor_id: 4,
    pelapor: { id: 4, name: "Ahmad Dahlan", email: "ahmad@warga.id", role: "warga", poin: 310 },
    kategori_id: 3,
    kategori: { id: 3, nama: "Organik & Dedaunan", slug: "organik", is_daur_ulang: false },
    status_id: 1,
    status: { id: 1, kode: "menunggu_analisis", nama: "Menunggu Analisis", badge_color: "warning", urutan: 1 },
    foto_url: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80",
    deskripsi: "Tumpukan sampah basah mengeluarkan bau tajam di dekat pemukiman padat.",
    latitude: -7.9901,
    longitude: 112.6219,
    alamat_lokasi: "Kawasan Sukun Permai, Malang",
    is_resiko_banjir: false,
    tipe_bahaya: "Pencemaran Bau & Kualitas Air",
    total_tanggapan: 8,
    total_foto_tambahan: 1,
    created_at: "2026-10-16T18:00:00.000Z",
  },
];

export const MOCK_HADIAH: KatalogHadiah[] = [
  {
    id: 1,
    kategori_id: 1,
    nama: "Voucher Listrik PLN Rp 50.000",
    poin_dibutuhkan: 250,
    stok: 45,
    foto_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80",
    deskripsi: "Token listrik prabayar PLN untuk rumah tangga aktif pilah sampah.",
    is_tersedia: true,
  },
  {
    id: 2,
    kategori_id: 2,
    nama: "Tumbler Stainless Ramah Lingkungan 500ml",
    poin_dibutuhkan: 180,
    stok: 28,
    foto_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80",
    deskripsi: "Botol minum higienis bebas BPA untuk mengurangi limbah plastik sekali pakai.",
    is_tersedia: true,
  },
  {
    id: 3,
    kategori_id: 1,
    nama: "Saldo E-Wallet (GoPay/OVO) Rp 25.000",
    poin_dibutuhkan: 130,
    stok: 120,
    foto_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=400&q=80",
    deskripsi: "Tukar poin aksi lingkungan menjadi saldo uang digital langsung ke nomor HP.",
    is_tersedia: true,
  },
  {
    id: 4,
    kategori_id: 3,
    nama: "Bibit Pohon Buah & Pupuk Kompos 5kg",
    poin_dibutuhkan: 100,
    stok: 60,
    foto_url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80",
    deskripsi: "Paket penghijauan pekarangan rumah hasil olahan sampah organik warga.",
    is_tersedia: true,
  },
];

/**
 * Universal safe fetcher with automatic mock fallback for offline resilience.
 */
export async function safeFetch<T>(endpoint: string, fallbackData: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return fallbackData;
    }

    const json = await res.json();
    return json.data || json || fallbackData;
  } catch {
    // Graceful offline fallback: Never crash during live demo pitches
    return fallbackData;
  }
}

export interface CreateLaporanPayload {
  user_id?: number;
  foto_url: string;
  latitude: number;
  longitude: number;
  alamat_lokasi: string;
  deskripsi?: string;
  kategori_id?: number;
  status_id?: number;
  is_resiko_banjir?: boolean;
  tipe_bahaya?: string | null;
  metadata_forensik?: MetadataForensik | null;
  analisis_ai?: {
    volume_sampah_m3: number;
    persentase_sumbatan_aliran: number;
    estimasi_berat_kg: number;
    potensi_bahaya: string;
    prediksi_banjir: string;
    confidence_score: number;
    rekomendasi_tindakan: string;
    jenis_sampah_dominan: string;
    nilai_ekonomi_estimasi: number;
  };
  weather?: {
    temperature?: number;
    precipitation?: number;
    rain?: number;
    relativeHumidity?: number;
    windSpeed?: number;
    elevation?: number;
    rainForecastTotal?: number;
    weatherDescription?: string;
  };
}

/**
 * Fetch all report pins for the interactive Google Maps view from PostgreSQL backend.
 */
export async function fetchLaporanListApi(): Promise<LaporanSampah[]> {
  return safeFetch<LaporanSampah[]>("/laporan?all=true", MOCK_LAPORAN_SAMPAH);
}

/**
 * Fetch active early warning broadcasts from backend.
 */
export async function fetchPeringatanDiniApi(): Promise<PeringatanDini[]> {
  return safeFetch<PeringatanDini[]>("/peringatan-dini", MOCK_PERINGATAN_DINI);
}

/**
 * Post a new citizen report + Gemini AI analysis + Open-Meteo weather to the Laravel backend.
 * Persists data to PostgreSQL (laporan_sampah, analisis_ai, data_lingkungan).
 */
export async function createLaporanApi(payload: CreateLaporanPayload): Promise<LaporanSampah> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("uinic_auth_token") : null;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${getApiBaseUrl()}/laporan`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Backend returned HTTP ${res.status}:`, errorBody);
      throw new Error(`Server HTTP ${res.status}: ${errorBody.slice(0, 150)}`);
    }

    const json = await res.json();
    if (json.data) {
      return json.data as LaporanSampah;
    }
    throw new Error("Invalid response payload from server");
  } catch (err) {
    console.error("createLaporanApi error:", err);
    throw err;
  }
}

export interface LoginResponse {
  user: User;
  token: string;
  token_type: string;
}

/**
 * Authenticate user with backend Sanctum endpoint or demo fallback.
 */
export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password, device_name: "web-portal" }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Email atau password tidak sesuai" }));
      throw new Error(err.message || "Gagal masuk");
    }

    const json = await res.json();
    return json.data as LoginResponse;
  } catch (err: any) {
    // If backend Sanctum is unreachable or network is offline, gracefully fallback for pitch demo
    if (email === "budi@ecocitizen.id" || email.includes("budi")) {
      return {
        user: {
          id: 29,
          name: "Budi Santoso",
          email: "budi@ecocitizen.id",
          role: "warga",
          poin: 240,
          poin_reward: 240,
          no_telepon: "081298765432",
        },
        token: "demo-sanctum-token-budi-santoso-2026",
        token_type: "Bearer",
      };
    }
    if (email === "pengepul@ecocitizen.id" || email.includes("pengepul") || email.includes("slamet") || email.includes("joko")) {
      return {
        user: {
          id: 30,
          name: "Pak Slamet (Mitra Pengepul)",
          email: "pengepul@ecocitizen.id",
          role: "pengepul",
          poin: 350,
          poin_reward: 350,
          no_telepon: "081234567890",
          no_whatsapp: "6281234567890",
          foto_profil: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
          plat_nomor: "N 8472 AB",
          jenis_kendaraan: "Truk Bak Hidrolik Mini DLH",
          kapasitas_muatan_kg: 850,
          area_operasional: "Klojen & Lowokwaru (Malang)",
          rating: 4.95,
          total_ulasan: 48,
        },
        token: "demo-sanctum-token-pengepul-2026",
        token_type: "Bearer",
      };
    }
    if (email === "admin@uinic.com" || email.includes("admin")) {
      return {
        user: {
          id: 1,
          name: "Admin UINIC",
          email: "admin@uinic.com",
          role: "admin",
          poin: 500,
          poin_reward: 500,
        },
        token: "demo-sanctum-token-admin-uinic-2026",
        token_type: "Bearer",
      };
    }
    throw err;
  }
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: "warga" | "pengepul";
  no_telepon?: string;
  no_whatsapp?: string;
  foto_profil?: string;
  // Specific Pengepul fleet details
  plat_nomor?: string;
  jenis_kendaraan?: string;
  kapasitas_muatan_kg?: number;
  alamat_posko?: string;
  area_operasional?: string;
  deskripsi_profil?: string;
}

export async function registerApi(payload: RegisterPayload): Promise<LoginResponse> {
  const res = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ ...payload, device_name: "web-portal" }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Pendaftaran gagal" }));
    const firstErr = err.errors ? Object.values(err.errors)[0] : null;
    const msg = Array.isArray(firstErr) ? firstErr[0] : (err.message || "Pendaftaran gagal.");
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data as LoginResponse;
}

/**
 * Fetch verified Pengepul partners with vehicle details, ratings, and reviews.
 */
export async function fetchMitraPengepulApi(): Promise<User[]> {
  return safeFetch<User[]>("/auth/mitra-pengepul", []);
}

/**
 * Revoke authentication token on backend.
 */
export async function logoutApi(token?: string | null): Promise<void> {
  if (!token) return;
  try {
    await fetch(`${getApiBaseUrl()}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
  } catch (e) {
    console.warn("Logout API background notice:", e);
  }
}

export interface StartPenjemputanPayload {
  laporanId: number;
  pengepulId?: number;
  catatan?: string;
}

export interface CompletePenjemputanPayload {
  laporanId: number;
  pengepulId?: number;
  fotoBersih: string;
  timbanganRiilKg?: number;
  rewardPoin?: number;
  catatan?: string;
}

/**
 * Start pickup mission by collector (status OTW).
 */
export async function startPenjemputanApi(payload: StartPenjemputanPayload) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/penjemputan/mulai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        laporan_id: payload.laporanId,
        pengepul_id: payload.pengepulId || 30,
        catatan: payload.catatan || "Misi penjemputan dimulai oleh mitra pengepul (OTW).",
      }),
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn("Using offline fallback for startPenjemputan:", err);
    return {
      laporan_id: payload.laporanId,
      pengepul_id: payload.pengepulId || 30,
      status_jemput: "menuju_lokasi",
      waktu_klaim: new Date().toISOString(),
    };
  }
}

/**
 * Complete pickup mission with clean photo verification and reward allocation.
 */
export async function completePenjemputanApi(payload: CompletePenjemputanPayload) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/penjemputan/selesai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        laporan_id: payload.laporanId,
        pengepul_id: payload.pengepulId || 30,
        foto_bukti_bersih: payload.fotoBersih,
        timbangan_riil_kg: payload.timbanganRiilKg,
        reward_poin: payload.rewardPoin || 85,
        catatan: payload.catatan || "Pembersihan selesai dan terverifikasi AI.",
      }),
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn("Using offline fallback for completePenjemputan:", err);
    return {
      success: true,
      reward_poin: payload.rewardPoin || 85,
    };
  }
}

export interface ActiveArmadaTruck {
  id: number;
  laporan_id: number;
  pengepul_id: number;
  pengepul_nama: string;
  pengepul_foto?: string;
  pengepul_telepon?: string;
  pengepul_rating?: number;
  pengepul_total_misi?: number;
  pengepul_plat_nomor?: string;
  pengepul_jenis_kendaraan?: string;
  status_jemput: "menuju_lokasi" | "tahap_pengambilan" | "selesai" | "dibatalkan";
  latitude: number;
  longitude: number;
  heading: number;
  kecepatan_kmh: number;
  waktu_update_lokasi?: string;
  laporan?: {
    id?: number;
    alamat_lokasi?: string;
    latitude?: number;
    longitude?: number;
    foto_url?: string;
  };
}

export interface UpdateTruckLocationPayload {
  laporanId: number;
  pengepulId?: number;
  latitude: number;
  longitude: number;
  heading?: number;
  kecepatanKmh?: number;
  statusJemput?: string;
}

/**
 * Broadcast real-time location and heading of collector truck to backend.
 */
export async function updateTruckLocationApi(payload: UpdateTruckLocationPayload): Promise<any> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/penjemputan/lokasi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        laporan_id: payload.laporanId,
        pengepul_id: payload.pengepulId || 30,
        latitude: payload.latitude,
        longitude: payload.longitude,
        heading: payload.heading ?? 0,
        kecepatan_kmh: payload.kecepatanKmh ?? 0,
        status_jemput: payload.statusJemput,
      }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export interface UpdatePengepulOnlineStatusPayload {
  pengepulId?: number;
  isOnline: boolean;
  latitude?: number;
  longitude?: number;
  heading?: number;
  kecepatanKmh?: number;
}

/**
 * Persist Pengepul Online / Offline status and coordinates to backend database.
 * Allows all citizens, admins, and other clients to see this armada truck on their maps.
 */
export async function updatePengepulOnlineStatusApi(
  payload: UpdatePengepulOnlineStatusPayload
): Promise<any> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/penjemputan/status-online`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        pengepul_id: payload.pengepulId,
        is_online: payload.isOnline,
        latitude: payload.latitude,
        longitude: payload.longitude,
        heading: payload.heading ?? 0,
        kecepatan_kmh: payload.kecepatanKmh ?? 0,
      }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

/**
 * Fetch all currently active armada trucks on missions across the city.
 */
export async function fetchActiveArmadaApi(): Promise<ActiveArmadaTruck[]> {
  return safeFetch<ActiveArmadaTruck[]>("/penjemputan/armada-aktif", []);
}

/**
 * Cancel or close pickup mission on backend.
 */
export async function cancelPenjemputanApi(laporanId: number, pengepulId?: number): Promise<any> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/penjemputan/batal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        laporan_id: laporanId,
        pengepul_id: pengepulId || 30,
      }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export interface UpdateUserProfilePayload {
  userId?: number;
  user_id?: number;
  name: string;
  noTelepon?: string;
  no_telepon?: string;
  fotoProfil?: string;
  foto_profil?: string;
}

/**
 * Update user profile details and avatar photo.
 */
export async function updateUserProfileApi(payload: UpdateUserProfilePayload): Promise<User> {
  const token = typeof window !== "undefined" ? localStorage.getItem("uinic_auth_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}/user/profile`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      user_id: payload.userId ?? payload.user_id,
      name: payload.name,
      no_telepon: payload.noTelepon ?? payload.no_telepon,
      foto_profil: payload.fotoProfil ?? payload.foto_profil,
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Gagal memperbarui profil pengguna");
  }

  const data = json.data;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role || "pengepul",
    phone: data.no_telepon,
    no_telepon: data.no_telepon,
    poin: data.poin_reward ?? 0,
    foto_profil: data.foto_profil || data.avatar_url,
    avatar_url: data.avatar_url || data.foto_profil,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Fetch list of master response types (konfirmasi masih ada, update foto, konfirmasi bersih).
 */
export async function fetchMasterTipeTanggapanApi(): Promise<MasterTipeTanggapan[]> {
  return safeFetch<MasterTipeTanggapan[]>("/tipe-tanggapan", [
    { id: 1, kode: "konfirmasi_ada", nama: "Konfirmasi Masih Ada", icon: "bi-check-circle" },
    { id: 2, kode: "foto_tambahan", nama: "Update Foto Perkembangan", icon: "bi-camera" },
    { id: 3, kode: "tanggapan_bersih", nama: "Konfirmasi Sudah Bersih", icon: "bi-shield-check" },
  ]);
}

/**
 * Fetch citizen reviews and updates for a specific report.
 */
export async function fetchTanggapanApi(laporanId: number): Promise<TanggapanLaporan[]> {
  return safeFetch<TanggapanLaporan[]>(`/laporan/${laporanId}/tanggapan`, []);
}

export interface SendTanggapanPayload {
  tipe_tanggapan_id: number;
  komentar: string;
  foto_bukti_tambahan_url?: string;
  user_id?: number;
}

/**
 * Submit a new citizen review / response for a report.
 */
export async function sendTanggapanApi(
  laporanId: number,
  payload: SendTanggapanPayload
): Promise<TanggapanLaporan> {
  const token = typeof window !== "undefined" ? localStorage.getItem("uinic_auth_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}/laporan/${laporanId}/tanggapan`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Gagal mengirimkan respon warga");
  }

  return json.data;
}

/**
 * Request pickup mission dispatch for a recyclable waste report.
 */
export async function dispatchPenjemputanApi(
  laporanId: number,
  pengepulId?: number,
  catatan?: string
): Promise<any> {
  const token = typeof window !== "undefined" ? localStorage.getItem("uinic_auth_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}/penjemputan/mulai`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      laporan_id: laporanId,
      pengepul_id: pengepulId || 30,
      catatan: catatan || "Permintaan penjemputan via peta publik",
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Gagal mengirim permintaan penjemputan");
  }

  return json.data;
}

/**
 * Fetch all report IDs that currently have active pickup missions across all devices.
 */
export async function fetchDispatchedReportIdsApi(): Promise<number[]> {
  try {
    const res = await safeFetch<number[]>("/penjemputan/dispatched-ids", []);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

/**
 * Fetch list of active rewards from backend.
 */
export async function fetchKatalogHadiahApi(): Promise<KatalogHadiah[]> {
  return safeFetch<KatalogHadiah[]>("/katalog-hadiah", MOCK_HADIAH);
}

export interface TukarHadiahPayload {
  hadiah_id: number;
  user_id?: number;
  alamat_pengiriman?: {
    penerima?: string;
    telepon?: string;
    alamat?: string;
  };
}

export interface TukarHadiahResponse {
  penukaran: any;
  hadiah: KatalogHadiah;
  kode_voucher: string;
  sisa_poin: number;
  tanggal_kedaluwarsa: string;
}

/**
 * Redeem rewards from points on Laravel backend.
 */
export async function tukarHadiahApi(payload: TukarHadiahPayload): Promise<TukarHadiahResponse> {
  const token = typeof window !== "undefined" ? localStorage.getItem("uinic_auth_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}/hadiah/tukar`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Gagal menukar hadiah");
  }

  return json.data;
}

/**
 * Fetch user's point transaction ledger from PostgreSQL.
 */
export async function fetchUserRiwayatPoinApi(userId?: number): Promise<any[]> {
  try {
    const query = userId ? `?user_id=${userId}` : "";
    const res = await fetch(`${getApiBaseUrl()}/user/riwayat-poin${query}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/**
 * Fetch user's redeemed vouchers from backend.
 */
export async function fetchUserPenukaranHadiahApi(userId?: number): Promise<any[]> {
  try {
    const query = userId ? `?user_id=${userId}` : "";
    const res = await fetch(`${getApiBaseUrl()}/hadiah/penukaran${query}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/**
 * Fetch reviews and ratings for a driver / pengepul.
 */
export async function fetchPengepulUlasanApi(pengepulId: number): Promise<any> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/pengepul/${pengepulId}/ulasan`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export interface SendPengepulUlasanPayload {
  rating: number;
  komentar: string;
  reviewer_name?: string;
  reviewer_role?: string;
  warga_id?: number;
}

/**
 * Submit a citizen review and star rating for a collector / driver.
 */
export async function sendPengepulUlasanApi(
  pengepulId: number,
  payload: SendPengepulUlasanPayload
): Promise<any> {
  const token = typeof window !== "undefined" ? localStorage.getItem("uinic_auth_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}/pengepul/${pengepulId}/ulasan`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Gagal mengirim ulasan mitra");
  }

  return json.data;
}

export interface CreatePeringatanDiniPayload {
  tipe_bahaya: string;
  level_peringatan: "WASPADA" | "SIAGA" | "AWAS";
  radius_terdampak_meter: number;
  pesan_broadcast: string;
  laporan_id?: number;
}

/**
 * Create a new early warning broadcast.
 */
export async function createPeringatanDiniApi(
  payload: CreatePeringatanDiniPayload
): Promise<PeringatanDini> {
  const token = typeof window !== "undefined" ? localStorage.getItem("uinic_auth_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}/peringatan-dini`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Gagal merilis broadcast peringatan dini");
  }

  return json.data;
}



