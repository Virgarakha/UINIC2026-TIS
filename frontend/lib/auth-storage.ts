import { User } from "@/types";

const USER_KEY = "uinic_auth_user";
const TOKEN_KEY = "uinic_auth_token";
const BOOKMARKS_KEY = "uinic_bookmarked_reports";

export const FALLBACK_GUEST_USER_ID = 1;

export const GUEST_USER: User = {
  id: 1,
  name: "Warga Tamu",
  email: "tamu@ecocitizen.id",
  role: "warga",
  poin: 0,
  poin_reward: 0,
  is_guest: true,
};

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.is_guest || (parsed.id === 1 && parsed.email === "tamu@ecocitizen.id")) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isGuestUser(user?: User | null): boolean {
  if (!user) return true;
  return Boolean(user.is_guest || (user.id === 1 && user.email === "tamu@ecocitizen.id"));
}

export function isUserAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return false;
    const user = JSON.parse(raw);
    return Boolean(user && !user.is_guest && !(user.id === 1 && user.email === "tamu@ecocitizen.id"));
  } catch {
    return false;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredSession(user: User, token?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (user.is_guest || (user.id === 1 && user.email === "tamu@ecocitizen.id")) {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new CustomEvent("uinic_auth_changed", { detail: null }));
    } else {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
      window.dispatchEvent(new CustomEvent("uinic_auth_changed", { detail: user }));
    }
  } catch (e) {
    console.error("Failed to save auth session to localStorage:", e);
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new CustomEvent("uinic_auth_changed", { detail: null }));
  } catch (e) {
    console.error("Failed to clear auth session:", e);
  }
}

export function getBookmarkedIds(): number[] {
  if (typeof window === "undefined") return [101, 102];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [101, 102];
  } catch {
    return [101, 102];
  }
}

export function toggleBookmarkedId(id: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getBookmarkedIds();
    const exists = current.includes(id);
    const updated = exists ? current.filter((item) => item !== id) : [...current, id];
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}

const USER_REPORTS_KEY = "uinic_user_created_reports";

export function getStoredUserReports(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredUserReport(report: any): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredUserReports();
    const updated = [report, ...current.filter((r: any) => r.id !== report.id)];
    localStorage.setItem(USER_REPORTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("uinic_reports_changed", { detail: updated }));
  } catch (e) {
    console.error("Failed to save user report:", e);
  }
}

export function updateStoredUserReportStatus(reportId: number, status: any): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredUserReports();
    let found = false;
    const updated = current.map((r: any) => {
      if (r.id === reportId) {
        found = true;
        return { ...r, status };
      }
      return r;
    });
    if (!found) {
      // Also check if we can insert placeholder
      updated.push({
        id: reportId,
        status,
        updated_at: new Date().toISOString(),
      });
    }
    localStorage.setItem(USER_REPORTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("uinic_reports_changed", { detail: updated }));
  } catch (e) {
    console.error("Failed to update user report status:", e);
  }
}

const DISPATCHED_REPORTS_KEY = "uinic_dispatched_pickup_reports";

export function getDispatchedReportIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DISPATCHED_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [101]; // ID 101 ready by default for instant feedback
  } catch {
    return [101];
  }
}

export function saveDispatchedReportId(reportId: number): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getDispatchedReportIds();
    if (!existing.includes(reportId)) {
      const updated = [...existing, reportId];
      localStorage.setItem(DISPATCHED_REPORTS_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error("Failed to save dispatched report id:", e);
  }
}

export function removeDispatchedReportId(reportId: number): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getDispatchedReportIds();
    const updated = existing.filter((id) => id !== reportId);
    localStorage.setItem(DISPATCHED_REPORTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to remove dispatched report id:", e);
  }
}

// ==========================================
// VOUCHER & REWARDS PERSISTENCE
// ==========================================

export interface ClaimedVoucher {
  id: string;
  hadiahId: number;
  namaHadiah: string;
  kategori: string;
  poinDipotong: number;
  kodeVoucher: string;
  tanggalKlaim: string;
  tanggalKedaluwarsa: string;
  status: "aktif" | "digunakan";
  fotoUrl?: string;
  alamatPengiriman?: string;
  namaPenerima?: string;
}

const USER_VOUCHERS_KEY = "uinic_user_claimed_vouchers";

