"use client";

import * as React from "react";
import Link from "next/link";
import {
  Camera,
  MapPin,
  ShieldCheck,
  Truck,
  ArrowRight,
  Star,
  CheckCircle2,
  Recycle,
  Sparkles,
  ChevronRight,
  Phone,
  MessageSquare,
} from "lucide-react";
import { fetchMitraPengepulApi } from "@/lib/api-client";
import { User } from "@/types";
import { EcoRecycleGraphic } from "@/components/landing/eco-recycle-graphic";

export default function LandingHomePage() {
  const [mitraList, setMitraList] = React.useState<User[]>([]);
  const [isLoadingMitra, setIsLoadingMitra] = React.useState(true);

  React.useEffect(() => {
    fetchMitraPengepulApi()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMitraList(data);
        } else {
          setMitraList([
            {
              id: 2,
              name: "Pak Slamet (Mitra Pengepul)",
              email: "pengepul@ecocitizen.id",
              role: "pengepul",
              no_telepon: "0813-3379-4278",
              no_whatsapp: "0813-3379-4278",
              plat_nomor: "N 8472 AB",
              jenis_kendaraan: "Truk Bak Hidrolik Mini DLH",
              kapasitas_muatan_kg: 1200,
              area_operasional: "Klojen, Lowokwaru, Sukun",
              rating: 4.95,
              total_ulasan: 38,
              foto_profil:
                "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400&auto=format&fit=crop&q=80",
              deskripsi_profil:
                "Mitra resmi DLH Kota Malang. Melayani penjemputan sampah pilah (plastik PET, kardus tebal, kaleng logam). Berpengalaman 6+ tahun.",
              ulasan: [
                {
                  id: 1,
                  reviewer_name: "Ibu Ratna Susanti",
                  reviewer_role: "Ketua RW 04 Klojen",
                  rating: 5,
                  komentar:
                    "Pak Slamet sangat tepat waktu dan armada hidroliknya bersih. Timbangan kardus dan botol selalu transparan!",
                  created_at: "2026-10-17T00:00:00Z",
                },
              ],
              poin: 350,
            },
            {
              id: 4,
              name: "Cak Joko Prasetyo",
              email: "joko@ecocitizen.id",
              role: "pengepul",
              no_telepon: "0812-9876-5432",
              no_whatsapp: "0812-9876-5432",
              plat_nomor: "N 6192 KT",
              jenis_kendaraan: "Motor Gerobak Roda 3 Viar",
              kapasitas_muatan_kg: 450,
              area_operasional: "Lowokwaru, Blimbing",
              rating: 4.9,
              total_ulasan: 24,
              foto_profil:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
              deskripsi_profil:
                "Spesialis jemput botol plastik dan minyak jelantah area kampus dan perumahan gang sempit.",
              ulasan: [
                {
                  id: 2,
                  reviewer_name: "Dian Anggraini",
                  reviewer_role: "Pengelola Bank Sampah Lowokwaru",
                  rating: 5,
                  komentar:
                    "Cak Joko sangat membantu untuk gang-gang sempit yang tidak bisa dimasuki truk besar. Sangat responsif via WhatsApp!",
                  created_at: "2026-10-17T00:00:00Z",
                },
              ],
              poin: 280,
            },
            {
              id: 6,
              name: "Cak Haryono (Armada Klojen)",
              email: "haryono@pengepul.id",
              role: "pengepul",
              no_telepon: "081377778888",
              no_whatsapp: "081377778888",
              plat_nomor: "N 7321 KL",
              jenis_kendaraan: "Mobil Pickup L300",
              kapasitas_muatan_kg: 900,
              area_operasional: "Klojen, Sukun",
              rating: 5.0,
              total_ulasan: 1,
              foto_profil:
                "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&auto=format&fit=crop&q=80",
              deskripsi_profil:
                "Armada pickup cepat tanggap untuk limbah kertas, kardus, dan plastik pilah.",
              ulasan: [
                {
                  id: 4,
                  reviewer_name: "Koordinator DLH Kota Malang",
                  reviewer_role: "Dinas Lingkungan Hidup",
                  rating: 5,
                  komentar: "Mitra armada resmi terverifikasi program EcoPatrol UINIC08.",
                  created_at: "2026-10-17T00:00:00Z",
                },
              ],
              poin: 0,
            },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingMitra(false));
  }, []);

  return (
    <div className="bg-[#FBFBF8] text-[#18231D] min-h-screen selection:bg-emerald-200">
      
      {/* ========================================================
          1. HERO SECTION (EcoPack Style Typography & Vector)
      ======================================================== */}
      <section className="relative overflow-hidden pt-6 pb-14 md:pt-12 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Bold Typography & Actions */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              
              {/* Main Headline with Inline Badge and Pill Enclosed Word */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-black tracking-tight text-[#18231D] leading-[1.12] mb-6">
                Wujudkan kota{" "}
                <span className="inline-flex items-center align-middle mx-1.5 px-2.5 py-1 rounded-2xl bg-white border border-[#DFE7DD] shadow-xs hover:rotate-3 transition-transform">
                  <span className="text-xl sm:text-2xl mr-1">📦🌿</span>
                  <span className="h-5 w-5 rounded-full bg-[#10B981] text-white flex items-center justify-center font-black text-xs">
                    +
                  </span>
                </span>{" "}
                masa depan bersih dan{" "}
                <span className="inline-block px-4 py-0.5 my-1 rounded-full border-2 border-[#82C3A8] bg-[#EAF5EF] text-[#1B4D3B]">
                  lestari
                </span>{" "}
                bersama
              </h1>

              {/* Subtitle with subtle keyword underlines */}
              <p className="text-base sm:text-lg text-[#4B5950] font-normal leading-relaxed max-w-2xl mb-8">
                Inovasi kolaborasi warga berbasis AI Vision yang tidak hanya{" "}
                <span className="underline decoration-[#82C3A8] decoration-2 underline-offset-4 font-bold text-[#18231D]">
                  menjaga keamanan lingkungan
                </span>{" "}
                dari sumbatan sampah sungai, namun juga mewujudkan{" "}
                <span className="underline decoration-[#82C3A8] decoration-2 underline-offset-4 font-bold text-[#18231D]">
                  dampak minimal
                </span>{" "}
                terhadap ancaman risiko banjir perkotaan.
              </p>

              {/* Action Buttons matching EcoPack Pill Style */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                
                {/* Primary Button */}
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full border-2 border-[#18231D] bg-white text-[#18231D] hover:bg-[#18231D] hover:text-white transition-all shadow-xs active:scale-95"
                >
                  <span className="font-extrabold text-sm sm:text-base">
                    Gabung EcoPatrol Sekarang
                  </span>
                  <span className="h-7 w-7 rounded-full bg-[#1E5345] group-hover:bg-emerald-400 text-white group-hover:text-[#18231D] flex items-center justify-center transition-colors">
                    <span className="text-xs">🍃</span>
                  </span>
                </Link>

                {/* Secondary Button */}
                <Link
                  href="/peta"
                  className="inline-flex items-center gap-2 text-sm sm:text-base font-extrabold text-[#18231D] hover:text-[#256B52] transition-colors py-2 group"
                >
                  <span>Jelajahi Peta Radar</span>
                  <span className="h-7 w-7 rounded-full bg-[#18231D] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>

              </div>

            </div>

            {/* Right Column: Circular Vector Artwork Illustration */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <EcoRecycleGraphic className="w-full max-w-[460px] lg:max-w-[500px]" />
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          2. PROBLEM / FEATURE HIGHLIGHT CARDS (001 & 002)
      ======================================================== */}
      <section className="py-6 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Card 001: Timbunan Sampah Liar */}
            <div className="relative rounded-[32px] bg-[#F3F5EF] border border-[#E2E8DE] p-7 sm:p-9 flex flex-col justify-between overflow-hidden shadow-xs hover:border-[#10B981]/50 transition-all group">
              <div>
                {/* Pill Badge matching reference */}
                <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-[#DFE6DB] shadow-2xs mb-6">
                  <span className="text-xs font-black tracking-wider text-[#18231D]">
                    001
                  </span>
                  <div className="flex -space-x-1.5">
                    <img
                      className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                      alt="Warga"
                    />
                    <img
                      className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80"
                      alt="Warga"
                    />
                  </div>
                  <span className="h-4 w-4 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-[10px]">
                    +
                  </span>
                </div>

                {/* Big Bold Title */}
                <h3 className="text-2xl sm:text-3xl font-black text-[#18231D] leading-snug max-w-sm">
                  Timbunan Sampah Liar & Sumbatan Saluran Air
                </h3>
              </div>

              {/* Graphic Right (Cardboard Box with Leaves) */}
              <div className="mt-6 flex justify-end">
                <svg
                  className="w-36 h-28 sm:w-44 sm:h-32 drop-shadow-md group-hover:scale-105 transition-transform"
                  viewBox="0 0 200 150"
                  fill="none"
                >
                  {/* Leaves inside Box */}
                  <path d="M 60 70 C 40 40, 70 10, 110 30 C 100 50, 80 65, 60 70 Z" fill="#256B52" stroke="#18231D" strokeWidth="2.5" />
                  <path d="M 100 70 C 100 30, 140 15, 170 45 C 150 65, 120 70, 100 70 Z" fill="#10B981" stroke="#18231D" strokeWidth="2.5" />
                  <path d="M 75 40 Q 95 30 115 45" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                  
                  {/* Isometric Box */}
                  <polygon points="40,80 120,60 160,85 80,105" fill="#F5E3C0" stroke="#18231D" strokeWidth="3" />
                  <polygon points="80,105 160,85 160,135 80,150" fill="#DFC69D" stroke="#18231D" strokeWidth="3" />
                  <polygon points="40,80 80,105 80,150 40,125" fill="#EAD0A9" stroke="#18231D" strokeWidth="3" />
                  
                  {/* Triangle symbol on box */}
                  <polygon points="120,100 110,120 130,120" fill="none" stroke="#256B52" strokeWidth="2.5" />
                </svg>
              </div>
            </div>

            {/* Card 002: Polusi Plastik & Ancaman Banjir */}
            <div className="relative rounded-[32px] bg-[#F3F5EF] border border-[#E2E8DE] p-7 sm:p-9 flex flex-col justify-between overflow-hidden shadow-xs hover:border-[#10B981]/50 transition-all group">
              <div>
                {/* Pill Badge matching reference */}
                <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-[#DFE6DB] shadow-2xs mb-6">
                  <span className="text-xs font-black tracking-wider text-[#18231D]">
                    002
                  </span>
                  <div className="flex -space-x-1.5">
                    <img
                      className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=60&auto=format&fit=crop&q=80"
                      alt="Warga"
                    />
                    <img
                      className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&auto=format&fit=crop&q=80"
                      alt="Warga"
                    />
                    <img
                      className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&auto=format&fit=crop&q=80"
                      alt="Warga"
                    />
                  </div>
                  <span className="h-4 w-4 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-[10px]">
                    +
                  </span>
                </div>

                {/* Big Bold Title */}
                <h3 className="text-2xl sm:text-3xl font-black text-[#18231D] leading-snug max-w-sm">
                  Polusi Plastik Residu & Kerawanan Banjir Sungai
                </h3>
              </div>

              {/* Graphic Right (Isometric 3D Recycle Loop) */}
              <div className="mt-6 flex justify-end">
                <svg
                  className="w-36 h-28 sm:w-44 sm:h-32 drop-shadow-md group-hover:scale-105 transition-transform"
                  viewBox="0 0 200 150"
                  fill="none"
                >
                  {/* 3D Isometric Recycle Arrows */}
                  {/* Arrow 1: Top Right */}
                  <polygon points="100,25 150,55 140,65 110,50 110,80 90,80 90,40" fill="#256B52" stroke="#18231D" strokeWidth="2.5" />
                  <polygon points="150,55 130,95 120,85 135,60" fill="#1B4D3B" stroke="#18231D" strokeWidth="2" />
                  
                  {/* Arrow 2: Bottom */}
                  <polygon points="135,115 80,135 85,120 110,110 75,90 85,75 125,95" fill="#10B981" stroke="#18231D" strokeWidth="2.5" />
                  
                  {/* Arrow 3: Left */}
                  <polygon points="65,95 45,45 60,45 70,75 95,65 100,80 75,90" fill="#34D399" stroke="#18231D" strokeWidth="2.5" />
                </svg>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          3. BRAND PARTNERSHIPS ("WE ARE PROUD OF")
      ======================================================== */}
      <section className="py-12 border-t border-[#E8EDE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-xs font-black tracking-[0.25em] text-[#63756A] uppercase block mb-3">
            WE ARE PROUD OF
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#18231D] max-w-3xl mx-auto leading-tight mb-10">
            Kemitraan strategis bersama DLH, Bank Sampah & puluhan penggerak daur ulang
          </h2>

          {/* Partner Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
            
            {/* DLH Kota Malang */}
            <div className="bg-white rounded-2xl border border-[#DFE6DB] p-5 flex flex-col items-center justify-center gap-2 hover:border-[#10B981] hover:shadow-md transition-all group">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🏛️
              </div>
              <span className="text-xs font-black text-[#18231D]">DLH Kota Malang</span>
              <span className="text-[10px] text-slate-500 font-semibold">Dinas Lingkungan Hidup</span>
            </div>

            {/* BPBD Malang */}
            <div className="bg-white rounded-2xl border border-[#DFE6DB] p-5 flex flex-col items-center justify-center gap-2 hover:border-[#10B981] hover:shadow-md transition-all group">
              <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🚨
              </div>
              <span className="text-xs font-black text-[#18231D]">BPBD Malang</span>
              <span className="text-[10px] text-slate-500 font-semibold">Penanggulangan Bencana</span>
            </div>

            {/* Bank Sampah Malang */}
            <div className="bg-white rounded-2xl border border-[#DFE6DB] p-5 flex flex-col items-center justify-center gap-2 hover:border-[#10B981] hover:shadow-md transition-all group">
              <div className="h-12 w-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ♻️
              </div>
              <span className="text-xs font-black text-[#18231D]">Bank Sampah BSM</span>
              <span className="text-[10px] text-slate-500 font-semibold">Jaringan Daur Ulang</span>
            </div>

            {/* Sahabat Kali Brantas */}
            <div className="bg-white rounded-2xl border border-[#DFE6DB] p-5 flex flex-col items-center justify-center gap-2 hover:border-[#10B981] hover:shadow-md transition-all group">
              <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🌊
              </div>
              <span className="text-xs font-black text-[#18231D]">Sahabat Brantas</span>
              <span className="text-[10px] text-slate-500 font-semibold">Komunitas Rawat Sungai</span>
            </div>

            {/* Pemkot Malang */}
            <div className="bg-white rounded-2xl border border-[#DFE6DB] p-5 flex flex-col items-center justify-center gap-2 hover:border-[#10B981] hover:shadow-md transition-all group col-span-2 sm:col-span-1">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🛡️
              </div>
              <span className="text-xs font-black text-[#18231D]">Pemkot Malang</span>
              <span className="text-[10px] text-slate-500 font-semibold">EcoSmart City 2026</span>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          4. VERIFIED MITRA PENGEPUL SHOWCASE
      ======================================================== */}
      <section className="py-16 bg-[#F4F6F1] border-y border-[#E2E8DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 text-[#1E5345] text-xs font-black mb-3">
                <Truck className="h-3.5 w-3.5" />
                <span>ARMADA SIAGA OPERASIONAL</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#18231D] tracking-tight">
                Mitra Pengepul Terverifikasi & Armada Siaga
              </h2>
              <p className="text-sm sm:text-base text-[#4B5950] mt-2 max-w-xl">
                Penggerak ekonomi sirkular resmi dengan transparansi timbangan, armada berstandar DLH, dan ulasan langsung dari warga.
              </p>
            </div>

            <Link
              href="/register?role=pengepul"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#18231D] hover:bg-[#25362D] text-white font-bold text-xs shadow-md transition-all self-start md:self-auto"
            >
              <span>Daftarkan Armada Anda</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {mitraList.map((mitra) => (
              <div
                key={mitra.id}
                className="rounded-3xl bg-white border border-[#DFE6DB] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-[#10B981] transition-all"
              >
                <div>
                  {/* Top: Photo & Details */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={mitra.foto_profil || "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&auto=format&fit=crop&q=80"}
                        alt={mitra.name}
                        className="h-14 w-14 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-xs"
                      />
                      <div>
                        <h4 className="font-extrabold text-[#18231D] text-base leading-snug">
                          {mitra.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-black text-[10px] border border-emerald-200">
                            {mitra.plat_nomor || "N 8472 AB"}
                          </span>
                          <span className="text-[11px] text-slate-500 font-semibold truncate max-w-[120px]">
                            {mitra.jenis_kendaraan?.split(" ")[0] || "Armada"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-black text-xs">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      <span>{mitra.rating || 5.0}</span>
                    </div>
                  </div>

                  {/* Operational Area & Vehicle Specs */}
                  <div className="p-3 rounded-xl bg-[#F6F8F3] border border-[#E5EBE1] text-xs space-y-1 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Kapasitas Muatan:</span>
                      <span className="font-bold text-[#18231D]">~{mitra.kapasitas_muatan_kg || 800} kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Wilayah Kerja:</span>
                      <span className="font-bold text-[#18231D] truncate max-w-[160px]">
                        {mitra.area_operasional || "Klojen & Sekitarnya"}
                      </span>
                    </div>
                  </div>

                  {/* Driver Statement Quote */}
                  {mitra.deskripsi_profil && (
                    <p className="text-xs text-[#526157] italic mb-4 line-clamp-2">
                      &quot;{mitra.deskripsi_profil}&quot;
                    </p>
                  )}

                  {/* Verified Community Review */}
                  {mitra.ulasan && mitra.ulasan.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                          Ulasan Warga Binaan
                        </span>
                        <div className="flex text-amber-400 text-xs">
                          {"★".repeat(mitra.ulasan[0].rating)}
                        </div>
                      </div>
                      <p className="text-xs text-[#18231D] font-medium leading-relaxed bg-[#F8FAF6] p-2.5 rounded-lg border border-[#E9EFE6]">
                        &quot;{mitra.ulasan[0].komentar}&quot;
                      </p>
                      <span className="text-[10px] font-bold text-slate-500 block mt-1">
                        — {mitra.ulasan[0].reviewer_name} ({mitra.ulasan[0].reviewer_role || "Warga"})
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action: WhatsApp Contact */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={`https://wa.me/${mitra.no_whatsapp?.replace(/[^0-9]/g, "") || "6281234567890"}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1E5345] hover:text-emerald-700"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Hubungi via WhatsApp</span>
                  </a>

                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                    SIAGA
                  </span>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================
          5. 4-LANGKAH ALUR KERJA SISTEM (WORKFLOW)
      ======================================================== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black tracking-[0.25em] text-[#63756A] uppercase block mb-2">
              ALUR KERJA RESPON CEPAT
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#18231D] tracking-tight">
              Dari Laporan Warga hingga Penjemputan Tuntas
            </h2>
            <p className="text-sm text-[#4B5950] mt-2">
              Empat tahapan otomatisasi tanggap darurat sampah perkotaan yang transparan dan terukur.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="rounded-3xl bg-white border border-[#DFE6DB] p-6 shadow-xs relative">
              <span className="text-3xl font-black text-[#10B981]/25 block mb-2">01</span>
              <div className="h-10 w-10 rounded-xl bg-emerald-100/70 text-[#1E5345] flex items-center justify-center font-black mb-3">
                📸
              </div>
              <h4 className="font-extrabold text-[#18231D] text-base mb-1.5">
                Foto & Titik Koordinat
              </h4>
              <p className="text-xs text-[#526157] leading-relaxed">
                Warga mengambil foto timbunan sampah melalui kamera anti-fraud dengan koordinat GPS presisi dan watermark waktu nyata.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl bg-white border border-[#DFE6DB] p-6 shadow-xs relative">
              <span className="text-3xl font-black text-[#10B981]/25 block mb-2">02</span>
              <div className="h-10 w-10 rounded-xl bg-teal-100/70 text-[#1E5345] flex items-center justify-center font-black mb-3">
                🧠
              </div>
              <h4 className="font-extrabold text-[#18231D] text-base mb-1.5">
                Analisis AI Multi-Hazard
              </h4>
              <p className="text-xs text-[#526157] leading-relaxed">
                Gemini Vision mendeteksi estimasi volume (m³), kategori sampah (PET, kardus, residu), dan risiko sumbatan aliran sungai.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl bg-white border border-[#DFE6DB] p-6 shadow-xs relative">
              <span className="text-3xl font-black text-[#10B981]/25 block mb-2">03</span>
              <div className="h-10 w-10 rounded-xl bg-amber-100/70 text-amber-900 flex items-center justify-center font-black mb-3">
                🚛
              </div>
              <h4 className="font-extrabold text-[#18231D] text-base mb-1.5">
                Disposisi Armada Pengepul
              </h4>
              <p className="text-xs text-[#526157] leading-relaxed">
                Notifikasi otomatis ke armada terdekat untuk penjemputan sampah daur ulang sesuai kapasitas kendaraan.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-3xl bg-white border border-[#DFE6DB] p-6 shadow-xs relative">
              <span className="text-3xl font-black text-[#10B981]/25 block mb-2">04</span>
              <div className="h-10 w-10 rounded-xl bg-emerald-100/70 text-[#1E5345] flex items-center justify-center font-black mb-3">
                🎁
              </div>
              <h4 className="font-extrabold text-[#18231D] text-base mb-1.5">
                Klaim Poin & Rewards
              </h4>
              <p className="text-xs text-[#526157] leading-relaxed">
                Warga pelapor menerima poin reward yang dapat ditukarkan voucher sembako, bibit pohon, atau donasi sungai bersih.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          6. BOTTOM CALL TO ACTION BANNER
      ======================================================== */}
      <section className="py-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] bg-[#18231D] text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
            
            {/* Ambient Leaf Glows */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

            <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black mb-4">
              GERAKAN KOTA MALANG BEBAS BANJIR
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black max-w-3xl mx-auto leading-tight mb-4">
              Mulai Laporkan Sampah atau Gabung Jadi Mitra Pengepul Resmi Hari Ini
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 font-medium">
              Satu foto laporan Anda dapat menyelamatkan puluhan rumah dari ancaman luapan banjir sungai dan menggerakkan ekonomi sirkular.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/lapor"
                className="px-7 py-3.5 rounded-full bg-[#10B981] hover:bg-emerald-400 text-[#18231D] font-black text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                <span>Lapor Titik Sampah Sekarang</span>
              </Link>
              <Link
                href="/register?role=pengepul"
                className="px-7 py-3.5 rounded-full border border-white/30 hover:border-white text-white font-black text-sm transition-all"
              >
                <span>Daftar Sebagai Mitra Armada</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
