"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Code2,
  Terminal,
  Key,
  Layers,
  ShieldCheck,
  Zap,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Lock,
  ArrowRight,
  Database,
  Globe,
  Activity,
  Server,
  Play,
  CheckCircle2,
  Sliders,
  LogIn,
  Crown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { getStoredUser, isGuestUser } from "@/lib/auth-storage";
import { User, ApiPlanTier, ApiSubscription } from "@/types";
import {
  getApiBaseUrl,
  fetchDeveloperSubscriptionApi,
  subscribeDeveloperPlanApi,
} from "@/lib/api-client";

interface EndpointDoc {
  id: string;
  category: string;
  method: "GET" | "POST" | "DELETE";
  path: string;
  title: string;
  description: string;
  requiresAuth: boolean;
  params?: { name: string; type: string; required: boolean; desc: string }[];
  bodyParams?: { name: string; type: string; required: boolean; desc: string }[];
  curlExample: string;
  jsExample: string;
  pythonExample: string;
  responseExample: Record<string, any>;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: "auth-login",
    category: "Autentikasi",
    method: "POST",
    path: "/api/v1/auth/login",
    title: "Login & Dapatkan Bearer Token",
    description: "Autentikasi akun pengguna/developer untuk mendapatkan Sanctum Bearer token yang digunakan pada request terproteksi.",
    requiresAuth: false,
    bodyParams: [
      { name: "email", type: "string", required: true, desc: "Alamat email terdaftar." },
      { name: "password", type: "string", required: true, desc: "Kata sandi pengguna (min 8 karakter)." },
      { name: "device_name", type: "string", required: false, desc: "Label nama token/perangkat (default: api-token)." },
    ],
    curlExample: `curl -X POST "http://localhost:8000/api/v1/auth/login" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{"email":"pengepul@ecocitizen.id","password":"password"}'`,
    jsExample: `const res = await fetch("http://localhost:8000/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Accept": "application/json" },
  body: JSON.stringify({ email: "pengepul@ecocitizen.id", password: "password" })
});
const data = await res.json();
console.log(data.data.token);`,
    pythonExample: `import requests

url = "http://localhost:8000/api/v1/auth/login"
payload = {"email": "pengepul@ecocitizen.id", "password": "password"}
headers = {"Content-Type": "application/json", "Accept": "application/json"}

response = requests.post(url, json=payload, headers=headers)
print(response.json()["data"]["token"])`,
    responseExample: {
      success: true,
      message: "Login successful",
      data: {
        user: { id: 2, name: "Budi Santoso", email: "pengepul@ecocitizen.id", role: "pengepul", poin_reward: 240 },
        token: "1|k9w4...p8z9",
        token_type: "Bearer"
      }
    }
  },
  {
    id: "laporan-index",
    category: "Pelaporan & Geospasial",
    method: "GET",
    path: "/api/v1/laporan",
    title: "Daftar Titik Timbunan Sampah & Radar",
    description: "Mengambil daftar titik tumpukan sampah aktif dengan koordinat GPS, skor bahaya, data AI, dan status penjemputan.",
    requiresAuth: false,
    params: [
      { name: "status", type: "string", required: false, desc: "Filter status: butuh_tindakan, siaga_banjir, tuntas." },
      { name: "kategori_id", type: "integer", required: false, desc: "ID kategori sampah (1 s.d 5)." },
      { name: "lat", type: "float", required: false, desc: "Latitude pusat radar untuk pencarian radius (misal: -7.9826)." },
      { name: "lng", type: "float", required: false, desc: "Longitude pusat radar (misal: 112.6308)." },
      { name: "radius_km", type: "float", required: false, desc: "Radius jangkauan pencarian (misal: 5.0)." },
    ],
    curlExample: `curl -X GET "http://localhost:8000/api/v1/laporan?radius_km=5&lat=-7.9826&lng=112.6308" \\
  -H "Accept: application/json" \\
  -H "X-API-KEY: trinfo_live_d8a4f912e73c84b162590ab31e84c902"`,
    jsExample: `const res = await fetch("http://localhost:8000/api/v1/laporan?radius_km=5", {
  headers: {
    "Accept": "application/json",
    "X-API-KEY": "trinfo_live_d8a4f912e73c84b162590ab31e84c902"
  }
});
const { data } = await res.json();
console.log(data);`,
    pythonExample: `import requests

url = "http://localhost:8000/api/v1/laporan"
headers = {"X-API-KEY": "trinfo_live_d8a4f912e73c84b162590ab31e84c902"}
params = {"radius_km": 5, "lat": -7.9826, "lng": 112.6308}

res = requests.get(url, headers=headers, params=params)
print(res.json()["data"])`,
    responseExample: {
      success: true,
      message: "Laporan retrieved successfully",
      data: [
        {
          id: 101,
          latitude: -7.9826,
          longitude: 112.6308,
          deskripsi: "Tumpukan sampah plastik di gorong-gorong jembatan.",
          foto_url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9",
          status: { id: 3, kode: "siaga_banjir", nama: "Siaga Banjir" },
          kategori: { id: 1, nama: "Plastik & Residu" },
          analisis_ai: {
            volume_estimasi_m3: 3.5,
            persentase_sumbatan: 75,
            tingkat_bahaya: "AWAS",
            estimasi_nilai_daur_ulang: 42000
          }
        }
      ]
    }
  },
  {
    id: "laporan-store",
    category: "Pelaporan & Geospasial",
    method: "POST",
    path: "/api/v1/laporan",
    title: "Kirim Laporan Sampah Baru",
    description: "Mengunggah data laporan sampah baru dengan foto terverifikasi, koordinat GPS akurat, dan metadata forensik anti-fraud.",
    requiresAuth: true,
    bodyParams: [
      { name: "latitude", type: "float", required: true, desc: "Koordinat latitude lokasi timbunan sampah." },
      { name: "longitude", type: "float", required: true, desc: "Koordinat longitude lokasi timbunan sampah." },
      { name: "foto_url", type: "string", required: true, desc: "URL atau base64 gambar sampah yang telah ber-watermark." },
      { name: "deskripsi", type: "string", required: true, desc: "Deskripsi singkat kondisi timbunan di lapangan." },
      { name: "kategori_id", type: "integer", required: true, desc: "ID kategori sampah (1=Plastik, 2=Organik, dll)." },
      { name: "metadata_forensik", type: "object", required: false, desc: "Payload JSON verifikasi AI & GPS anti-fraud." },
    ],
    curlExample: `curl -X POST "http://localhost:8000/api/v1/laporan" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer <TOKEN>" \\
  -d '{
    "latitude": -7.9826,
    "longitude": 112.6308,
    "foto_url": "https://images.unsplash.com/photo-1611284446314",
    "deskripsi": "Sumbatan aliran sungai bawah jembatan Klojen",
    "kategori_id": 1
  }'`,
    jsExample: `const res = await fetch("http://localhost:8000/api/v1/laporan", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_SANCTUM_TOKEN"
  },
  body: JSON.stringify({
    latitude: -7.9826,
    longitude: 112.6308,
    foto_url: "https://images.unsplash.com/photo-1611284446314",
    deskripsi: "Sumbatan aliran sungai bawah jembatan Klojen",
    kategori_id: 1
  })
});
const result = await res.json();
console.log(result.data.id);`,
    pythonExample: `import requests

url = "http://localhost:8000/api/v1/laporan"
headers = {"Authorization": "Bearer YOUR_SANCTUM_TOKEN"}
payload = {
    "latitude": -7.9826,
    "longitude": 112.6308,
    "foto_url": "https://images.unsplash.com/photo-1611284446314",
    "deskripsi": "Sumbatan aliran sungai bawah jembatan Klojen",
    "kategori_id": 1
}

res = requests.post(url, json=payload, headers=headers)
print(res.json())`,
    responseExample: {
      success: true,
      message: "Laporan sampah berhasil dibuat",
      data: {
        id: 104,
        latitude: -7.9826,
        longitude: 112.6308,
        deskripsi: "Sumbatan aliran sungai bawah jembatan Klojen",
        status: { kode: "butuh_tindakan", nama: "Menunggu Penjemputan" },
        created_at: "2026-10-29T02:40:00Z"
      }
    }
  },
  {
    id: "peringatan-dini",
    category: "Peringatan Dini",
    method: "GET",
    path: "/api/v1/peringatan-dini",
    title: "Feed Early Warning Multi-Bahaya",
    description: "Mengambil daftar siaga dini bahaya banjir, luapan air, dan wabah sanitasi berdasarkan kalkulasi sensor hidrologi & AI.",
    requiresAuth: false,
    curlExample: `curl -X GET "http://localhost:8000/api/v1/peringatan-dini" \\
  -H "Accept: application/json" \\
  -H "X-API-KEY: trinfo_live_d8a4f912e73c84b162590ab31e84c902"`,
    jsExample: `const res = await fetch("http://localhost:8000/api/v1/peringatan-dini", {
  headers: { "X-API-KEY": "trinfo_live_d8a4f912e73c84b162590ab31e84c902" }
});
const alerts = await res.json();
console.log(alerts.data);`,
    pythonExample: `import requests

res = requests.get(
    "http://localhost:8000/api/v1/peringatan-dini",
    headers={"X-API-KEY": "trinfo_live_d8a4f912e73c84b162590ab31e84c902"}
)
print(res.json()["data"])`,
    responseExample: {
      success: true,
      message: "Peringatan dini retrieved successfully",
      data: [
        {
          id: 1,
          laporan_id: 101,
          tipe_bahaya: "Banjir & Luapan Air",
          level_peringatan: "AWAS",
          radius_terdampak_meter: 800,
          pesan_broadcast: "AWAS! Terjadi sumbatan 70% di aliran Sungai Brantas Klojen.",
          status_aktif: true,
          created_at: "2026-10-29T02:00:00Z"
        }
      ]
    }
  },
  {
    id: "armada-aktif",
    category: "Armada & Logistik",
    method: "GET",
    path: "/api/v1/penjemputan/armada-aktif",
    title: "Posisi GPS Live Armada Truk Mitra",
    description: "Mengambil koordinat telemetri langsung armada truk pengepul yang sedang online atau dalam rute penjemputan sampah.",
    requiresAuth: false,
    curlExample: `curl -X GET "http://localhost:8000/api/v1/penjemputan/armada-aktif" \\
  -H "Accept: application/json"`,
    jsExample: `const res = await fetch("http://localhost:8000/api/v1/penjemputan/armada-aktif");
const armada = await res.json();
console.log(armada.data);`,
    pythonExample: `import requests
res = requests.get("http://localhost:8000/api/v1/penjemputan/armada-aktif")
print(res.json()["data"])`,
    responseExample: {
      success: true,
      message: "Armada aktif retrieved successfully",
      data: [
        {
          pengepul_id: 2,
          pengepul_nama: "Budi Santoso",
          plat_nomor: "N 8472 AB",
          jenis_kendaraan: "Truk Engkel 2 Ton",
          latitude: -7.9822,
          longitude: 112.6315,
          heading: 84.5,
          status_online: true,
          kapasitas_tersisa_kg: 1450
        }
      ]
    }
  }
];

