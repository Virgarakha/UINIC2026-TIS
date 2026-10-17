import { User } from "./user";

export type StatusLaporanKode =
  | "menunggu_analisis"
  | "terverifikasi"
  | "siaga_banjir"
  | "siap_diambil_pengepul"
  | "sedang_dibersihkan"
  | "selesai"
  | "ditolak";

export interface StatusLaporan {
  id: number;
  kode: StatusLaporanKode;
  nama: string;
  badge_color: string;
  urutan: number;
}

export interface KategoriSampah {
  id: number;
  nama: string;
  slug: string;
  deskripsi?: string | null;
  is_daur_ulang: boolean;
}

export interface MasterJenisSampah {
  id: number;
  nama: string;
  nilai_ekonomi_per_kg: number;
  dapat_didaur_ulang: boolean;
}

export interface AnalisisAi {
  id: number;
  laporan_id: number;
  volume_sampah_m3: number;
  persentase_sumbatan_aliran: number;
  estimasi_berat_kg: number;
  potensi_bahaya?: string | null;
  prediksi_banjir: string;
  confidence_score: number;
  rekomendasi_tindakan: string;
  jenis_sampah_dominan_id?: number | null;
  jenis_sampah_dominan?: MasterJenisSampah | string | null;
  nilai_ekonomi_estimasi?: number | null;
}

export interface LaporanSampah {
  id: number;
  pelapor_id: number;
  pelapor?: User | null;
  kategori_id: number;
  kategori?: KategoriSampah | null;
  status_id: number;
  status?: StatusLaporan | null;
  foto_url: string;
  deskripsi: string;
  latitude: number;
  longitude: number;
  alamat_lokasi: string;
  is_resiko_banjir: boolean;
  tipe_bahaya?: string | null;
  total_tanggapan?: number;
  total_foto_tambahan?: number;
  analisis_ai?: AnalisisAi | null;
  created_at: string;
  updated_at?: string;
}

export interface TanggapanLaporan {
  id: number;
  laporan_id: number;
  user_id: number;
  user?: User | null;
  komentar: string;
  foto_bukti_url?: string | null;
  tipe_tanggapan?: {
    id: number;
    nama: string;
    kode: string;
    icon: string;
  } | null;
  created_at: string;
}
