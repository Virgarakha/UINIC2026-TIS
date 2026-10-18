"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Droplets,
  Flame,
  Recycle,
  ShieldCheck,
  Search,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Coins,
  ChevronRight,
  ArrowRight,
  Check,
  X,
  Award,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { getStoredUser, recordPointTransaction, setStoredSession } from "@/lib/auth-storage";
import { User } from "@/types";
import { cn } from "@/lib/utils";

interface GuideItem {
  id: number;
  title: string;
  category: "Daur Ulang" | "Mitigasi Banjir" | "Keselamatan" | "Kesehatan Warga";
  icon: any;
  color: string;
  desc: string;
  readTime: string;
  steps: string[];
  actionPrompt: string;
}

const ALL_GUIDES: GuideItem[] = [
  {
    id: 1,
    title: "Pilah Sampah dari Rumah (Kardus & Logam)",
    category: "Daur Ulang",
    icon: Recycle,
    color: "emerald",
    desc: "Pisahkan sampah kering bernilai ekonomis (kardus, botol PET, kaleng aluminium). Mitra pengepul akan menjemput langsung dan mengonversi menjadi saldo poin.",
    readTime: "3 mnt baca",
    steps: [
      "Pisahkan kardus dari kemasan makanan yang berminyak.",
      "Pipihkan botol plastik PET dan lepaskan tutupnya untuk menghemat volume wadah.",
      "Kumpulkan kaleng aluminium dan besi bekas dalam karung kering.",
      "Buka menu Peta EcoPatrol dan tekan 'Minta Penjemputan Armada' untuk mencairkan saldo cuan.",
    ],
    actionPrompt: "Pilah sekarang & jadwalkan penjemputan mitra armada!",
  },
  {
    id: 2,
    title: "Mencegah Sumbatan Drainase Menjelang Musim Hujan",
    category: "Mitigasi Banjir",
    icon: Droplets,
    color: "blue",
    desc: "Jangan membuang sampah ranting, kasur, atau perabotan bekas ke aliran sungai. Satu sumbatan 50% di gorong-gorong dapat memicu banjir luapan hingga radius 500 meter.",
    readTime: "4 mnt baca",
    steps: [
      "Periksa saluran parit di depan tempat tinggal setiap 2 minggu sekali.",
      "Gunakan jaring saringan kasar pada mulut gorong-gorong pemukiman.",
      "Jika menemukan timbunan sampah liar di aliran sungai, ambil foto melalui kamera EcoPatrol.",
      "AI akan memverifikasi tingkat sumbatan dan langsung menerbitkan peringatan siaga ke warga sekitar.",
    ],
    actionPrompt: "Ambil foto saluran air tersumbat untuk mitigasi banjir darurat!",
  },
  {
    id: 3,
    title: "Waspada Akumulasi Gas Metana & Bahaya Api",
    category: "Keselamatan",
    icon: Flame,
    color: "orange",
    desc: "Timbunan sampah basah tebal memproduksi gas metana yang sangat mudah meledak atau terbakar spontan di bawah terik matahari. Hindari membakar sampah di area TPS liar.",
    readTime: "2 mnt baca",
    steps: [
      "Hindari membakar sampah di sekitar timbunan TPS liar karena memicu percikan gas metana bawah tanah.",
      "Pisahkan sampah organik basah untuk pengomposan rumah tangga guna menekan fermentasi anaerobik.",
      "Laporkan asap atau hawa panas tidak wajar dari timbunan sampah melalui menu Lapor Bahaya.",
    ],
    actionPrompt: "Laporkan lokasi timbunan sampah berisiko terbakar!",
  },
  {
    id: 4,
    title: "Sanitasi Pemukiman Bebas Jentik Nyamuk DBD",
    category: "Kesehatan Warga",
    icon: ShieldCheck,
    color: "purple",
    desc: "Kubur atau daur ulang wadah plastik dan ban bekas yang dapat menampung air hujan. Jentik nyamuk Aedes aegypti berkembang biak hanya dalam waktu 7 hari pada genangan sampah.",
    readTime: "3 mnt baca",
    steps: [
      "Kuras dan tutup tempat penampungan air secara teratur (metode 3M Plus).",
      "Daur ulang wadah plastik bekas, botol, dan ban bekas agar tidak menampung air hujan.",
      "Gunakan fitur Sedekah Lingkungan di EcoPatrol untuk menyerahkan sampah wadah ke pengepul daur ulang.",
    ],
    actionPrompt: "Bersihkan sarang jentik nyamuk & raih bonus poin ganda!",
  },
];

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Berapa lama jentik nyamuk Aedes aegypti (DBD) dapat berkembang biak di genangan air sampah plastik?",
    options: ["1-2 hari", "7-10 hari", "3-4 minggu", "2 bulan"],
    correctIndex: 1,
    explanation: "Tepat! Nyamuk DBD hanya butuh waktu 7-10 hari dari telur menjadi nyamuk dewasa di air tergenang sampah.",
  },
  {
    question: "Gas berbahaya apa yang mudah terbakar spontan dari timbunan sampah basah tebal?",
    options: ["Gas Helium", "Gas Oksigen Murni", "Gas Metana (CH₄)", "Gas Nitrogen"],
    correctIndex: 2,
    explanation: "Benar! Fermentasi sampah organik menghasilkan gas metana yang mudah meledak jika terkena panas terik matahari.",
  },
  {
    question: "Jenis sampah manakah yang memiliki nilai ekonomi tinggi dan siap dijemput oleh mitra armada pengepul EcoPatrol?",
    options: ["Kardus tebal & Botol Plastik PET", "Sisa makanan basah berkuah", "Daun kering lapuk", "Kaca pecah kecil"],
    correctIndex: 0,
    explanation: "Tepat sekali! Kardus kemasan dan botol PET adalah bahan baku daur ulang bernilai tinggi yang langsung bernilai uang/poin.",
  },
];

