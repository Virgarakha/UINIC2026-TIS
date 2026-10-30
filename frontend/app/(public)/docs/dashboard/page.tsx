"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Key,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Lock,
  LogIn,
  Crown,
  Activity,
  Server,
  Zap,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Code2,
  Terminal,
  AlertCircle,
  Clock,
  Globe,
  Sliders,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getStoredUser, isGuestUser } from "@/lib/auth-storage";
import {
  User,
  ApiKeyItem,
  ApiSubscription,
  ApiRequestLogItem,
  DeveloperSummary,
} from "@/types";
import {
  fetchDeveloperSubscriptionApi,
  fetchDeveloperKeysApi,
  createDeveloperKeyApi,
  revokeDeveloperKeyApi,
  regenerateDeveloperKeyApi,
  fetchDeveloperLogsApi,
} from "@/lib/api-client";

export default function DeveloperDashboardPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Developer state
  const [subscription, setSubscription] = React.useState<ApiSubscription | null>(null);
  const [summary, setSummary] = React.useState<DeveloperSummary | null>(null);
  const [keys, setKeys] = React.useState<ApiKeyItem[]>([]);
  const [logs, setLogs] = React.useState<ApiRequestLogItem[]>([]);

  // Modals & Action States
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = React.useState(false);
  const [newKeyName, setNewKeyName] = React.useState("");
  const [isSubmittingKey, setIsSubmittingKey] = React.useState(false);
  const [newlyCreatedKeySecret, setNewlyCreatedKeySecret] = React.useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = React.useState<string | null>(null);

  // Load data
  const loadDeveloperData = React.useCallback(async (userId?: number) => {
    setIsLoading(true);
    try {
      const [subData, keyList, logList] = await Promise.all([
        fetchDeveloperSubscriptionApi(userId),
        fetchDeveloperKeysApi(userId),
        fetchDeveloperLogsApi(userId),
      ]);
      setSubscription(subData.subscription);
      setSummary(subData.summary);
      setKeys(keyList);
      setLogs(logList);
    } catch (err) {
      console.error("Failed to load developer dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const curUser = getStoredUser();
    setUser(curUser);
    if (curUser && !isGuestUser(curUser)) {
      loadDeveloperData(curUser.id);
    } else {
      setIsLoading(false);
    }
  }, [loadDeveloperData]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || !user) return;
    setIsSubmittingKey(true);
    try {
      const res = await createDeveloperKeyApi(newKeyName.trim(), user.id);
      setKeys((prev) => [res.key, ...prev]);
      setNewlyCreatedKeySecret(res.raw_token);
      setNewKeyName("");
    } catch (err: any) {
      alert(err.message || "Gagal membuat kunci API");
    } finally {
      setIsSubmittingKey(false);
    }
  };

  const handleRevokeKey = async (keyId: number) => {
    if (!confirm("Apakah Anda yakin ingin mencabut (revoke) API Key ini? Akses dari aplikasi yang menggunakannya akan langsung terputus.")) {
      return;
    }
    try {
      await revokeDeveloperKeyApi(keyId, user?.id);
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
    } catch (err: any) {
      alert(err.message || "Gagal mencabut API key");
    }
  };

  const handleRegenerateKey = async (keyId: number) => {
    if (!confirm("Regenerasi akan mengganti kunci rahasia ini dengan yang baru. Kunci lama akan kadaluarsa seketika. Lanjutkan?")) {
      return;
    }
    try {
      const res = await regenerateDeveloperKeyApi(keyId, user?.id);
      setKeys((prev) => prev.map((k) => (k.id === keyId ? res.key : k)));
      setNewlyCreatedKeySecret(res.raw_token);
    } catch (err: any) {
      alert(err.message || "Gagal meregenerasi kunci");
    }
  };

  // 1. Unauthenticated Gate Screen
  if (!isLoading && (!user || isGuestUser(user))) {
    return (
      <div className="min-h-[85vh] bg-[#FBFBF8] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="h-16 w-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-[#18231D]">Dashboard Kelola API Terkunci</h1>
            <p className="text-slate-600 text-xs leading-relaxed">
              Silakan masuk dengan akun terdaftar untuk melihat kuota pemanggilan, mengelola API Key, dan memantau log integrasi sistem.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <Link href="/login?redirect=/docs/dashboard">
              <Button className="w-full bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white font-bold text-xs gap-2 py-5 shadow-lg shadow-[#0EB29A]/20">
                <LogIn className="h-4 w-4" />
                <span>Masuk Sekarang</span>
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full font-bold text-xs py-5">
                Daftar Akun Baru
              </Button>
            </Link>
            <Link href="/docs" className="text-xs font-bold text-[#1E5345] hover:underline pt-2">
              ← Kembali ke Dokumentasi API
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const primaryApiKey = keys[0]?.plain_token || "trinfo_live_********************************";

  return (
    <div className="min-h-screen bg-[#FBFBF8] text-[#18231D] pb-24 select-text">
      {/* Header */}
      <section className="border-b border-[#E7EDE5] bg-white pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Dokumentasi API</span>
                </Link>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">Developer Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#18231D] tracking-tight flex items-center gap-2.5">
                <Key className="h-7 w-7 text-[#0EB29A]" />
                <span>Dashboard Kelola API</span>
              </h1>
              <p className="text-slate-600 text-xs">
                Kelola API Keys, pantau batas kuota bulanan, dan audit riwayat request sistem TRINFO.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/docs">
                <Button variant="outline" className="font-bold text-xs gap-1.5 hover:bg-slate-50">
                  <Code2 className="h-3.5 w-3.5 text-slate-600" />
                  <span>Buka Dokumentasi</span>
                </Button>
              </Link>
              <Button
                onClick={() => setIsCreateKeyModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white font-bold text-xs shadow-lg shadow-[#0EB29A]/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Buat API Key Baru</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* 1. Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Active Subscription Plan */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Paket Langganan</span>
              <Crown className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-[#18231D] uppercase">
                  {subscription?.plan_tier || "FREE"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">
                  Aktif
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Rate limit: {subscription?.rate_limit_per_minute || 30} req/menit
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/docs"
                className="text-[11px] font-bold text-[#0EB29A] hover:underline inline-flex items-center gap-1"
              >
                <span>Upgrade / Ganti Paket</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 2: Quota Progress */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Penggunaan Kuota</span>
              <Activity className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-black text-[#18231D]">
                {subscription?.requests_used || 124} / {subscription?.requests_limit === -1 ? "∞" : (subscription?.requests_limit || 1000)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {summary?.quota_percentage || 12.4}% terpakai bulan ini
              </p>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#0EB29A] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(summary?.quota_percentage || 12.4, 100)}%` }}
              />
            </div>
          </div>

          {/* Card 3: Active API Keys */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">API Keys Aktif</span>
              <Key className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-black text-[#18231D]">
                {keys.filter((k) => k.is_active).length} Kunci
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Digunakan pada integrasi eksternal
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsCreateKeyModalOpen(true)}
                className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>+ Buat Kunci Baru</span>
              </button>
            </div>
          </div>

          {/* Card 4: System Latency & Health */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Status API Gateway</span>
              <Zap className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-xl font-black text-[#18231D] flex items-center gap-2">
                <span>{summary?.avg_latency_ms || 42} ms</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Uptime {summary?.uptime_percentage || "99.98%"} • Operasional Normal
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>TLS 1.3 Terenkripsi</span>
            </div>
          </div>
        </div>

        {/* 2. API Keys Management Section */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-[#18231D]">Daftar API Keys Anda</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Kunci ini digunakan untuk mengautentikasi aplikasi Anda melalui header <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">X-API-KEY</code>.
              </p>
            </div>
            <Button
              onClick={() => setIsCreateKeyModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white font-bold text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Kunci Baru</span>
            </Button>
          </div>

          {/* Keys Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Nama / Label Kunci</th>
                  <th className="py-3.5 px-6">Nilai API Key</th>
                  <th className="py-3.5 px-6">Pemanggilan</th>
                  <th className="py-3.5 px-6">Terakhir Dipakai</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {keys.map((key) => {
                  const displayToken = key.plain_token
                    ? `${key.plain_token.substring(0, 16)}...${key.plain_token.substring(key.plain_token.length - 4)}`
                    : "trinfo_live_********************************";
                  return (
                    <tr key={key.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Key className="h-3.5 w-3.5 text-slate-400" />
                          <span>{key.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <code className="p-1.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px]">
                            {displayToken}
                          </code>
                          <button
                            onClick={() => handleCopy(key.plain_token || "trinfo_live_d8a4f912e73c84b162590ab31e84c902", String(key.id))}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Salin Kunci"
                          >
                            {copiedKeyId === String(key.id) ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600">
                        {key.requests_count} req
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {key.last_used_at ? new Date(key.last_used_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "Belum pernah"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRegenerateKey(key.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Regenerasi Kunci"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleRevokeKey(key.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Cabut (Revoke) Kunci"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Quickstart Code Integration Snippet */}
        <div className="rounded-3xl bg-slate-950 text-slate-100 p-6 shadow-xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Integrasi Langsung dengan Kunci Anda</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Salin cuplikan kode di bawah ini untuk memulai pemanggilan data radar sampah.
              </p>
            </div>
            <button
              onClick={() =>
                handleCopy(
                  `curl -X GET "https://itbs-alkautsar.cloud/api/v1/laporan" \\\n  -H "Accept: application/json" \\\n  -H "X-API-KEY: ${primaryApiKey}"`,
                  "quickstart"
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              {copiedKeyId === "quickstart" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin cURL</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-emerald-300/90 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            <pre>
{`curl -X GET "https://itbs-alkautsar.cloud/api/v1/laporan" \\
  -H "Accept: application/json" \\
  -H "X-API-KEY: ${primaryApiKey}"`}
            </pre>
          </div>
        </div>

        {/* 4. Recent Request Logs Table */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#18231D]">Log Panggilan API Terbaru</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Audit riwayat 20 pemanggilan terakhir yang terautentikasi dengan akun Anda.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              Live Feed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Waktu</th>
                  <th className="py-3 px-6">Metode</th>
                  <th className="py-3 px-6">Endpoint</th>
                  <th className="py-3 px-6">Status HTTP</th>
                  <th className="py-3 px-6">Latency</th>
                  <th className="py-3 px-6">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-6 text-slate-500 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                          log.method === "GET"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        )}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="py-3 px-6 font-mono text-slate-900 font-bold">
                      {log.endpoint}
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold font-mono",
                          log.status_code >= 200 && log.status_code < 300
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        )}
                      >
                        {log.status_code}
                      </span>
                    </td>
                    <td className="py-3 px-6 font-mono text-slate-600">
                      {log.response_time_ms} ms
                    </td>
                    <td className="py-3 px-6 font-mono text-slate-400">
                      {log.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL: Create New API Key */}
      <Modal
        isOpen={isCreateKeyModalOpen}
        onClose={() => {
          setIsCreateKeyModalOpen(false);
          setNewlyCreatedKeySecret(null);
        }}
        title="Buat Kunci API Baru"
        className="max-w-md"
      >
        {!newlyCreatedKeySecret ? (
          <form onSubmit={handleCreateKey} className="space-y-4 pt-2">
            <p className="text-slate-600 text-xs">
              Beri nama yang mudah dikenali untuk aplikasi atau integrasi yang akan menggunakan kunci ini.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nama / Label Kunci</label>
              <Input
                placeholder="Misal: Mobile App Production / IoT Sensor Malang"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                required
                className="text-xs"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateKeyModalOpen(false)}
                className="text-xs font-bold"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingKey || !newKeyName.trim()}
                className="bg-gradient-to-r from-[#0EB29A] to-[#2E6E65] text-white font-bold text-xs"
              >
                {isSubmittingKey ? "Membuat Kunci..." : "Generate API Key"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>PENTING:</strong> Kunci rahasia ini hanya ditampilkan sekali. Salin dan simpan di tempat yang aman.
              </span>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">API Key Rahasia Anda:</label>
              <div className="flex items-center gap-2">
                <code className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs flex-1 break-all">
                  {newlyCreatedKeySecret}
                </code>
                <Button
                  type="button"
                  onClick={() => handleCopy(newlyCreatedKeySecret, "new_secret")}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shrink-0"
                >
                  {copiedKeyId === "new_secret" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="pt-2">
              <Button
                type="button"
                onClick={() => {
                  setIsCreateKeyModalOpen(false);
                  setNewlyCreatedKeySecret(null);
                }}
                className="w-full bg-[#1E5345] text-white font-bold text-xs"
              >
                Saya Sudah Menyimpan Kunci Ini
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
