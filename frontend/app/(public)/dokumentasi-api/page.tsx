"use client";

import * as React from "react";
import Link from "next/link";
import {
  Code2,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Server,
  Key,
  Globe,
  Database,
  Search,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Send,
  Lock,
  Coins,
  Truck,
  AlertTriangle,
  HelpCircle,
  FileCode,
  Building2,
  GraduationCap,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

// Real TRINFO endpoints metadata
interface ApiEndpoint {
  id: string;
  category: "laporan" | "peringatan" | "penjemputan" | "rewards";
  method: "GET" | "POST";
  path: string;
  summary: string;
  description: string;
  isAuthRequired: boolean;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  requestBody?: string;
  responseSample: string;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: "get-laporan",
    category: "laporan",
    method: "GET",
    path: "/laporan",
    summary: "Ambil Daftar Titik Sampah & Saluran Air",
    description: "Mengembalikan daftar geospatial titik sampah terverifikasi dengan estimasi volume kubikasi AI, tingkat risiko sumbatan saluran air, dan status penanganan armada.",
    isAuthRequired: false,
    parameters: [
      { name: "kategori_id", type: "integer", required: false, description: "Filter ID kategori sampah (1: Plastik, 2: Kardus/Logam, 3: Organik)" },
      { name: "is_resiko_banjir", type: "boolean", required: false, description: "Hanya tampilkan laporan yang berisiko memicu sumbatan drainase / banjir" },
      { name: "radius_km", type: "number", required: false, description: "Radius pemantauan koordinat GPS dari pusat Kota Malang (default: 15 km)" },
    ],
    responseSample: `{
  "success": true,
  "data": [
    {
      "id": 101,
      "alamat_lokasi": "Saluran Primer Jl. MT Haryono No. 112, Lowokwaru",
      "latitude": -7.9542,
      "longitude": 112.6145,
      "kategori": { "id": 1, "nama": "Plastik & Saluran Air", "slug": "plastik-residu" },
      "status": { "kode": "sedang_dibersihkan", "nama": "Armada Menuju Lokasi" },
      "is_resiko_banjir": true,
      "analisis_ai": {
        "volume_sampah_m3": 2.4,
        "estimasi_berat_kg": 95,
        "persentase_sumbatan": 78,
        "confidence_score": 96.4,
        "rekomendasi_tindakan": "Pembersihan segera pintu air dengan jaring hidrolik."
      },
      "created_at": "2026-10-28T09:15:00Z"
    }
  ]
}`,
  },
  {
    id: "post-laporan",
    category: "laporan",
    method: "POST",
    path: "/laporan",
    summary: "Kirim Laporan Sampah Baru + Verifikasi Forensik",
    description: "Membuat laporan titik timbunan sampah baru disertai verifikasi stempel waktu dan koordinat GPS anti-fraud untuk dianalisis otomatis oleh Gemini Vision AI.",
    isAuthRequired: true,
    requestBody: `{
  "alamat_lokasi": "Gorong-gorong Jembatan Brantas, Klojen",
  "latitude": -7.9826,
  "longitude": 112.6308,
  "kategori_id": 1,
  "foto_bukti": "https://storage.ecocitizen.id/evidence/brantas-clog-2026.jpg",
  "deskripsi": "Tumpukan sampah plastik tebal dan bambu menyumbat 60% mulut gorong-gorong.",
  "metadata_forensik": {
    "is_real_camera": true,
    "gps_accuracy_meters": 4.2,
    "captured_timestamp": "2026-10-28T14:30:22Z"
  }
}`,
    responseSample: `{
  "success": true,
  "message": "Laporan berhasil diverifikasi AI dan diterbitkan ke radar spasial",
  "data": {
    "laporan_id": 105,
    "status": "diverifikasi_ai",
    "analisis_ai": {
      "estimasi_volume_m3": 1.8,
      "estimasi_berat_kg": 65,
      "prediksi_risiko": "KRITIS_LUAPAN",
      "rekomendasi_armada": "Truk Bak Hidrolik Mini DLH"
    },
    "poin_diberikan": 50
  }
}`,
  },
  {
    id: "get-peringatan",
    category: "peringatan",
    method: "GET",
    path: "/peringatan-dini",
    summary: "Feed Peringatan Multi-Bahaya & Status Siaga",
    description: "Feed realtime peringatan risiko luapan air hujan intensitas tinggi, sumbatan saluran air primer, dan potensi titik sanitasi kritis Kota Malang.",
    isAuthRequired: false,
    responseSample: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipe_bahaya": "Banjir & Luapan Air",
      "level_peringatan": "AWAS",
      "radius_terdampak_meter": 800,
      "pesan_broadcast": "AWAS! Saluran primer Lowokwaru terdeteksi sumbatan 78%. Debit Kali Brantas berpotensi meluap ke pemukiman bantaran.",
      "status_aktif": true,
      "created_at": "2026-10-28T08:30:00Z"
    }
  ]
}`,
  },
  {
    id: "post-penjemputan-mulai",
    category: "penjemputan",
    method: "POST",
    path: "/penjemputan/mulai",
    summary: "Disposisi Misi Armada Pengepul OTW",
    description: "Mendaftarkan mitra armada pengepul resmi untuk mengambil titik sampah pilah atau menuntaskan titik sumbatan darurat di lapangan.",
    isAuthRequired: true,
    requestBody: `{
  "laporan_id": 101,
  "pengepul_id": 30,
  "catatan": "Armada truk hidrolik berangkat dari Posko Klojen menuju lokasi."
}`,
    responseSample: `{
  "success": true,
  "message": "Misi penjemputan aktif. Koordinat armada disiarkan ke radar pelapor.",
  "data": {
    "penjemputan_id": 88,
    "status_jemput": "menuju_lokasi",
    "estimasi_waktu_tiba_menit": 12
  }
}`,
  },
  {
    id: "post-penjemputan-selesai",
    category: "penjemputan",
    method: "POST",
    path: "/penjemputan/selesai",
    summary: "Konfirmasi Tuntas Bersih & Timbangan Riil",
    description: "Mengunggah foto bukti saluran/area tuntas bersih beserta timbangan berat riil untuk mengonversi reward warga dan memperbarui status laporan.",
    isAuthRequired: true,
    requestBody: `{
  "laporan_id": 101,
  "pengepul_id": 30,
  "foto_bersih": "https://storage.ecocitizen.id/clean/101-bersih.jpg",
  "timbangan_riil_kg": 88.5,
  "reward_poin": 275,
  "catatan": "Saluran gorong-gorong telah tuntas dibersihkan dan dialirkan normal."
}`,
    responseSample: `{
  "success": true,
  "message": "Laporan tuntas bersih. +275 Poin reward dikreditkan ke saldo pelapor.",
  "data": {
    "laporan_id": 101,
    "status": "selesai",
    "berat_riil_kg": 88.5,
    "divert_tpa_persen": 100
  }
}`,
  },
  {
    id: "get-rewards",
    category: "rewards",
    method: "GET",
    path: "/katalog-hadiah",
    summary: "Katalog Voucher Sembako & Reward Daur Ulang",
    description: "Mendapatkan daftar voucher sembako, pulsa, bibit pohon, dan merchandise daur ulang yang dapat ditukarkan menggunakan saldo poin warga.",
    isAuthRequired: false,
    responseSample: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama": "Voucher Sembako Beras 5 kg",
      "kategori": "Sembako",
      "biaya_poin": 200,
      "sisa_stok": 45,
      "mitra_penyedia": "Bank Sampah Malang (BSM)"
    }
  ]
}`,
  },
];

