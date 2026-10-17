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
