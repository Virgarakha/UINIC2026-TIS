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
  metadata_forensik?: MetadataForensik | null;
  raw_payload_json?: any;
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
  tanggapan?: TanggapanLaporan[];
  created_at: string;
  updated_at?: string;
}

export interface MasterTipeTanggapan {
  id: number;
  kode: string;
  nama: string;
  icon: string;
  deskripsi?: string | null;
}

export interface TanggapanLaporan {
  id: number;
  laporan_id: number;
  user_id: number;
  user?: User | null;
  komentar: string;
  foto_bukti_url?: string | null;
  tipe_tanggapan?: MasterTipeTanggapan | null;
  created_at: string;
}
