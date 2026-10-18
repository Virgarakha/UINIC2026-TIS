"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLaporanPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/laporan-saya");
  }, [router]);

  return null;
}
