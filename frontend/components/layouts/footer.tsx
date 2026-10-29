import * as React from "react";
import Link from "next/link";
import { ShieldCheck, PhoneCall, Truck, ShieldAlert, Heart } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="w-full bg-white text-slate-600 border-t border-slate-200 text-xs mt-auto">
      {/* Top Banner: Emergency Hotlines */}
      <div className="border-b border-slate-200 bg-slate-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[#2B3752]">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              <span className="font-bold text-[#2B3752] text-xs">Kontak Darurat Multi-Bahaya Lingkungan:</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                <PhoneCall className="h-3.5 w-3.5 text-red-500" />
                BPBD Darurat: <strong className="text-[#2B3752]">112</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                <Truck className="h-3.5 w-3.5 text-[#0EB29A]" />
                Dinas LH: <strong className="text-[#2B3752]">0811-3000-888</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                <ShieldCheck className="h-3.5 w-3.5 text-[#2E6E65]" />
                Relawan Bencana: <strong className="text-[#2B3752]">0812-4455-9999</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-block" title="TRINFO - Trash Information System">
              <img
                src="/images/logo-text.png"
                alt="TRINFO - Trash Information System"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-slate-600 leading-relaxed max-w-md text-xs">
              {siteConfig.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-[#2B3752] text-xs uppercase tracking-wider">Akses Cepat</h5>
            <ul className="space-y-1.5">
              <li>
                <Link href="/" className="hover:text-[#0EB29A] transition-colors">
                  Beranda Peta Interaktif
                </Link>
              </li>
              <li>
                <Link href="/peta" className="hover:text-[#0EB29A] transition-colors">
                  Peta Radius & Bahaya
                </Link>
              </li>
              <li>
                <Link href="/lapor" className="hover:text-[#0EB29A] transition-colors">
                  Kirim Laporan Timbunan
                </Link>
              </li>
              <li>
                <Link href="/peringatan" className="hover:text-[#0EB29A] transition-colors">
                  Broadcast Siaga Lingkungan
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="hover:text-[#0EB29A] transition-colors">
                  Katalog Hadiah Daur Ulang
                </Link>
              </li>
            </ul>
          </div>

          {/* System & API Links */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-[#2B3752] text-xs uppercase tracking-wider">Integrasi & API</h5>
            <ul className="space-y-1.5">
              <li>
                <a
                  href={siteConfig.links.backendAdmin}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0EB29A] transition-colors"
                >
                  Admin Command Center
                </a>
              </li>
              <li>
                <Link href="/docs" className="hover:text-[#0EB29A] transition-colors font-bold text-[#0EB29A]">
                  Dokumentasi API & SDK
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:8000/api/v1/users"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0EB29A] transition-colors"
                >
                  REST API v1 Gateway
                </a>
              </li>
              <li>
                <Link href="/edukasi" className="hover:text-[#0EB29A] transition-colors">
                  Panduan Pilah Sampah
                </Link>
              </li>
              <li>
                <Link href="/peta" className="hover:text-[#0EB29A] transition-colors">
                  Radar Titik Sampah
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© 2026 {siteConfig.name} Team.</p>
          <div className="flex items-center gap-1 text-slate-600">
            <span>Dibuat dengan</span>
            <Heart className="h-3 w-3 text-red-500 fill-current" />
            <span>untuk Indonesia Hijau & Bebas Bencana</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