export default function EdukasiPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("semua");
  const [activeGuide, setActiveGuide] = React.useState<GuideItem | null>(null);

  // Mini Eco-Quiz State
  const [isQuizModalOpen, setIsQuizModalOpen] = React.useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isAnswered, setIsAnswered] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = React.useState(false);
  const [hasClaimedPoints, setHasClaimedPoints] = React.useState(false);

  React.useEffect(() => {
    setUser(getStoredUser());
  }, []);

  // Filter guides
  const filteredGuides = React.useMemo(() => {
    return ALL_GUIDES.filter((g) => {
      if (selectedCategory !== "semua" && g.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          g.title.toLowerCase().includes(q) ||
          g.desc.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery, selectedCategory]);

  const handleStartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsQuizCompleted(false);
    setHasClaimedPoints(false);
    setIsQuizModalOpen(true);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === QUIZ_QUESTIONS[currentQuestionIndex].correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsQuizCompleted(true);
      // Award +25 points
      if (!hasClaimedPoints) {
        setHasClaimedPoints(true);
        recordPointTransaction(25, "edukasi_kuis", "Menyelesaikan Kuis Cerdas Lingkungan (+25 Poin)");
        const updated = getStoredUser();
        setUser(updated);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header with Breadcrumb */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0EB29A] transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0EB29A] mb-1">
              <BookOpen className="h-4 w-4" />
              <span>Pusat Edukasi & Tanggap Bencana Lingkungan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2B3752]">
              Panduan Praktis Pengelolaan Sampah & Pencegahan Banjir
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Edukasi terapan langkah demi langkah untuk membangun pemukiman yang tanggap terhadap sumbatan air, bahaya kebakaran TPS liar, dan wabah penyakit.
            </p>
          </div>

          {/* Interactive Quiz Trigger Banner */}
          <button
            type="button"
            onClick={handleStartQuiz}
            className="flex-shrink-0 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-black text-xs shadow-md shadow-amber-500/25 flex items-center gap-2 hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-200" />
            <div className="text-left">
              <span className="block text-[10px] text-amber-100 font-bold uppercase tracking-wider">
                Tantangan Warga
              </span>
              <span>Ikuti Kuis Eco (+25 Poin)</span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Interactive Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {["semua", "Daur Ulang", "Mitigasi Banjir", "Keselamatan", "Kesehatan Warga"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                selectedCategory === cat
                  ? "bg-[#2B3752] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {cat === "semua" ? "Semua Topik" : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px] sm:min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari panduan, kata kunci..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#2B3752] focus:outline-none focus:border-[#0EB29A] focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* 3. Grid of Educational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGuides.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              className="p-6 hover:shadow-lg transition-all flex flex-col justify-between bg-white border-slate-200 text-[#2B3752] group cursor-pointer"
              onClick={() => setActiveGuide(item)}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-11 w-11 rounded-2xl bg-[#0EB29A]/10 text-[#0EB29A] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500">
                      {item.readTime}
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 uppercase px-2.5 py-0.5 rounded-full bg-slate-100">
                      {item.category}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#2B3752] mb-2 group-hover:text-[#0EB29A] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#0EB29A] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  <span>Buka Panduan Lengkap</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>

                <Link
                  href="/lapor"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 hover:underline"
                >
                  Lapor Sampah →
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 4. Full Guide Reader Modal */}
      <Modal
        isOpen={activeGuide !== null}
        onClose={() => setActiveGuide(null)}
        title={activeGuide?.title || "Panduan Praktis"}
        description={activeGuide ? `${activeGuide.category} • ${activeGuide.readTime}` : ""}
      >
        {activeGuide && (
          <div className="space-y-5 pt-3">
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {activeGuide.desc}
            </p>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                Langkah Praktis Penerapan di Lingkungan
              </h4>
              <div className="space-y-2.5">
                {activeGuide.steps.map((st, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs"
                  >
                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-xs text-[#2B3752] leading-relaxed font-medium">
                      {st}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3">
              <span className="text-xs font-bold">
                {activeGuide.actionPrompt}
              </span>
              <Link href="/lapor">
                <Button
                  size="sm"
                  className="bg-[#0EB29A] hover:bg-[#0ca18b] text-white font-bold text-xs shadow-sm flex-shrink-0"
                >
                  Buka Kamera Lapor
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* 5. Interactive Mini Eco-Quiz Modal */}
      <Modal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        title="Kuis Cerdas Lingkungan"
        description="Jawab 3 pertanyaan seputar lingkungan dan raih +25 Poin Reward instan!"
      >
        <div className="pt-2">
          {!isQuizCompleted ? (
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>
                  Pertanyaan {currentQuestionIndex + 1} dari {QUIZ_QUESTIONS.length}
                </span>
                <span className="text-amber-600 font-extrabold flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5" />
                  <span>+25 Poin Reward</span>
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question */}
              <h4 className="text-sm sm:text-base font-extrabold text-[#2B3752] leading-snug">
                {QUIZ_QUESTIONS[currentQuestionIndex].question}
              </h4>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {QUIZ_QUESTIONS[currentQuestionIndex].options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === QUIZ_QUESTIONS[currentQuestionIndex].correctIndex;

                  let style = "bg-white border-slate-200 text-slate-800 hover:border-[#0EB29A]";
                  if (isAnswered) {
                    if (isCorrect) {
                      style = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold";
                    } else if (isSelected) {
                      style = "bg-rose-50 border-rose-300 text-rose-800";
                    }
                  } else if (isSelected) {
                    style = "border-[#0EB29A] bg-emerald-50/50 text-[#0EB29A]";
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={cn(
                        "w-full p-3.5 rounded-2xl border text-xs text-left transition-all flex items-center justify-between gap-3 cursor-pointer",
                        style
                      )}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrect && (
                        <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <X className="h-4 w-4 text-rose-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation */}
              {isAnswered && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 animate-in fade-in">
                  <p className="font-semibold">
                    {QUIZ_QUESTIONS[currentQuestionIndex].explanation}
                  </p>
                </div>
              )}

              {/* Next Button */}
              {isAnswered && (
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleNextQuestion}
                    className="font-bold text-xs"
                  >
                    <span>
                      {currentQuestionIndex < QUIZ_QUESTIONS.length - 1
                        ? "Pertanyaan Berikutnya →"
                        : "Selesaikan Kuis & Klaim Poin 🎉"}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Completion Screen */
            <div className="text-center py-6 space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center animate-bounce shadow-md">
                <Award className="h-8 w-8" />
              </div>

              <div>
                <span className="text-[11px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                  Kuis Selesai!
                </span>
                <h3 className="text-xl font-black text-[#2B3752] mt-2">
                  Luar Biasa, Pemahaman Lingkungan Anda Sangat Baik!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Skor Anda: {score} dari {QUIZ_QUESTIONS.length} Benar.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold inline-flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" />
                <span>+25 Poin Reward telah ditambahkan ke buku kas akun Anda!</span>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsQuizModalOpen(false)}
                >
                  Tutup
                </Button>
                <Link href="/rewards">
                  <Button
                    variant="primary"
                    size="sm"
                    className="font-bold text-xs"
                  >
                    Lihat Saldo di Rewards
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