export function getStoredUserVouchers(): ClaimedVoucher[] {
  if (typeof window === "undefined") return [];
  const user = getStoredUser();
  if (isGuestUser(user)) return []; // Mode warga tanpa login tidak dapat reward
  try {
    const raw = localStorage.getItem(USER_VOUCHERS_KEY);
    if (!raw) {
      // Default welcome starter voucher for demo logged-in experience
      const starterVouchers: ClaimedVoucher[] = [
        {
          id: "v-starter-1",
          hadiahId: 2,
          namaHadiah: "Token Listrik PLN Rp 20.000",
          kategori: "voucher_digital",
          poinDipotong: 100,
          kodeVoucher: "ECO-PLN-94821",
          tanggalKlaim: new Date(Date.now() - 3 * 86400000).toISOString(),
          tanggalKedaluwarsa: new Date(Date.now() + 27 * 86400000).toISOString(),
          status: "aktif",
          fotoUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80",
        },
      ];
      localStorage.setItem(USER_VOUCHERS_KEY, JSON.stringify(starterVouchers));
      return starterVouchers;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredUserVoucher(voucher: ClaimedVoucher): void {
  if (typeof window === "undefined") return;
  const user = getStoredUser();
  if (isGuestUser(user)) return; // Warga tanpa login tidak dapat menyimpan reward voucher
  try {
    const current = getStoredUserVouchers();
    const updated = [voucher, ...current];
    localStorage.setItem(USER_VOUCHERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save claimed voucher:", e);
  }
}

export function markVoucherAsUsed(voucherId: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredUserVouchers();
    const updated = current.map((v) =>
      v.id === voucherId ? { ...v, status: "digunakan" as const } : v
    );
    localStorage.setItem(USER_VOUCHERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update voucher status:", e);
  }
}

// ==========================================
// POINT LEDGER (BUKU BESAR TRANSAKSI POIN)
// ==========================================

export interface PointLedgerEntry {
  id: string;
  timestamp: string;
  jumlahPoin: number; // Positive (+) for earnings, Negative (-) for redemptions
  tipe:
    | "lapor_sampah"
    | "sedekah_sampah"
    | "penjemputan_mitra"
    | "klaim_hadiah"
    | "validasi_komunitas"
    | "edukasi_kuis"
    | "ulasan_pengepul";
  deskripsi: string;
  saldoSetelahnya: number;
}

const POINT_LEDGER_KEY = "uinic_user_point_ledger";

export function getStoredPointLedger(): PointLedgerEntry[] {
  if (typeof window === "undefined") return [];
  const user = getStoredUser();
  if (isGuestUser(user)) return []; // Mode warga tanpa login tidak memiliki riwayat poin
  try {
    const raw = localStorage.getItem(POINT_LEDGER_KEY);
    if (!raw) {
      // Default initial ledger entries
      const defaultLedger: PointLedgerEntry[] = [
        {
          id: "tx-init-1",
          timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
          jumlahPoin: 150,
          tipe: "lapor_sampah",
          deskripsi: "Reward Laporan Validasi AI: Titik Sampah Dinoyo",
          saldoSetelahnya: 150,
        },
        {
          id: "tx-init-2",
          timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
          jumlahPoin: -100,
          tipe: "klaim_hadiah",
          deskripsi: "Penukaran Hadiah: Token Listrik PLN Rp 20.000",
          saldoSetelahnya: 50,
        },
        {
          id: "tx-init-3",
          timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
          jumlahPoin: 190,
          tipe: "penjemputan_mitra",
          deskripsi: "Setoran Sampah Daur Ulang ke Mitra Armada Pengepul",
          saldoSetelahnya: 240,
        },
      ];
      localStorage.setItem(POINT_LEDGER_KEY, JSON.stringify(defaultLedger));
      return defaultLedger;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function updateStoredUserPoints(delta: number): number {
  if (typeof window === "undefined") return 0;
  try {
    const user = getStoredUser();
    if (!user || isGuestUser(user)) return 0; // Warga tanpa login tidak mendapatkan poin
    const currentPoints = user.poin ?? 0;
    const newPoints = Math.max(0, currentPoints + delta);
    const updatedUser = { ...user, poin: newPoints };
    setStoredSession(updatedUser);
    return newPoints;
  } catch (e) {
    console.error("Failed to update user points:", e);
    return 0;
  }
}

export function recordPointTransaction(
  amount: number,
  tipe: PointLedgerEntry["tipe"],
  deskripsi: string
): PointLedgerEntry {
  const user = getStoredUser();
  if (isGuestUser(user)) {
    // Mode tamu tanpa login: tidak mencatat mutasi poin reward
    return {
      id: `tx-guest-${Date.now()}`,
      timestamp: new Date().toISOString(),
      jumlahPoin: 0,
      tipe,
      deskripsi: `${deskripsi} (Mode Tamu - 0 Poin)`,
      saldoSetelahnya: 0,
    };
  }

  const newBalance = updateStoredUserPoints(amount);
  const entry: PointLedgerEntry = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    jumlahPoin: amount,
    tipe,
    deskripsi,
    saldoSetelahnya: newBalance,
  };

  if (typeof window !== "undefined") {
    try {
      const ledger = getStoredPointLedger();
      const updated = [entry, ...ledger];
      localStorage.setItem(POINT_LEDGER_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to record point transaction:", e);
    }
  }

  return entry;
}

