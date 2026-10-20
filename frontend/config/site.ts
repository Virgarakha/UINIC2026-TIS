export const getBackendBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "");
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
};

export const siteConfig = {
  name: "TRINFO",
  shortName: "TRINFO",
  tagline: "Trash Information System - Platform Cerdas Pemantauan Sampah Berbasis AI",
  description:
    "Solusi crowdsourcing warga terintegrasi AI Vision & sensor hidrologi untuk pencegahan banjir, pemilahan sampah bernilai ekonomis, dan perlindungan sanitasi lingkungan.",
  url: "https://ecopatrol.id",
  logo: "/images/logo.png",
  logoText: "/images/logo-text.png",
  ogImage: "/images/logo-text.png",
  get links() {
    const base = getBackendBaseUrl();
    return {
      github: "https://github.com/uinic08/ecopatrol",
      apiDocs: `${base}/api/documentation`,
      backendAdmin: `${base}/admin/dashboard`,
    };
  },
  emergencyContacts: [
    { label: "Call Center BPBD Darurat", number: "112", icon: "PhoneCall" },
    { label: "Dinas Lingkungan Hidup", number: "0811-3000-888", icon: "Truck" },
    { label: "Posko Siaga Banjir & Relawan", number: "0812-4455-9999", icon: "ShieldAlert" },
  ],
  statsHighlights: {
    totalSampahKg: 14850,
    titikRawanTermitigasi: 64,
    wargaTerlindungi: 12500,
    poinTerkumpul: 342000,
  },
};

export type SiteConfig = typeof siteConfig;
