export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  isExternal?: boolean;
}

export const publicNavItems: NavItem[] = [
  {
    title: "Beranda",
    href: "/",
    iconName: "Home",
  },
  {
    title: "Peta Bahaya & Radar",
    href: "/peta",
    iconName: "MapPin",
    badge: "Live",
  },
  {
    title: "Peringatan Dini",
    href: "/peringatan",
    iconName: "ShieldAlert",
    badge: "Siaga",
  },
  {
    title: "Katalog Rewards",
    href: "/rewards",
    iconName: "Gift",
  },
  {
    title: "Edukasi & Daur Ulang",
    href: "/edukasi",
    iconName: "BookOpen",
  },
  {
    title: "Dokumentasi API",
    href: "/docs",
    iconName: "Code2",
    badge: "v1.0",
  },
];

export const dashboardNavItems: NavItem[] = [
  {
    title: "Ikhtisar Dashboard",
    href: "/dashboard",
    iconName: "LayoutDashboard",
  },
  {
    title: "Laporan Saya",
    href: "/dashboard/laporan",
    iconName: "Trash2",
  },
  {
    title: "Radar Titik Sampah",
    href: "/dashboard/peta",
    iconName: "Compass",
  },
  {
    title: "Poin & Penukaran",
    href: "/dashboard/poin",
    iconName: "Coins",
  },
  {
    title: "Pengaturan Akun",
    href: "/dashboard/profil",
    iconName: "User",
  },
];
