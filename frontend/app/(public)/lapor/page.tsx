"use client";

import * as React from "react";
import Link from "next/link";
import { Camera, MapPin, Upload, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGeolocation } from "@/hooks/use-geolocation";

export default function LaporPage() {
  const geo = useGeolocation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [alamat, setAlamat] = React.useState("Kawasan Klojen, Kota Malang (Terdeteksi via GPS)");
  const [deskripsi, setDeskripsi] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0EB29A] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <Card className="shadow-lg border-slate-200 bg-white text-[#2B3752]">
        <CardHeader className="text-center pb-4 border-b border-slate-100">
          <div className="h-12 w-12 rounded-2xl bg-[#0EB29A]/10 text-[#0EB29A] flex items-center justify-center mx-auto mb-3">
            <Camera className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black text-[#2B3752]">Laporkan Timbunan Sampah</CardTitle>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Foto tumpukan sampah di saluran air atau TPS liar. Sistem AI akan memproses estimasi bahaya secara otomatis.
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-[#0EB29A]/15 text-[#0EB29A] flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-[#2B3752]">Laporan Berhasil Terkirim! 🎉</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Model AI sedang memverifikasi citra visual dan mengkalkulasi risiko hidrologi. Anda memperoleh <strong>+50 Poin</strong> setelah diverifikasi.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Button variant="glow" onClick={() => setIsSuccess(false)}>
                  Kirim Laporan Lain
                </Button>
                <Link href="/peta">
                  <Button variant="outline">Lihat di Radar GIS</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Image Upload Box */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2B3752]">
                  Foto Bukti Timbunan Sampah <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#0EB29A] transition-colors bg-slate-50/50 cursor-pointer">
                  <Upload className="h-8 w-8 text-[#0EB29A] mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-bold text-[#2B3752]">
                    Klik untuk Ambil Foto atau Upload Citra
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Format JPG, PNG (Maks 10MB) • Pastikan sumbatan saluran terlihat jelas
                  </p>
                </div>
              </div>

              {/* GPS Coordinates Box */}
              <div className="p-3.5 rounded-xl bg-[#0EB29A]/10 border border-[#0EB29A]/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#0EB29A] flex-shrink-0" />
                  <div>
                    <span className="font-bold text-[#2E6E65] block">
                      Koordinat GPS Terdeteksi
                    </span>
                    <span className="text-[11px] text-[#2E6E65]/90 font-mono">
                      {geo.latitude?.toFixed(4)}, {geo.longitude?.toFixed(4)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={geo.refresh}
                  className="text-[11px] font-bold text-[#2E6E65] underline hover:no-underline cursor-pointer"
                >
                  Segarkan GPS
                </button>
              </div>

              {/* Address Input */}
              <Input
                label="Alamat / Patokan Lokasi"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Contoh: Depan Jembatan Klojen, RT 03 RW 04"
                required
              />

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2B3752]">
                  Keterangan Tambahan
                </label>
                <textarea
                  rows={3}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Ceritakan kondisi tumpukan sampah (misal: air mulai tersumbat, bau busuk menyengat, ada kasur hanyut)..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-[#2B3752] focus:ring-2 focus:ring-[#0EB29A] outline-none"
                />
              </div>

              {/* AI Auto-Tagging Notice */}
              <div className="p-3 rounded-xl bg-[#0EB29A]/10 border border-[#0EB29A]/20 text-xs text-[#2E6E65] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#0EB29A] flex-shrink-0" />
                <span>
                  AI akan otomatis mengklasifikasikan tipe bahaya (Banjir, DBD, Gas Metana) dan mendeteksi potensi daur ulang.
                </span>
              </div>

              <Button type="submit" variant="glow" size="lg" className="w-full" isLoading={isSubmitting}>
                Kirim Laporan Sekarang
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
