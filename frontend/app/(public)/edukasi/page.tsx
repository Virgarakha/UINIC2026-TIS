import * as React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Droplets, Flame, Recycle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EdukasiPage() {
  const guides = [
    {
      title: "Pilah Sampah dari Rumah (Kardus & Logam)",
      category: "Daur Ulang",
      icon: Recycle,
      color: "emerald",
      desc: "Pisahkan sampah kering bernilai ekonomis (kardus, botol PET, kaleng aluminium). Mitra pengepul akan menjemput langsung dan mengonversi menjadi saldo poin.",
    },
    {
      title: "Mencegah Sumbatan Drainase Menjelang Musim Hujan",
      category: "Mitigasi Banjir",
      icon: Droplets,
      color: "blue",
      desc: "Jangan membuang sampah ranting, kasur, atau perabotan bekas ke aliran sungai. Satu sumbatan 50% di gorong-gorong dapat memicu banjir luapan hingga radius 500 meter.",
    },
    {
      title: "Waspada Akumulasi Gas Metana & Bahaya Api",
      category: "Keselamatan",
      icon: Flame,
      color: "orange",
      desc: "Timbunan sampah basah tebal memproduksi gas metana yang sangat mudah meledak atau terbakar spontan di bawah terik matahari. Hindari membakar sampah di area TPS liar.",
    },
    {
      title: "Sanitasi Pemukiman Bebas Jentik Nyamuk DBD",
      category: "Kesehatan Warga",
      icon: ShieldCheck,
      color: "purple",
      desc: "Kubur atau daur ulang wadah plastik dan ban bekas yang dapat menampung air hujan. Jentik nyamuk Aedes aegypti berkembang biak hanya dalam waktu 7 hari pada genangan sampah.",
    },
  ];

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
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0EB29A] mb-1">
          <BookOpen className="h-4 w-4" />
          <span>Pusat Edukasi & Panduan Praktis Warga</span>
        </div>
        <h1 className="text-3xl font-black text-[#2B3752]">
          Panduan Cerdas Pengelolaan Sampah & Pencegahan Bencana
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Edukasi praktis langkah demi langkah untuk membangun lingkungan pemukiman yang tangguh terhadap risiko banjir dan wabah penyakit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="p-6 hover:shadow-lg transition-all flex flex-col justify-between bg-white border-slate-200 text-[#2B3752]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-[#0EB29A]/10 text-[#0EB29A] flex items-center justify-center font-bold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase px-2 py-0.5 rounded-full bg-slate-100">
                    {item.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#2B3752] mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link href="/lapor">
                  <Button variant="ghost" size="sm" className="text-xs text-[#0EB29A] hover:text-[#2E6E65] font-bold p-0 hover:bg-transparent">
                    Terapkan & Lapor Sampah →
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
