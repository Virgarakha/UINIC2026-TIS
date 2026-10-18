"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { loginApi } from "@/lib/api-client";
import { setStoredSession } from "@/lib/auth-storage";
import { User } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("pengepul@ecocitizen.id");
  const [password, setPassword] = React.useState("password");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await loginApi(email, password);
      const user: User = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: (res.user.role as any) || "warga",
        poin: res.user.poin_reward || 240,
        phone: res.user.no_telepon,
        no_telepon: res.user.no_telepon,
        no_whatsapp: res.user.no_whatsapp,
        foto_profil: res.user.foto_profil,
        plat_nomor: res.user.plat_nomor,
        jenis_kendaraan: res.user.jenis_kendaraan,
        kapasitas_muatan_kg: res.user.kapasitas_muatan_kg,
        area_operasional: res.user.area_operasional,
        rating: res.user.rating,
        total_ulasan: res.user.total_ulasan,
      };

      setStoredSession(user, res.token);
      setSuccessMessage(`Berhasil masuk sebagai ${user.name}! Mengalihkan...`);

      setTimeout(() => {
        if (user.role === "pengepul") {
          router.push("/peta");
        } else {
          router.push("/dashboard");
        }
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal masuk. Periksa kembali email dan kata sandi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword("password");
    setIsLoading(true);
    setErrorMessage(null);

    loginApi(demoEmail, "password")
      .then((res) => {
        const user: User = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: (res.user.role as any) || (demoRole as any),
          poin: res.user.poin_reward || 240,
          phone: res.user.no_telepon,
          no_telepon: res.user.no_telepon,
          no_whatsapp: res.user.no_whatsapp,
          foto_profil: res.user.foto_profil,
          plat_nomor: res.user.plat_nomor,
          jenis_kendaraan: res.user.jenis_kendaraan,
          kapasitas_muatan_kg: res.user.kapasitas_muatan_kg,
          area_operasional: res.user.area_operasional,
          rating: res.user.rating,
          total_ulasan: res.user.total_ulasan,
        };

        setStoredSession(user, res.token);
        setSuccessMessage(`Mode Demo Aktif: Masuk sebagai ${user.name}`);
        setTimeout(() => {
          if (demoRole === "pengepul") {
            router.push("/peta");
          } else {
            router.push("/dashboard");
          }
        }, 500);
      })
      .catch((err) => {
        setErrorMessage(err.message || "Gagal masuk mode demo");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen bg-white text-[#18231D] flex items-center justify-center p-4 sm:p-8 lg:p-12">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        
        {/* Left Column: Minimalist Form */}
        <div className="lg:col-span-6 flex flex-col justify-center max-w-md mx-auto w-full">
          
          {/* Brand Logo matching Innovasis placement */}
          <div className="flex items-center gap-2.5 mb-8 sm:mb-12">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1E5345] text-emerald-300 font-black text-lg">
              ✦
            </div>
            <span className="text-xl font-black tracking-tight text-[#18231D]">
              EcoPatrol
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18231D] tracking-tight mb-8">
            Start journey<br />with EcoPatrol
          </h1>

          {/* Alert Notices */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Input */}
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your e-mail address"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[#18231D] placeholder:text-slate-400 focus:outline-none focus:border-[#1E5345] bg-[#FAFAFA] transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[#18231D] placeholder:text-slate-400 focus:outline-none focus:border-[#1E5345] bg-[#FAFAFA] pr-10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Dark Pill Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#18231D] hover:bg-[#25362D] text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            {/* Switch to Register Link */}
            <p className="text-center text-xs text-slate-500 pt-2">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#18231D] font-extrabold underline hover:text-[#1E5345]">
                Click here
              </Link>
            </p>

            {/* Divider "or choose" */}
            <div className="flex items-center pt-4 pb-2">
              <div className="flex-1 border-t border-slate-200" />
              <span className="px-3 text-xs text-slate-400 font-medium">or choose</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* 1-Click Demo Buttons in Clean Pill Style */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleQuickDemo("pengepul@ecocitizen.id", "pengepul")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#18231D] shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <span>🚛</span>
                <span className="truncate">Mitra Pengepul</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("budi@ecocitizen.id", "warga")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#18231D] shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <span>👤</span>
                <span className="truncate">Warga Pelapor</span>
              </button>
            </div>

            {/* Security Footnote */}
            <div className="pt-8 text-center">
              <span className="text-[11px] text-slate-400">
                Secured by <strong className="text-slate-600 font-bold">✦ EcoPatrol AI</strong>
              </span>
            </div>

          </form>

        </div>

        {/* Right Column: High-Res Lifestyle Photo with Inspiring Quote Overlay */}
        <div className="lg:col-span-6 hidden lg:block">
          <div className="relative rounded-[32px] overflow-hidden shadow-2xl h-[620px] bg-slate-900 group">
            {/* Hero Photo matching reference style */}
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=80"
              alt="EcoPatrol Community"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* Dark gradient overlay for readable text at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

            {/* Inspiring quote matching reference image typography */}
            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10 text-white">
              <p className="text-sm sm:text-base leading-relaxed font-medium text-slate-100 max-w-md">
                Truly innovative and environmentally friendly,{" "}
                <strong className="text-white font-bold">
                  energy-independent smart facilities supporting AI early warning networks
                </strong>{" "}
                in Kota Malang, providing a one-of-a-kind community experience.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
