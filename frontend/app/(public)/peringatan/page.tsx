"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Radio } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HazardBadge } from "@/components/shared/hazard-badge";
import { MOCK_PERINGATAN_DINI } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

export default function PeringatanPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0EB29A] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 mb-1">
          <Radio className="h-4 w-4 animate-pulse" />
          <span>Sistem Broadcast Peringatan Dini Multi-Bahaya</span>
        </div>
        <h1 className="text-3xl font-black text-[#2B3752]">
          Pusat Siaga & Peringatan Dini Lingkungan
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Notifikasi broadcast darurat yang dirilis ke perangkat warga di sekitar titik rawan timbulan sampah, luapan air, dan potensi wabah.
        </p>
      </div>

      <div className="space-y-4">
        {MOCK_PERINGATAN_DINI.map((alert) => (
          <Card
            key={alert.id}
            className="p-6 bg-white border-slate-200 border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow text-[#2B3752]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HazardBadge hazard={alert.tipe_bahaya} />
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    alert.level_peringatan === "AWAS"
                      ? "bg-red-500 text-white"
                      : alert.level_peringatan === "SIAGA"
                      ? "bg-amber-500 text-white"
                      : "bg-yellow-400 text-slate-900"
                  }`}
                >
                  Status: {alert.level_peringatan}
                </span>
              </div>
              <span className="text-xs text-slate-400">{formatDate(alert.created_at)}</span>
            </div>

            <div className="py-4">
              <h3 className="text-base font-bold text-[#2B3752] mb-2">
                Peringatan: {alert.tipe_bahaya}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {alert.pesan_broadcast}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="h-4 w-4 text-red-500" />
                <span>Radius Terdampak Waspada: <strong className="text-[#2B3752]">{alert.radius_terdampak_meter} Meter</strong></span>
              </div>
              <Link href="/peta">
                <Button variant="outline" size="sm" className="text-xs">
                  Buka Titik Bahaya di Peta
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
