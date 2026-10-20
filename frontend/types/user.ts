export type UserRole = "admin" | "warga" | "pengepul" | "relawan";

export interface PengepulUlasanItem {
  id: number;
  pengepul_id?: number;
  reviewer_name: string;
  reviewer_role?: string;
  rating: number;
  komentar: string;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  no_telepon?: string | null;
  no_whatsapp?: string | null;
  role: UserRole;
  poin: number;
  poin_reward?: number;
  is_guest?: boolean;
  foto_profil?: string | null;
  avatar_url?: string | null;
  // Specific Pengepul fleet details
  plat_nomor?: string | null;
  jenis_kendaraan?: string | null;
  kapasitas_muatan_kg?: number | null;
  alamat_posko?: string | null;
  area_operasional?: string | null;
  rating?: number | null;
  total_ulasan?: number | null;
  deskripsi_profil?: string | null;
  ulasan?: PengepulUlasanItem[];
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
