import { User } from "@/types";

const USER_KEY = "uinic_auth_user";
const TOKEN_KEY = "uinic_auth_token";
const BOOKMARKS_KEY = "uinic_bookmarked_reports";

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
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
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
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
  } catch (e) {
    console.error("Failed to save user report:", e);
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
  try {
    const raw = localStorage.getItem(USER_VOUCHERS_KEY);
    if (!raw) {
      // Default welcome starter voucher for demo experience
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
    if (!user) return 0;
    const currentPoints = user.poin ?? 240;
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