export default function ApiDocumentationPage() {
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "annually">("monthly");
  const [selectedLanguage, setSelectedLanguage] = React.useState<"curl" | "javascript" | "python" | "php">("curl");
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [expandedEndpoint, setExpandedEndpoint] = React.useState<string>("get-laporan");

  // API Key Generator Modal
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = React.useState(false);
  const [apiKeyName, setApiKeyName] = React.useState("Aplikasi Komunitas Malang");
  const [apiEnvironment, setApiEnvironment] = React.useState<"sandbox" | "production">("sandbox");
  const [generatedKey, setGeneratedKey] = React.useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateKey = () => {
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const key = `trinfo_${apiEnvironment === "production" ? "live" : "test"}_${randomHex}`;
    setGeneratedKey(key);
  };

  // Filter endpoints
  const filteredEndpoints = React.useMemo(() => {
    return API_ENDPOINTS.filter((ep) => {
      if (activeCategory !== "all" && ep.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ep.path.toLowerCase().includes(q) ||
          ep.summary.toLowerCase().includes(q) ||
          ep.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  const quickstartSnippets: Record<string, string> = {
    curl: `curl -X GET "https://itbs-alkautsar.cloud/api/v1/laporan?is_resiko_banjir=true" \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer trinfo_live_9f82d1c7a4b081e6"`,

    javascript: `// Mengambil titik sumbatan saluran air perkotaan
const response = await fetch("https://itbs-alkautsar.cloud/api/v1/laporan?is_resiko_banjir=true", {
  method: "GET",
  headers: {
    "Accept": "application/json",
    "Authorization": "Bearer trinfo_live_9f82d1c7a4b081e6"
  }
});

const data = await response.json();
console.log("Titik rawan saluran:", data.data);`,

    python: `import requests

url = "https://itbs-alkautsar.cloud/api/v1/laporan"
headers = {
    "Accept": "application/json",
    "Authorization": "Bearer trinfo_live_9f82d1c7a4b081e6"
}
params = {"is_resiko_banjir": "true"}

response = requests.get(url, headers=headers, params=params)
laporan_list = response.json()["data"]
print(f"Total titik banjir terdeteksi: {len(laporan_list)}")`,

    php: `<?php
use Illuminate\\Support\\Facades\\Http;

$response = Http::withHeaders([
    'Accept' => 'application/json',
    'Authorization' => 'Bearer trinfo_live_9f82d1c7a4b081e6',
])->get('https://itbs-alkautsar.cloud/api/v1/laporan', [
    'is_resiko_banjir' => true,
]);

$laporanList = $response->json('data');`,
  };

  return (
    <div className="bg-[#FBFBF8] text-[#18231D] min-h-screen selection:bg-emerald-200">
      
      {/* ========================================================
          1. HERO SECTION (Warm, Clean, Authoritative Developer Header)
      ======================================================== */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-20 border-b border-[#E8EDE5] bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E5345]/10 text-[#1E5345] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#1E5345]/15">
              <Terminal className="h-3.5 w-3.5" />
              <span>TRINFO DEVELOPER PLATFORM • REST API V1</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#18231D] leading-[1.12] mb-5">
              Dokumentasi API &amp; Integrasi Data{" "}
              <span className="relative inline-block text-[#1E5345]">
                Lingkungan Realtime
                <span className="absolute left-0 bottom-1 w-full h-3 bg-[#10B981]/25 -z-10 rounded-sm" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#4B5950] font-normal leading-relaxed mb-8">
              Akses programmatic ke data spasial titik sumbatan saluran air, estimasi volume kubikasi sampah AI Gemini Vision, stream penjemputan armada Kota Malang, dan katalog ekonomi sirkular.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <button
                type="button"
                onClick={() => {
                  handleGenerateKey();
                  setIsApiKeyModalOpen(true);
                }}
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#1E5345] hover:bg-[#153D32] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <Key className="h-4 w-4" />
                <span>Dapatkan API Key Sandbox</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform opacity-80" />
              </button>

              <a
                href="#pricing"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-[#18231D] bg-white text-[#18231D] hover:bg-[#18231D] hover:text-white font-semibold text-sm transition-all shadow-2xs active:scale-98"
              >
                <Coins className="h-4 w-4" />
                <span>Lihat Price List API</span>
              </a>
            </div>

            {/* Base URL Box with Copy Action */}
            <div className="p-3.5 rounded-2xl bg-[#FAFBF9] border border-[#DFE7DD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-xl">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#1E5345] shrink-0 font-semibold">
                  <Server className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#63756A]">
                    Base Gateway Endpoint
                  </div>
                  <code className="text-xs font-mono font-semibold text-[#18231D]">
                    https://itbs-alkautsar.cloud/api/v1
                  </code>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopy("https://itbs-alkautsar.cloud/api/v1", "base_url")}
                className="px-3 py-1.5 rounded-xl border border-[#DFE7DD] bg-white hover:bg-slate-50 text-xs font-semibold text-[#18231D] flex items-center gap-1.5 transition-colors cursor-pointer self-end sm:self-auto"
              >
                {copiedKey === "base_url" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#63756A]" />
                    <span>Salin URL</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          2. PRICE LIST SECTION (Interactive Tier Cards)
      ======================================================== */}
      <section id="pricing" className="py-16 sm:py-24 border-b border-[#E8EDE5] bg-[#FBFBF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold tracking-widest text-[#1E5345] uppercase block mb-2">
              PAKET &amp; PRICING API
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#18231D] tracking-tight leading-tight">
              Pilihan Lisensi &amp; Kuota Akses API TRINFO
            </h2>
            <p className="text-sm sm:text-base text-[#4B5950] mt-3 leading-relaxed">
              Tersedia paket gratis untuk riset penggiat lingkungan &amp; mahasiswa hingga lisensi integrasi dinas teknis pemerintah daerah dengan SLA uptime 99.9%.
            </p>

            {/* Monthly / Annually Billing Toggle */}
            <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#DFE7DD] mt-6 shadow-2xs">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                  billingCycle === "monthly"
                    ? "bg-[#18231D] text-white shadow-xs"
                    : "text-[#63756A] hover:text-[#18231D]"
                )}
              >
                Tagihan Bulanan
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annually")}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                  billingCycle === "annually"
                    ? "bg-[#18231D] text-white shadow-xs"
                    : "text-[#63756A] hover:text-[#18231D]"
                )}
              >
                <span>Tagihan Tahunan</span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-[#1E5345] text-[10px] font-bold">
                  Hemat 20%
                </span>
              </button>
            </div>
          </div>

          {/* 3 Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* Tier 1: Community (Free) */}
            <div className="rounded-3xl bg-white border border-[#DFE7DD] p-7 sm:p-8 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-[#18231D]">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-[#4B5950] border border-slate-200">
                    GRATIS SELAMANYA
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#18231D] mb-1">Community &amp; Warga</h3>
                <p className="text-xs text-[#63756A] mb-5 leading-relaxed">
                  Untuk hackathon, penggiat lingkungan lokal, mahasiswa pengembang, dan integrasi bot komunitas.
                </p>

                <div className="mb-6 pb-6 border-b border-[#DFE7DD]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#18231D]">Rp 0</span>
                    <span className="text-xs font-medium text-[#63756A]">/ selamanya</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                    ✓ Tanpa kartu kredit • Akses instan
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-3 text-xs text-[#4B5950] mb-8">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#1E5345] shrink-0 mt-0.5" />
                    <span><strong>1.000 Request</strong> / hari (30 req / menit)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#1E5345] shrink-0 mt-0.5" />
                    <span>Feed Publik Laporan Titik Sampah (Read-only)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#1E5345] shrink-0 mt-0.5" />
                    <span>Feed Peringatan Dini Bencana Hidrologi</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#1E5345] shrink-0 mt-0.5" />
                    <span>1 API Key Sandbox &amp; Webhook Standar</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-400">
                    <span className="h-4 w-4 text-center text-xs leading-none shrink-0">—</span>
                    <span>Tanpa ekspor CSV/GeoJSON historis</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setApiEnvironment("sandbox");
                  handleGenerateKey();
                  setIsApiKeyModalOpen(true);
                }}
                className="w-full py-3 rounded-xl border-2 border-[#18231D] bg-white hover:bg-[#18231D] hover:text-white text-[#18231D] font-semibold text-xs transition-all cursor-pointer"
              >
                Mulai Gunakan API Gratis
              </button>
            </div>

            {/* Tier 2: Research & Campus */}
            <div className="rounded-3xl bg-white border border-[#DFE7DD] p-7 sm:p-8 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#1E5345]">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E5345] border border-emerald-200">
                    RISET &amp; KAMPUS
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#18231D] mb-1">Akademisi &amp; Peneliti</h3>
                <p className="text-xs text-[#63756A] mb-5 leading-relaxed">
                  Untuk riset hidrologi DAS Brantas, tugas akhir skripsi, dan laboratorium sains data perkotaan.
                </p>

                <div className="mb-6 pb-6 border-b border-[#DFE7DD]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#18231D]">
                      {billingCycle === "monthly" ? "Rp 149.000" : "Rp 119.000"}
                    </span>
                    <span className="text-xs font-medium text-[#63756A]">/ bulan</span>
                  </div>
                  <span className="text-[11px] text-[#1E5345] font-semibold block mt-1">
                    {billingCycle === "annually" ? "Tagihan Rp 1.428.000 / tahun" : "Gratis dengan proposal riset terverifikasi"}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-3 text-xs text-[#4B5950] mb-8">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#1E5345] shrink-0 mt-0.5" />
                    <span><strong>25.000 Request</strong> / hari (120 req / menit)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#1E5345] shrink-0 mt-0.5" />
                    <span>Dataset Historis Kubikasi (m³) &amp; Berat Timbulan</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#1E5345] shrink-0 mt-0.5" />
                    <span>Prediksi Risiko Luapan Saluran Air Gemini AI</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#1E5345] shrink-0 mt-0.5" />
                    <span>Ekspor Format GeoJSON, CSV &amp; Raw JSON Feed</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#1E5345] shrink-0 mt-0.5" />
                    <span>Dukungan Teknis Email (Respon &lt; 24 jam)</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setApiEnvironment("production");
                  handleGenerateKey();
                  setIsApiKeyModalOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-[#18231D] hover:bg-[#25362D] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
              >
                Pilih Lisensi Riset
              </button>
            </div>

            {/* Tier 3: Enterprise & Technical Dinas (Featured) */}
            <div className="rounded-3xl bg-[#FAFBF9] border-2 border-[#1E5345] p-7 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
              {/* Highlight ribbon */}
              <div className="absolute top-0 right-0 bg-[#1E5345] text-white text-[10px] font-semibold tracking-wider uppercase px-4 py-1 rounded-bl-xl shadow-xs">
                PALING DIREKOMENDASIKAN
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-[#1E5345] flex items-center justify-center text-white">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1E5345] border border-emerald-300">
                    SLA 99.9% UPTIME
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#18231D] mb-1">Dinas Teknis &amp; Industri</h3>
                <p className="text-xs text-[#63756A] mb-5 leading-relaxed">
                  Untuk DLH, BPBD, Bank Sampah Induk Kota Malang, dan agregator daur ulang berskala operasional.
                </p>

                <div className="mb-6 pb-6 border-b border-[#DFE7DD]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#1E5345]">
                      {billingCycle === "monthly" ? "Rp 799.000" : "Rp 639.000"}
                    </span>
                    <span className="text-xs font-medium text-[#63756A]">/ bulan</span>
                  </div>
                  <span className="text-[11px] text-[#1E5345] font-semibold block mt-1">
                    {billingCycle === "annually" ? "Tagihan Rp 7.668.000 / tahun (Hemat Rp 1,9 Juta)" : "Akses produksi instan dengan dedicated token"}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-3 text-xs text-[#4B5950] mb-8">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span><strong>Unlimited Request</strong> / Tanpa Batas Kuota</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span>Webhook Realtime Disposisi &amp; Posisi Truk Armada</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span>Akses Endpoint POST Validasi Foto &amp; Timbangan Riil</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span>Analisis Forensik Kamera &amp; Verifikasi Anti-Fraud</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span>Technical Account Manager &amp; Integrasi Command Center</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setApiEnvironment("production");
                  handleGenerateKey();
                  setIsApiKeyModalOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-[#1E5345] hover:bg-[#153D32] text-white font-semibold text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Aktivasi Lisensi Enterprise</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>

          {/* Pricing Guarantee Strip */}
          <div className="mt-12 p-4 rounded-2xl bg-white border border-[#DFE7DD] max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#1E5345]/10 text-[#1E5345] flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="text-xs text-[#4B5950] leading-relaxed">
                <strong className="text-[#18231D]">Dukungan Hibah Open Data:</strong> Organisasi nirlaba lingkungan dan komunitas sungai DAS Kali Brantas dapat mengajukan token gratis dengan kuota setara Enterprise.
              </p>
            </div>
            <a
              href="mailto:developer@ecocitizen.id?subject=Permohonan%20Grant%20API%20TRINFO"
              className="text-xs font-semibold text-[#1E5345] hover:underline shrink-0"
            >
              Ajukan Hibah Riset →
            </a>
          </div>

        </div>
      </section>

      {/* ========================================================
          3. QUICKSTART CODE SNIPPET EXPLORER
      ======================================================== */}
      <section className="py-16 sm:py-20 border-b border-[#E8EDE5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-semibold tracking-widest text-[#1E5345] uppercase block mb-2">
              PANDUAN MULAI CEPAT
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18231D] tracking-tight">
              Koneksikan Aplikasi Anda dalam 3 Baris Kode
            </h2>
            <p className="text-sm text-[#4B5950] mt-2">
              Gunakan Bearer Token di header permintaan HTTP untuk mengotentikasi request data spasial lingkungan.
            </p>
          </div>

          <div className="rounded-3xl bg-[#142820] text-white p-5 sm:p-7 shadow-xl border border-emerald-950/40">
            {/* Top Toolbar: Language tabs + Copy */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(["curl", "javascript", "python", "php"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedLanguage(lang)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer",
                      selectedLanguage === lang
                        ? "bg-[#10B981] text-[#18231D]"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleCopy(quickstartSnippets[selectedLanguage], "quickstart")}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === "quickstart" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 opacity-70" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Block Display */}
            <pre className="text-xs sm:text-sm font-mono text-emerald-200 overflow-x-auto p-2 leading-relaxed">
              <code>{quickstartSnippets[selectedLanguage]}</code>
            </pre>
          </div>

        </div>
      </section>

      {/* ========================================================
          4. INTERACTIVE ENDPOINTS CATALOG
      ======================================================== */}
      <section className="py-16 sm:py-20 bg-[#FBFBF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-semibold tracking-widest text-[#1E5345] uppercase block mb-2">
                KATALOG ENDPOINT RESMI
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18231D] tracking-tight">
                Spesifikasi REST API v1
              </h2>
              <p className="text-sm text-[#4B5950] mt-2 max-w-xl">
                Jelajahi endpoint yang tersedia untuk pelaporan sampah, status drainase darurat, dan koordinasi armada.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px] sm:min-w-[320px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C9B90]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari endpoint atau kata kunci..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[#DFE7DD] text-xs text-[#18231D] focus:outline-none focus:border-[#1E5345] transition-all"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8">
            {[
              { id: "all", label: `Semua Endpoint (${API_ENDPOINTS.length})` },
              { id: "laporan", label: "Laporan & Radar Spasial" },
              { id: "peringatan", label: "Peringatan Dini Hidrologi" },
              { id: "penjemputan", label: "Misi & Armada Pengepul" },
              { id: "rewards", label: "Rewards & Poin Warga" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                  activeCategory === cat.id
                    ? "bg-[#18231D] text-white shadow-xs"
                    : "bg-white text-[#4B5950] border border-[#DFE7DD] hover:bg-slate-50"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Endpoints Accordion List */}
          <div className="space-y-4">
            {filteredEndpoints.map((ep) => {
              const isExpanded = expandedEndpoint === ep.id;

              return (
                <div
                  key={ep.id}
                  className="rounded-2xl bg-white border border-[#DFE7DD] overflow-hidden shadow-2xs transition-all hover:border-[#1E5345]/40"
                >
                  {/* Endpoint Header Bar */}
                  <div
                    onClick={() => setExpandedEndpoint(isExpanded ? "" : ep.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none bg-white hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold tracking-wider",
                          ep.method === "GET"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        )}
                      >
                        {ep.method}
                      </span>
                      <code className="text-xs sm:text-sm font-mono font-bold text-[#18231D] truncate">
                        /api/v1{ep.path}
                      </code>
                      <span className="text-xs text-[#63756A] font-medium hidden md:inline truncate">
                        — {ep.summary}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {ep.isAuthRequired && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Lock className="h-3 w-3" />
                          <span>Butuh Token</span>
                        </span>
                      )}
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Endpoint Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 border-t border-[#DFE7DD] bg-[#FAFBF9] space-y-6 animate-in fade-in duration-200">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#63756A] mb-1">
                          Deskripsi
                        </h4>
                        <p className="text-xs sm:text-sm text-[#18231D] leading-relaxed">
                          {ep.description}
                        </p>
                      </div>

                      {/* Parameters Table */}
                      {ep.parameters && ep.parameters.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#63756A] mb-2">
                            Query Parameters
                          </h4>
                          <div className="overflow-x-auto rounded-xl border border-[#DFE7DD] bg-white">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#FAFBF9] text-[#63756A] font-semibold border-b border-[#DFE7DD]">
                                <tr>
                                  <th className="px-3.5 py-2">Parameter</th>
                                  <th className="px-3.5 py-2">Tipe</th>
                                  <th className="px-3.5 py-2">Status</th>
                                  <th className="px-3.5 py-2">Keterangan</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#DFE7DD] font-mono text-[11px]">
                                {ep.parameters.map((param) => (
                                  <tr key={param.name}>
                                    <td className="px-3.5 py-2 font-bold text-[#18231D]">{param.name}</td>
                                    <td className="px-3.5 py-2 text-blue-700">{param.type}</td>
                                    <td className="px-3.5 py-2 font-sans">
                                      {param.required ? (
                                        <span className="text-rose-700 font-semibold">Wajib</span>
                                      ) : (
                                        <span className="text-slate-400 font-medium">Opsional</span>
                                      )}
                                    </td>
                                    <td className="px-3.5 py-2 font-sans text-[#4B5950]">{param.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Request Body Payload */}
                      {ep.requestBody && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#63756A]">
                              Contoh Request JSON Payload
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleCopy(ep.requestBody!, `req_${ep.id}`)}
                              className="text-[11px] font-semibold text-[#1E5345] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === `req_${ep.id}` ? "Tersalin!" : "Salin Payload"}
                            </button>
                          </div>
                          <div className="rounded-xl bg-[#142820] text-emerald-300 p-4 font-mono text-xs overflow-x-auto">
                            <pre><code>{ep.requestBody}</code></pre>
                          </div>
                        </div>
                      )}

                      {/* Response Payload */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#63756A]">
                            Contoh Response HTTP 200 OK
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleCopy(ep.responseSample, `res_${ep.id}`)}
                            className="text-[11px] font-semibold text-[#1E5345] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === `res_${ep.id}` ? "Tersalin!" : "Salin Response"}
                          </button>
                        </div>
                        <div className="rounded-xl bg-[#142820] text-emerald-200 p-4 font-mono text-xs overflow-x-auto">
                          <pre><code>{ep.responseSample}</code></pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          5. API KEY GENERATOR MODAL (Interactive Sandbox Generator)
      ======================================================== */}
      <Modal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        title="Dapatkan Kunci Akses API TRINFO"
        description="Gunakan API Key ini pada header Authorization request aplikasi Anda."
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Nama Aplikasi / Proyek
            </label>
            <input
              type="text"
              value={apiKeyName}
              onChange={(e) => setApiKeyName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-[#18231D] focus:outline-none focus:border-[#0EB29A]"
              placeholder="Contoh: Dashboard GIS Malang"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Pilihan Lingkungan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setApiEnvironment("sandbox")}
                className={cn(
                  "p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer",
                  apiEnvironment === "sandbox"
                    ? "border-[#1E5345] bg-[#1E5345]/5 text-[#1E5345]"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                Sandbox (Test API)
              </button>
              <button
                type="button"
                onClick={() => setApiEnvironment("production")}
                className={cn(
                  "p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer",
                  apiEnvironment === "production"
                    ? "border-[#1E5345] bg-[#1E5345]/5 text-[#1E5345]"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                Production (Live Token)
              </button>
            </div>
          </div>

          {generatedKey && (
            <div className="p-3.5 rounded-2xl bg-[#FAFBF9] border border-[#DFE7DD]">
              <div className="flex items-center justify-between text-xs text-[#63756A] mb-1.5 font-medium">
                <span>Kunci API Anda (Simpan di tempat aman):</span>
                <span className="text-[10px] font-bold uppercase text-emerald-700">{apiEnvironment}</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 rounded-lg bg-white border border-[#DFE7DD] font-mono text-xs text-[#18231D] truncate select-all">
                  {generatedKey}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedKey, "modal_key")}
                  className="px-3 py-2 rounded-lg bg-[#1E5345] text-white text-xs font-semibold hover:bg-[#153D32] transition-colors shrink-0 cursor-pointer"
                >
                  {copiedKey === "modal_key" ? "Disalin!" : "Salin"}
                </button>
              </div>
            </div>
          )}

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
            <strong>Cara Pemakaian:</strong> Kirim kunci di atas pada HTTP Header:
            <code className="block mt-1 p-1.5 rounded bg-white border border-emerald-200 font-mono text-[11px] text-[#1E5345]">
              Authorization: Bearer {generatedKey || "trinfo_live_..."}
            </code>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsApiKeyModalOpen(false)}
              className="rounded-xl"
            >
              Tutup
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateKey}
              className="rounded-xl bg-[#1E5345] hover:bg-[#153D32]"
            >
              Generate Ulang Token
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