export default function DocsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"docs" | "subscription" | "tester">("docs");
  const [selectedEndpoint, setSelectedEndpoint] = React.useState<EndpointDoc>(ENDPOINTS[1]);
  const [activeCodeLang, setActiveCodeLang] = React.useState<"curl" | "js" | "python">("curl");
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  // User state
  const [user, setUser] = React.useState<User | null>(null);
  const [userSubscription, setUserSubscription] = React.useState<ApiSubscription | null>(null);
  const [isGuestPromptOpen, setIsGuestPromptOpen] = React.useState(false);
  const [targetSubscribeTier, setTargetSubscribeTier] = React.useState<ApiPlanTier>("free");
  const [isSubscribing, setIsSubscribing] = React.useState(false);
  const [subscribeSuccessModal, setSubscribeSuccessModal] = React.useState<string | null>(null);

  // Interactive tester state
  const [testResult, setTestResult] = React.useState<any>(null);
  const [isTestingLoading, setIsTestingLoading] = React.useState(false);

  React.useEffect(() => {
    const curUser = getStoredUser();
    setUser(curUser);

    if (curUser && !isGuestUser(curUser)) {
      fetchDeveloperSubscriptionApi(curUser.id).then((res) => {
        setUserSubscription(res.subscription);
      });
    }
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSelectPlan = async (tier: ApiPlanTier) => {
    if (!user || isGuestUser(user)) {
      setTargetSubscribeTier(tier);
      setIsGuestPromptOpen(true);
      return;
    }

    setIsSubscribing(true);
    try {
      const res = await subscribeDeveloperPlanApi(tier, user.id);
      setUserSubscription(res.subscription);
      setSubscribeSuccessModal(`Paket ${tier.toUpperCase()} berhasil diaktifkan untuk akun Anda!`);
    } catch (err: any) {
      alert(err.message || "Gagal mengaktifkan paket");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleRunLiveTest = async () => {
    setIsTestingLoading(true);
    setTestResult(null);
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/peringatan-dini`);
      const json = await res.json();
      setTestResult({
        status: res.status,
        statusText: res.statusText,
        headers: { "content-type": res.headers.get("content-type") },
        body: json,
      });
    } catch (err: any) {
      setTestResult({ error: err.message });
    } finally {
      setIsTestingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF8] text-[#18231D] pb-24 select-text">
      {/* 1. Header Banner */}
      <section className="border-b border-[#E7EDE5] bg-gradient-to-b from-white to-[#F6F8F5] pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#1E5345] text-xs font-black">
                <Code2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>TRINFO DEVELOPER PLATFORM • REST API v1.0</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#18231D] tracking-tight">
                Dokumentasi & Integrasi API
              </h1>
              <p className="text-slate-600 text-sm leading-relaxed">
                Akses terbuka dan terproteksi untuk telemetri timbunan sampah, radar geospasial real-time,
                early warning hidrologi, klasifikasi AI Gemini, dan logistik armada pembersih.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/docs/dashboard">
                <Button className="gap-2 bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white font-bold shadow-lg shadow-[#0EB29A]/20 hover:scale-105 active:scale-95 transition-all">
                  <Key className="h-4 w-4" />
                  <span>Dashboard Kelola API</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setActiveTab("subscription")}
                className="gap-2 border-slate-300 font-bold hover:bg-slate-50"
              >
                <Crown className="h-4 w-4 text-amber-500" />
                <span>Paket Langganan</span>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 border-b border-slate-200 pt-2">
            <button
              onClick={() => setActiveTab("docs")}
              className={cn(
                "px-4 py-2.5 text-xs font-black rounded-t-xl transition-all border-b-2 -mb-[2px] flex items-center gap-2 cursor-pointer",
                activeTab === "docs"
                  ? "border-[#1E5345] text-[#1E5345] bg-white shadow-2xs"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Spesifikasi Endpoints</span>
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={cn(
                "px-4 py-2.5 text-xs font-black rounded-t-xl transition-all border-b-2 -mb-[2px] flex items-center gap-2 cursor-pointer",
                activeTab === "subscription"
                  ? "border-[#1E5345] text-[#1E5345] bg-white shadow-2xs"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              <span>Paket Langganan (Pricing)</span>
              {userSubscription && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase">
                  {userSubscription.plan_tier}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("tester")}
              className={cn(
                "px-4 py-2.5 text-xs font-black rounded-t-xl transition-all border-b-2 -mb-[2px] flex items-center gap-2 cursor-pointer",
                activeTab === "tester"
                  ? "border-[#1E5345] text-[#1E5345] bg-white shadow-2xs"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <Play className="h-3.5 w-3.5 text-indigo-500" />
              <span>Interactive Explorer</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ========================================================= */}
        {/* TAB 1: SPESIFIKASI ENDPOINTS API                          */}
        {/* ========================================================= */}
        {activeTab === "docs" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Left: Endpoints Menu */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Quick Info Box */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Base URL API Gateway</span>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs">
                  <span className="truncate">http://localhost:8000/api/v1</span>
                  <button
                    onClick={() => handleCopy("http://localhost:8000/api/v1", "base_url")}
                    className="p-1 hover:text-white transition-colors"
                    title="Salin Base URL"
                  >
                    {copiedText === "base_url" ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Gunakan header <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-[10px]">X-API-KEY</code> atau <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-[10px]">Authorization: Bearer &lt;token&gt;</code>.
                </p>
              </div>

              {/* Endpoints List grouped */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3 space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider px-2">Daftar Endpoint</span>
                <div className="space-y-1">
                  {ENDPOINTS.map((ep) => {
                    const isSelected = selectedEndpoint.id === ep.id;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => setSelectedEndpoint(ep)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 text-xs cursor-pointer group",
                          isSelected
                            ? "bg-slate-900 text-white font-bold shadow-xs"
                            : "hover:bg-slate-50 text-slate-700"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-black uppercase",
                              ep.method === "GET"
                                ? isSelected ? "bg-emerald-500 text-slate-950" : "bg-emerald-100 text-emerald-800"
                                : ep.method === "POST"
                                ? isSelected ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            )}
                          >
                            {ep.method}
                          </span>
                          <span className="truncate">{ep.title}</span>
                        </div>
                        {ep.requiresAuth && (
                          <Lock className={cn("h-3 w-3 shrink-0", isSelected ? "text-amber-400" : "text-slate-400")} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Codes Legend */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Status Codes Standar</span>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between"><strong className="text-emerald-600 font-mono">200 OK</strong> <span>Permintaan sukses</span></div>
                  <div className="flex items-center justify-between"><strong className="text-blue-600 font-mono">201 Created</strong> <span>Data berhasil dibuat</span></div>
                  <div className="flex items-center justify-between"><strong className="text-amber-600 font-mono">401 Unauthorized</strong> <span>Token / Key salah</span></div>
                  <div className="flex items-center justify-between"><strong className="text-red-600 font-mono">422 Unprocessable</strong> <span>Validasi gagal</span></div>
                  <div className="flex items-center justify-between"><strong className="text-purple-600 font-mono">429 Rate Limited</strong> <span>Batas kuota habis</span></div>
                </div>
              </div>
            </aside>

            {/* Main Center & Right: Endpoint Details & Snippets */}
            <div className="lg:col-span-8 space-y-6">
              {/* Endpoint Header Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider",
                        selectedEndpoint.method === "GET"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : selectedEndpoint.method === "POST"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      )}
                    >
                      {selectedEndpoint.method}
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-800">{selectedEndpoint.path}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedEndpoint.requiresAuth ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                        <Lock className="h-3 w-3 text-amber-600" />
                        <span>Perlu Autentikasi</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                        <Globe className="h-3 w-3 text-emerald-600" />
                        <span>Akses Publik</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#18231D]">{selectedEndpoint.title}</h2>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">{selectedEndpoint.description}</p>
                </div>

                {/* Parameters Table */}
                {(selectedEndpoint.params || selectedEndpoint.bodyParams) && (
                  <div className="pt-2 space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      {selectedEndpoint.params ? "Query Parameters" : "Request Body (JSON)"}
                    </h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <tr>
                            <th className="py-2.5 px-3">Field</th>
                            <th className="py-2.5 px-3">Tipe</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {(selectedEndpoint.params || selectedEndpoint.bodyParams)?.map((p) => (
                            <tr key={p.name} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.name}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">{p.type}</td>
                              <td className="py-2.5 px-3">
                                {p.required ? (
                                  <span className="text-red-600 font-bold text-[10px] bg-red-50 px-1.5 py-0.5 rounded">Required</span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">Optional</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">{p.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Code Snippets Box */}
              <div className="rounded-3xl bg-slate-950 text-slate-100 overflow-hidden shadow-xl border border-slate-800">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveCodeLang("curl")}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                        activeCodeLang === "curl" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                      )}
                    >
                      cURL
                    </button>
                    <button
                      onClick={() => setActiveCodeLang("js")}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                        activeCodeLang === "js" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                      )}
                    >
                      JavaScript
                    </button>
                    <button
                      onClick={() => setActiveCodeLang("python")}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                        activeCodeLang === "python" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                      )}
                    >
                      Python
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const snippet =
                        activeCodeLang === "curl"
                          ? selectedEndpoint.curlExample
                          : activeCodeLang === "js"
                          ? selectedEndpoint.jsExample
                          : selectedEndpoint.pythonExample;
                      handleCopy(snippet, "code_snippet");
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                  >
                    {copiedText === "code_snippet" ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 font-mono text-xs overflow-x-auto leading-relaxed text-emerald-300/90">
                  <pre>
                    {activeCodeLang === "curl"
                      ? selectedEndpoint.curlExample
                      : activeCodeLang === "js"
                      ? selectedEndpoint.jsExample
                      : selectedEndpoint.pythonExample}
                  </pre>
                </div>
              </div>

              {/* Response JSON Preview */}
              <div className="rounded-3xl bg-slate-950 text-slate-100 overflow-hidden shadow-xl border border-slate-800">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300">Contoh Respons JSON (200 OK)</span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(selectedEndpoint.responseExample, null, 2), "response_json")}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                  >
                    {copiedText === "response_json" ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span className="text-[11px]">Salin JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 font-mono text-xs overflow-x-auto leading-relaxed text-slate-300 max-h-72 overflow-y-auto">
                  <pre>{JSON.stringify(selectedEndpoint.responseExample, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PAKET LANGGANAN / SUBSCRIPTION                     */}
        {/* ========================================================= */}
        {activeTab === "subscription" && (
          <div className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-[#18231D] tracking-tight">
                Paket Langganan & Kuota Akses API
              </h2>
              <p className="text-slate-600 text-xs leading-relaxed">
                Pilih kuota yang sesuai dengan kebutuhan integrasi Anda. Akses instan ke API key, webhook real-time,
                dan model machine learning hidrologi.
              </p>
            </div>

            {/* 3 Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan 1: Free Developer */}
              <div
                className={cn(
                  "rounded-3xl p-6 bg-white border transition-all flex flex-col justify-between shadow-sm relative",
                  userSubscription?.plan_tier === "free" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200"
                )}
              >
                {userSubscription?.plan_tier === "free" && (
                  <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                    Paket Aktif Anda
                  </span>
                )}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-[#18231D]">Developer (Free)</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Untuk eksplorasi, prototipe, dan riset akademik.</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-3xl font-black text-[#18231D]">Rp 0</span>
                    <span className="text-slate-500 text-xs font-bold"> / bulan</span>
                  </div>
                  <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> <strong>1.000 requests</strong> / bulan</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Rate limit 30 requests / menit</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> 1 API Key aktif</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Akses seluruh public endpoint</li>
                    <li className="flex items-center gap-2 text-slate-400"><Check className="h-4 w-4 text-slate-300" /> Komunitas developer Discord</li>
                  </ul>
                </div>
                <div className="pt-6">
                  <Button
                    onClick={() => handleSelectPlan("free")}
                    disabled={userSubscription?.plan_tier === "free" || isSubscribing}
                    variant={userSubscription?.plan_tier === "free" ? "outline" : "primary"}
                    className="w-full font-bold text-xs"
                  >
                    {userSubscription?.plan_tier === "free" ? "Sedang Digunakan" : "Pilih Paket Free"}
                  </Button>
                </div>
              </div>

              {/* Plan 2: Pro Startup & NGO (Highlighted) */}
              <div
                className={cn(
                  "rounded-3xl p-6 bg-gradient-to-b from-slate-900 to-slate-950 text-white border transition-all flex flex-col justify-between shadow-2xl relative",
                  userSubscription?.plan_tier === "pro" ? "border-emerald-400 ring-2 ring-emerald-400/40" : "border-slate-800"
                )}
              >
                <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  {userSubscription?.plan_tier === "pro" ? "Paket Aktif Anda" : "Paling Populer"}
                </span>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>Pro (Startup & NGO)</span>
                      <Sparkles className="h-4 w-4 text-amber-400" />
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">Untuk aplikasi komersial, bank sampah, dan komunitas peduli banjir.</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-3xl font-black text-white">Rp 149.000</span>
                    <span className="text-slate-400 text-xs font-bold"> / bulan</span>
                  </div>
                  <ul className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-200">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> <strong>50.000 requests</strong> / bulan</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Rate limit 300 requests / menit</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Hingga 5 API Key independen</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Early Warning Webhooks real-time</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Dukungan prioritas SLA 99.9%</li>
                  </ul>
                </div>
                <div className="pt-6">
                  <Button
                    onClick={() => handleSelectPlan("pro")}
                    disabled={userSubscription?.plan_tier === "pro" || isSubscribing}
                    className="w-full bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white font-bold text-xs shadow-lg shadow-[#0EB29A]/30 hover:scale-102 transition-all"
                  >
                    {userSubscription?.plan_tier === "pro" ? "Sedang Digunakan" : "Berlangganan Pro Sekarang"}
                  </Button>
                </div>
              </div>

              {/* Plan 3: Enterprise & Pemda */}
              <div
                className={cn(
                  "rounded-3xl p-6 bg-white border transition-all flex flex-col justify-between shadow-sm relative",
                  userSubscription?.plan_tier === "enterprise" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200"
                )}
              >
                {userSubscription?.plan_tier === "enterprise" && (
                  <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                    Paket Aktif Anda
                  </span>
                )}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-[#18231D]">Enterprise (Dinas & BUMN)</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Integrasi Smart City, Dinas Lingkungan Hidup, dan BPBD.</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-3xl font-black text-[#18231D]">Rp 990.000</span>
                    <span className="text-slate-500 text-xs font-bold"> / bulan</span>
                  </div>
                  <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> <strong>Unlimited requests</strong> (Tak Terbatas)</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Rate limit 2.000 requests / menit</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Unlimited API Keys</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Dedicated Machine Learning Pipeline</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> 24/7 Dedicated Engineer & SLA 99.99%</li>
                  </ul>
                </div>
                <div className="pt-6">
                  <Button
                    onClick={() => handleSelectPlan("enterprise")}
                    disabled={userSubscription?.plan_tier === "enterprise" || isSubscribing}
                    variant="outline"
                    className="w-full font-bold text-xs hover:bg-slate-50"
                  >
                    {userSubscription?.plan_tier === "enterprise" ? "Sedang Digunakan" : "Aktifkan Enterprise"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Banner to Dashboard */}
            <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-[#1E5345]">Sudah berlangganan dan punya API Key?</h4>
                <p className="text-xs text-slate-600">
                  Kunjungi dashboard developer untuk melihat statistik pemanggilan, log request, dan regenerasi kunci.
                </p>
              </div>
              <Link href="/docs/dashboard">
                <Button className="bg-[#1E5345] text-white font-bold text-xs gap-1.5 shrink-0">
                  <span>Buka Dashboard API</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: INTERACTIVE API EXPLORER / TESTER                  */}
        {/* ========================================================= */}
        {activeTab === "tester" && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-[#18231D]">Interactive API Tester</h2>
              <p className="text-slate-600 text-xs leading-relaxed">
                Jalankan uji coba pemanggilan langsung ke endpoint <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs">GET /api/v1/peringatan-dini</code> dari browser Anda.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleRunLiveTest}
                disabled={isTestingLoading}
                className="gap-2 bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white font-bold text-xs"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isTestingLoading ? "Memanggil Endpoint..." : "Eksekusi Request Langsung"}</span>
              </Button>
            </div>

            {testResult && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700">Respons Hasil Uji Coba:</span>
                <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-96">
                  <pre>{JSON.stringify(testResult, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: Login Required for Subscription */}
      <Modal
        isOpen={isGuestPromptOpen}
        onClose={() => setIsGuestPromptOpen(false)}
        title="Masuk untuk Berlangganan API"
        className="max-w-md"
      >
        <div className="space-y-4 pt-2">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="h-6 w-6" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="font-black text-slate-900 text-base">Akses Khusus Pengguna Terdaftar</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Untuk mengaktifkan paket langganan <strong>{targetSubscribeTier.toUpperCase()}</strong> dan mendapatkan
              kredensial API Key resmi, Anda harus masuk ke akun Anda terlebih dahulu.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link href={`/login?redirect=/docs`}>
              <Button className="w-full bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white font-bold text-xs gap-2">
                <LogIn className="h-4 w-4" />
                <span>Masuk Sekarang</span>
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full font-bold text-xs">
                Daftar Akun Baru
              </Button>
            </Link>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Subscription Success */}
      <Modal
        isOpen={!!subscribeSuccessModal}
        onClose={() => setSubscribeSuccessModal(null)}
        title="Langganan Berhasil Diaktifkan"
        className="max-w-md"
      >
        <div className="space-y-4 pt-2 text-center">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-slate-700 text-xs font-semibold">{subscribeSuccessModal}</p>
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/docs/dashboard">
              <Button className="w-full bg-[#1E5345] text-white font-bold text-xs gap-2">
                <Key className="h-4 w-4" />
                <span>Buka Dashboard Kelola API</span>
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setSubscribeSuccessModal(null)} className="w-full text-xs font-bold">
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
