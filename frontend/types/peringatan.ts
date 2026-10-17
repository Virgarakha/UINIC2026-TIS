import { LaporanSampah } from "./laporan";

export type LevelPeringatan = "WASPADA" | "SIAGA" | "AWAS";

export interface PeringatanDini {
  id: number;
  laporan_id: number;
  laporan?: LaporanSampah | null;
  tipe_bahaya: string;
  level_peringatan: LevelPeringatan;
  radius_terdampak_meter: number;
  pesan_broadcast: string;
  status_aktif: boolean;
  dibuat_pada?: string;
  created_at: string;
}
