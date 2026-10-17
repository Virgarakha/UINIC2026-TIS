export interface HazardDefinition {
  id: string;
  name: string;
  shortName: string;
  iconText: string;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    glow: string;
  };
  description: string;
}

export const HAZARDS_REGISTRY: Record<string, HazardDefinition> = {
  banjir: {
    id: "banjir",
    name: "Banjir & Luapan Air",
    shortName: "Banjir & Luapan",
    iconText: "🌊",
    colorClass: {
      bg: "bg-red-500/10",
      text: "text-red-600",
      border: "border-red-500/30",
      badgeBg: "bg-red-500",
      glow: "shadow-red-500/20",
    },
    description: "Timbunan sampah menyumbat drainase atau badan air sehingga berisiko meluap saat hujan lebat.",
  },
  wabah: {
    id: "wabah",
    name: "Wabah Penyakit & Sanitasi",
    shortName: "Wabah & DBD",
    iconText: "🦟",
    colorClass: {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      border: "border-amber-500/30",
      badgeBg: "bg-amber-500",
      glow: "shadow-amber-500/20",
    },
    description: "Genangan air pada timbunan sampah menjadi sarang vektor penyakit berbahaya (DBD, malaria, diare).",
  },
  kebakaran: {
    id: "kebakaran",
    name: "Bahaya Kebakaran & Gas Metana",
    shortName: "Gas Metana & Api",
    iconText: "🔥",
    colorClass: {
      bg: "bg-orange-500/10",
      text: "text-orange-600",
      border: "border-orange-500/30",
      badgeBg: "bg-orange-500",
      glow: "shadow-orange-500/20",
    },
    description: "Akumulasi gas metana pada tumpukan sampah basah mudah terpicu percikan api dan memicu kebakaran spontan.",
  },
  bau: {
    id: "bau",
    name: "Pencemaran Bau & Kualitas Air",
    shortName: "Bau & Toksik Air",
    iconText: "☣️",
    colorClass: {
      bg: "bg-[#0EB29A]/15",
      text: "text-[#2E6E65]",
      border: "border-[#0EB29A]/40",
      badgeBg: "bg-[#0EB29A]",
      glow: "shadow-[#0EB29A]/20",
    },
    description: "Bau busuk menyengat dan air lindi (leachate) meresap mencemari sumur warga sekitar.",
  },
  longsor: {
    id: "longsor",
    name: "Longsor Timbunan / Erosi Tanggul",
    shortName: "Longsor Timbunan",
    iconText: "⚠️",
    colorClass: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-600",
      border: "border-yellow-500/30",
      badgeBg: "bg-yellow-500",
      glow: "shadow-yellow-500/20",
    },
    description: "Timbunan sampah tinggi di kemiringan tanah/tanggul berisiko runtuh menimpa pemukiman warga.",
  },
  limbah_b3: {
    id: "limbah_b3",
    name: "Limbah Medis / B3 Berbahaya",
    shortName: "Limbah Medis / B3",
    iconText: "🛑",
    colorClass: {
      bg: "bg-purple-500/10",
      text: "text-purple-600",
      border: "border-purple-500/30",
      badgeBg: "bg-purple-500",
      glow: "shadow-purple-500/20",
    },
    description: "Ditemukan limbah medis, jarum suntik bekas, atau zat kimia berbahaya yang dibuang secara liar.",
  },
  lainnya: {
    id: "lainnya",
    name: "Dampak Bahaya Lingkungan Lainnya",
    shortName: "Bahaya Lainnya",
    iconText: "📢",
    colorClass: {
      bg: "bg-blue-500/10",
      text: "text-blue-600",
      border: "border-blue-500/30",
      badgeBg: "bg-blue-500",
      glow: "shadow-blue-500/20",
    },
    description: "Dampak buruk lingkungan lainnya yang membutuhkan atensi segera dari dinas dan warga.",
  },
};

/**
 * Resolves hazard details from any given string match.
 */
export function getHazardInfo(hazardStr?: string | null): HazardDefinition {
  if (!hazardStr) {
    return {
      id: "aman",
      name: "Terkendali / Aman",
      shortName: "Aman",
      iconText: "🛡️",
      colorClass: {
        bg: "bg-[#0EB29A]/15",
        text: "text-[#2E6E65]",
        border: "border-[#0EB29A]/30",
        badgeBg: "bg-[#0EB29A]",
        glow: "shadow-[#0EB29A]/20",
      },
      description: "Tidak terdeteksi potensi bahaya kritis lingkungan saat ini.",
    };
  }

  const lower = hazardStr.toLowerCase();
  if (lower.includes("banjir") || lower.includes("luapan")) return HAZARDS_REGISTRY.banjir;
  if (lower.includes("wabah") || lower.includes("dbd") || lower.includes("sanitasi")) return HAZARDS_REGISTRY.wabah;
  if (lower.includes("kebakaran") || lower.includes("metana") || lower.includes("api")) return HAZARDS_REGISTRY.kebakaran;
  if (lower.includes("bau") || lower.includes("pencemaran") || lower.includes("kualitas air")) return HAZARDS_REGISTRY.bau;
  if (lower.includes("longsor") || lower.includes("tanggul") || lower.includes("erosi")) return HAZARDS_REGISTRY.longsor;
  if (lower.includes("medis") || lower.includes("b3") || lower.includes("berbahaya")) return HAZARDS_REGISTRY.limbah_b3;

  return HAZARDS_REGISTRY.lainnya;
}
