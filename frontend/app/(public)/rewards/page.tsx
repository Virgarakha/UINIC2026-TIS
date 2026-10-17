"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Coins, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { MOCK_HADIAH } from "@/lib/api-client";
import { KatalogHadiah } from "@/types";

export default function RewardsPage() {
  const [selectedHadiah, setSelectedHadiah] = React.useState<KatalogHadiah | null>(null);
  const [isSuccessClaim, setIsSuccessClaim] = React.useState(false);

  const handleClaim = (item: KatalogHadiah) => {
    setSelectedHadiah(item);
    setIsSuccessClaim(false);
  };

  const executeClaim = () => {
    setIsSuccessClaim(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0EB29A] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
          <Coins className="h-4 w-4" />
          <span>Ekonomi Sirkular & Gamifikasi Warga</span>
        </div>
        <h1 className="text-3xl font-black text-[#2B3752]">
          Katalog Penukaran Hadiah Aksi Lingkungan
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Tukarkan poin yang Anda dapatkan dari melaporkan timbunan sampah liar atau menyetorkan sampah bernilai daur ulang ke mitra pengepul.
        </p>
      </div>

      {/* User Balance Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-100">
            Saldo Poin Partisipasi Anda
          </span>
          <h2 className="text-3xl font-black mt-1 flex items-center gap-2">
            <Coins className="h-7 w-7 text-yellow-200" />
            <span>240 Poin</span>
          </h2>
          <p className="text-xs text-amber-100 mt-1">
            Status: <strong>Warga Teladan Lingkungan (Level 2)</strong>
          </p>
        </div>

        <Link href="/lapor">
          <Button className="bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs gap-1.5 shadow-sm">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span>Dapatkan Poin Tambahan (+50)</span>
          </Button>
        </Link>
      </div>

      {/* Rewards Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_HADIAH.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between bg-white border-slate-200 text-[#2B3752]">
            <div>
              <div className="aspect-square relative overflow-hidden bg-slate-100">
                <img
                  src={item.foto_url || "https://placehold.co/400x400"}
                  alt={item.nama}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md text-amber-400 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  <span>{item.poin_dibutuhkan} Poin</span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="text-sm font-bold text-[#2B3752]">{item.nama}</h4>
                <p className="text-xs text-slate-500">{item.deskripsi}</p>
              </div>
            </div>

            <div className="p-4 pt-0">
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">Stok: {item.stok} unit</span>
                <Button variant="glow" size="sm" onClick={() => handleClaim(item)}>
                  Klaim Hadiah
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Claim Modal Dialog */}
      <Modal
        isOpen={!!selectedHadiah}
        onClose={() => setSelectedHadiah(null)}
        title={isSuccessClaim ? "Penukaran Berhasil! 🎉" : "Konfirmasi Klaim Hadiah"}
        description={isSuccessClaim ? "Kode klaim voucher telah siap digunakan." : "Pastikan saldo poin Anda mencukupi."}
      >
        {selectedHadiah && (
          <div className="space-y-4">
            {isSuccessClaim ? (
              <div className="text-center py-4 space-y-3">
                <div className="h-12 w-12 rounded-full bg-[#0EB29A]/15 text-[#0EB29A] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h4 className="font-bold text-sm text-[#2B3752]">
                  Kode Voucher: <code className="text-[#0EB29A] font-mono text-base font-black">ECO-PLN-94821</code>
                </h4>
                <p className="text-xs text-slate-500">
                  Tunjukkan kode klaim ini saat petugas PLN atau minimarket memproses penukaran voucher Anda.
                </p>
                <Button variant="primary" className="w-full mt-2" onClick={() => setSelectedHadiah(null)}>
                  Selesai
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <img
                    src={selectedHadiah.foto_url || "https://placehold.co/100"}
                    alt={selectedHadiah.nama}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-[#2B3752]">{selectedHadiah.nama}</h5>
                    <p className="text-xs text-amber-600 font-bold mt-0.5">
                      Membutuhkan {selectedHadiah.poin_dibutuhkan} Poin
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Saldo poin Anda saat ini: <strong>240 Poin</strong>. Setelah penukaran, sisa saldo Anda adalah{" "}
                  <strong>{240 - selectedHadiah.poin_dibutuhkan} Poin</strong>.
                </p>

                <div className="pt-2 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedHadiah(null)}>
                    Batal
                  </Button>
                  <Button variant="glow" className="flex-1" onClick={executeClaim}>
                    Konfirmasi Tukar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
