"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Truck,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";
import { registerApi } from "@/lib/api-client";
import { setStoredSession } from "@/lib/auth-storage";
import { cn } from "@/lib/utils";
import { User } from "@/types";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Role: warga or pengepul
  const [role, setRole] = React.useState<"warga" | "pengepul">("warga");

  React.useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "pengepul" || roleParam === "warga") {
      setRole(roleParam);
    }
  }, [searchParams]);

  // Common Form Fields
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  // Pengepul Specific Fields
  const [whatsapp, setWhatsapp] = React.useState("");
  const [isSameWhatsapp, setIsSameWhatsapp] = React.useState(true);
  const [platNomor, setPlatNomor] = React.useState("N ");
  const [jenisKendaraan, setJenisKendaraan] = React.useState("Truk Bak Hidrolik Mini DLH");
  const [kapasitasKg, setKapasitasKg] = React.useState(1000);
  const [areaOperasional, setAreaOperasional] = React.useState("Klojen, Lowokwaru");

  // States
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Sync WhatsApp when checkbox is active
  React.useEffect(() => {
    if (isSameWhatsapp) {
      setWhatsapp(phone);
    }
  }, [phone, isSameWhatsapp]);

  const vehicleOptions = [
    { name: "Truk Bak Hidrolik Mini DLH", capacity: 1200 },
    { name: "Mobil Pickup Terbuka L300", capacity: 800 },
    { name: "Motor Gerobak Roda 3 Viar", capacity: 450 },
    { name: "Truk Engkel Box", capacity: 2000 },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== passwordConfirmation) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      setIsLoading(false);
      return;
    }

    if (role === "pengepul" && (!platNomor || platNomor.trim() === "N" || platNomor.trim() === "N ")) {
      setErrorMessage("Nomor plat kendaraan armada wajib diisi untuk mitra pengepul.");
      setIsLoading(false);
      return;
    }

    try {
      const payload: any = {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
        no_telepon: phone,
      };

      if (role === "pengepul") {
        payload.no_whatsapp = isSameWhatsapp ? phone : whatsapp;
        payload.plat_nomor = platNomor.toUpperCase();
        payload.jenis_kendaraan = jenisKendaraan;
        payload.kapasitas_muatan_kg = kapasitasKg;
        payload.area_operasional = areaOperasional;
        payload.foto_profil =
          "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=300&auto=format&fit=crop&q=80";
      }

      const res = await registerApi(payload);

      const registeredUser: User = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: (res.user.role as any) || role,
        poin: res.user.poin_reward || 0,
        phone: res.user.no_telepon,
        no_telepon: res.user.no_telepon,
        no_whatsapp: res.user.no_whatsapp,
        foto_profil: res.user.foto_profil,
        plat_nomor: res.user.plat_nomor,
        jenis_kendaraan: res.user.jenis_kendaraan,
        kapasitas_muatan_kg: res.user.kapasitas_muatan_kg,
        area_operasional: res.user.area_operasional,
        rating: res.user.rating || 5.0,
        total_ulasan: res.user.total_ulasan || (role === "pengepul" ? 1 : 0),
      };

      setStoredSession(registeredUser, res.token);

      if (role === "pengepul") {
        localStorage.setItem("uinic_pengepul_online", "true");
        setSuccessMessage("Pendaftaran Mitra Berhasil! Status armada Anda langsung aktif.");
        setTimeout(() => router.push("/peta"), 800);
      } else {
        setSuccessMessage("Pendaftaran Berhasil! Selamat bergabung di EcoPatrol.");
        setTimeout(() => router.push("/dashboard"), 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal melakukan pendaftaran. Periksa kembali form.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#18231D] flex items-center justify-center p-4 sm:p-8 lg:p-12">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start py-4">
        
        {/* Left Column: Clean Minimalist Form */}
        <div className="lg:col-span-6 flex flex-col justify-center max-w-md mx-auto w-full">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1E5345] text-emerald-300 font-black text-lg">
              ✦
            </div>
            <span className="text-xl font-black tracking-tight text-[#18231D]">
              EcoPatrol
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18231D] tracking-tight mb-6">
            Start journey<br />with EcoPatrol
          </h1>

          {/* Clean Role Switcher (Pill Toggle) */}
          <div className="flex p-1 bg-slate-100 rounded-full mb-6">
            <button
              type="button"
              onClick={() => setRole("warga")}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5",
                role === "warga"
                  ? "bg-white text-[#18231D] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Warga Pelapor</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("pengepul")}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5",
                role === "pengepul"
                  ? "bg-[#18231D] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Mitra Pengepul</span>
            </button>
          </div>

          {/* Alert Notices */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-3.5">
            
            {/* Full Name */}
            <div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === "pengepul" ? "Nama Pengemudi / Koordinator Armada" : "Your full name"}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[#18231D] placeholder:text-slate-400 focus:outline-none focus:border-[#1E5345] bg-[#FAFAFA] transition-all"
              />
            </div>

            {/* Email */}
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

            {/* Phone */}
            <div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number (e.g. 081234567890)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[#18231D] placeholder:text-slate-400 focus:outline-none focus:border-[#1E5345] bg-[#FAFAFA] transition-all"
              />
            </div>

            {/* Pengepul Specific Fleet Inputs */}
            {role === "pengepul" && (
              <div className="space-y-3 pt-1">
                {/* Vehicle Selection Pills */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Jenis Kendaraan Armada
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {vehicleOptions.map((v) => (
                      <button
                        key={v.name}
                        type="button"
                        onClick={() => {
                          setJenisKendaraan(v.name);
                          setKapasitasKg(v.capacity);
                        }}
                        className={cn(
                          "py-2 px-2.5 rounded-xl border text-left text-xs font-bold transition-all",
                          jenisKendaraan === v.name
                            ? "border-[#1E5345] bg-emerald-50 text-[#1E5345]"
                            : "border-slate-200 bg-[#FAFAFA] text-slate-600 hover:border-slate-300"
                        )}
                      >
                        <div className="truncate">{v.name.split(" ")[0]} {v.name.split(" ")[1]}</div>
                        <span className="text-[10px] font-normal text-slate-400">~{v.capacity} kg</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plat Nomor & Area */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <input
                      type="text"
                      required
                      value={platNomor}
                      onChange={(e) => setPlatNomor(e.target.value.toUpperCase())}
                      placeholder="Contoh: N 8472 AB"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-black uppercase text-[#18231D] placeholder:text-slate-400 focus:outline-none focus:border-[#1E5345] bg-[#FAFAFA]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={areaOperasional}
                      onChange={(e) => setAreaOperasional(e.target.value)}
                      placeholder="Area: Klojen, Lowokwaru"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#18231D] placeholder:text-slate-400 focus:outline-none focus:border-[#1E5345] bg-[#FAFAFA]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min. 8 characters)"
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

            {/* Confirm Password */}
            <div>
              <input
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[#18231D] placeholder:text-slate-400 focus:outline-none focus:border-[#1E5345] bg-[#FAFAFA] transition-all"
              />
            </div>

            {/* Dark Pill Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#18231D] hover:bg-[#25362D] text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isLoading
                  ? "Creating account..."
                  : role === "pengepul"
                  ? "Daftar Sebagai Mitra Pengepul"
                  : "Sign up"}
              </button>
            </div>

            {/* Switch to Login Link */}
            <p className="text-center text-xs text-slate-500 pt-2">
              Already have an account?{" "}
              <Link href="/login" className="text-[#18231D] font-extrabold underline hover:text-[#1E5345]">
                Click here
              </Link>
            </p>

            {/* Security Footnote */}
            <div className="pt-6 text-center">
              <span className="text-[11px] text-slate-400">
                Secured by <strong className="text-slate-600 font-bold">✦ EcoPatrol AI</strong>
              </span>
            </div>

          </form>

        </div>

        {/* Right Column: High-Res Lifestyle Photo with Inspiring Quote Overlay */}
        <div className="lg:col-span-6 hidden lg:block sticky top-8">
          <div className="relative rounded-[32px] overflow-hidden shadow-2xl h-[620px] bg-slate-900 group">
            {/* Hero Photo */}
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=80"
              alt="EcoPatrol Community"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

            {/* Quote Overlay */}
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

export default function RegisterPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-3 border-[#1E5345] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </React.Suspense>
  );
}
