"use client";

import * as React from "react";
import { X, Lock, Mail, ShieldCheck, UserCheck, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { loginApi } from "@/lib/api-client";
import { setStoredSession } from "@/lib/auth-storage";
import { User } from "@/types";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  actionTitle?: string;
  actionMessage?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  actionTitle,
  actionMessage,
}: AuthModalProps) {
  const [email, setEmail] = React.useState("budi@ecocitizen.id");
  const [password, setPassword] = React.useState("password");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginApi(email, password);
      const isAdmin = email.includes("admin") || res.user.role === "admin";
      const isPengepul = email.includes("pengepul") || res.user.role === "pengepul";
      const user: User = {
        id: res.user.id || (isAdmin ? 99 : 2),
        name: res.user.name || (isAdmin ? "Admin DLH" : "User"),
        email: res.user.email || email,
        role: isAdmin ? "admin" : isPengepul ? "pengepul" : "warga",
        poin: res.user.poin_reward || (isAdmin ? 500 : 240),
        phone: res.user.no_telepon,
      };

      setStoredSession(user, res.token);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal masuk. Periksa kembali email dan kata sandi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password");
    setIsLoading(true);
    setErrorMessage(null);
    loginApi(demoEmail, "password")
      .then((res) => {
        const isAdmin = demoEmail.includes("admin") || res.user.role === "admin";
        const isPengepul = demoEmail.includes("pengepul") || res.user.role === "pengepul";
        const user: User = {
          id: res.user.id || (isAdmin ? 99 : 2),
          name: res.user.name || (isAdmin ? "Admin DLH" : "User"),
          email: res.user.email || demoEmail,
          role: isAdmin ? "admin" : isPengepul ? "pengepul" : "warga",
          poin: res.user.poin_reward || (isAdmin ? 500 : 240),
          phone: res.user.no_telepon,
        };
        setStoredSession(user, res.token);
        onSuccess(user);
        onClose();
      })
      .catch((err) => {
        setErrorMessage(err.message || "Gagal masuk demo.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-[#2B3752]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#0EB29A] to-[#2E6E65] text-white flex items-center justify-center shadow-md shadow-[#0EB29A]/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#2B3752]">
                {actionTitle || "Masuk Akun Pengguna"}
              </h3>
              <p className="text-xs text-slate-500">Akses fitur pantauan & verifikasi aksi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#2B3752] rounded-full transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Reason Callout (When triggered by clicking protected actions like Simpan/Bookmark) */}
        {actionMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Autentikasi Diperlukan</span>
              <p className="text-[11px] text-amber-800 leading-snug mt-0.5">{actionMessage}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Quick Demo Login Option */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[#0EB29A]" />
            Akses Demo Cepat 1-Klik:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("budi@ecocitizen.id")}
              className="py-2 px-2 rounded-xl bg-white border border-slate-200 hover:border-[#0EB29A] text-left transition-all shadow-xs hover:shadow-sm cursor-pointer group"
            >
              <span className="text-[11px] font-bold text-[#2B3752] block group-hover:text-[#0EB29A] truncate">Budi Santoso</span>
              <span className="text-[9px] text-slate-500 block truncate">Warga (240 Poin)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("pengepul@ecocitizen.id")}
              className="py-2 px-2 rounded-xl bg-emerald-50/50 border border-emerald-200 hover:border-[#0EB29A] text-left transition-all shadow-xs hover:shadow-sm cursor-pointer group"
            >
              <span className="text-[11px] font-bold text-[#2E6E65] block group-hover:text-[#0EB29A] truncate">Pak Slamet</span>
              <span className="text-[9px] text-emerald-700 font-semibold block truncate">Pengepul (350 Poin)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                window.location.href = "https://itbs-alkautsar.cloud/admin/login";
              }}
              className="py-2 px-2 rounded-xl bg-emerald-50/50 border border-emerald-200 hover:border-[#0EB29A] text-left transition-all shadow-xs hover:shadow-sm cursor-pointer group"
              title="Arahkan ke Portal Admin DLH Backend"
            >
              <span className="text-[11px] font-bold text-[#1E5345] block group-hover:text-[#0EB29A] truncate">Admin DLH</span>
              <span className="text-[9px] text-emerald-700 font-semibold block truncate">Dinas Lingkungan</span>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleLogin} className="mt-4 space-y-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#2B3752]">Email Pengguna</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-[#2B3752] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EB29A]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#2B3752]">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-[#2B3752] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EB29A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-[#0EB29A]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <UserCheck className="h-4 w-4" />
                <span>Masuk Sekarang</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Sistem Otentikasi Terintegrasi Laravel 11 Sanctum & Next.js 16
        </p>
      </div>
    </div>
  );
}

// Re-export as LoginModal for backwards compatibility
export { AuthModal as LoginModal };
