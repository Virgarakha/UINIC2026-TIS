export type UserRole = "admin" | "warga" | "pengepul" | "relawan";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  no_telepon?: string | null;
  role: UserRole;
  poin: number;
  foto_profil?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
