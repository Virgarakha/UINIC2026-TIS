export interface KategoriHadiah {
  id: number;
  nama: string;
  slug: string;
  icon?: string | null;
}

export interface KatalogHadiah {
  id: number;
  kategori_id: number;
  kategori?: KategoriHadiah | null;
  nama: string;
  poin_dibutuhkan: number;
  stok: number;
  foto_url?: string | null;
  deskripsi?: string | null;
  is_tersedia: boolean;
}

export interface PenukaranHadiah {
  id: number;
  user_id: number;
  hadiah_id: number;
  hadiah?: KatalogHadiah | null;
  poin_digunakan: number;
  status: "diajukan" | "diproses" | "selesai" | "dibatalkan";
  kode_klaim: string;
  created_at: string;
}

export interface RiwayatPoin {
  id: number;
  user_id: number;
  jenis_transaksi: "dapat" | "tukar";
  jumlah_poin: number;
  sumber_kegiatan: string;
  saldo_sebelumnya: number;
  saldo_setelahnya: number;
  created_at: string;
}
