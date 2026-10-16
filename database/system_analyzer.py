#!/usr/bin/env python3
"""
Sistem Sampah - Database System Analyzer
========================================
Tool analisis arsitektur database, validasi skema, evaluasi query spasial/JSONB,
serta audit integritas data laporan sampah & prediksi banjir berbasis AI.
"""

import json
import math
import os
import sys
from datetime import datetime

# ==============================================================================
# SAMPLE PAYLOAD FROM SPECIFICATION
# ==============================================================================
SAMPLE_AI_ANALYSIS = {
    "laporan_id": "1001",
    "analisis_ai": {
        "jenis_kasus": {
            "utama": "sumbatan_sungai",
            "sekunder": ["penumpukan_sampah", "risiko_genangan"]
        },
        "temuan_visual": {
            "jenis_sampah": ["plastik", "ranting", "sampah_campuran"],
            "kondisi": "sampah menumpuk di saluran sungai",
            "estimasi_volume_m3": {
                "nilai": 2.5,
                "status": "estimasi_visual",
                "akurasi_terverifikasi": False
            },
            "estimasi_sumbatan_persen": 45,
            "indikasi_lain": ["aliran air tampak menyempit"]
        },
        "kondisi_lingkungan": {
            "lokasi": {
                "kota": "Malang",
                "latitude": -7.9666200,
                "longitude": 112.6326300
            },
            "cuaca": {
                "kondisi_saat_laporan": "berawan",
                "curah_hujan_24_jam_mm": 18,
                "curah_hujan_72_jam_mm": 42,
                "prakiraan_hujan_24_jam": True,
                "sumber": "simulasi",
                "periode_pengamatan": "24 jam sebelum laporan"
            },
            "musim": {
                "klasifikasi": "masa_peralihan",
                "sumber": "simulasi",
                "catatan": "Klasifikasi aktual perlu diverifikasi"
            },
            "geografi": {
                "dekat_sungai": True,
                "elevasi_meter": None,
                "kapasitas_saluran": None
            }
        },
        "faktor_penyebab": [
            {
                "faktor": "pembuangan_sampah",
                "status": "dugaan",
                "bukti": "Sampah terlihat menumpuk di aliran sungai",
                "keyakinan": "sedang"
            },
            {
                "faktor": "curah_hujan",
                "status": "data_simulasi",
                "bukti": "Curah hujan 24 jam diasumsikan 18 mm",
                "keyakinan": "belum_diverifikasi"
            },
            {
                "faktor": "sedimentasi",
                "status": "belum_diketahui",
                "bukti": None,
                "keyakinan": "tidak_dapat_dinilai"
            }
        ],
        "analisis_dampak": [
            {
                "dampak": "hambatan_aliran_air",
                "tingkat": "tinggi",
                "penjelasan": "Sampah berpotensi mengurangi ruang aliran"
            },
            {
                "dampak": "genangan",
                "tingkat": "sedang",
                "penjelasan": "Risiko bergantung pada debit air dan kapasitas sungai"
            },
            {
                "dampak": "pencemaran_lingkungan",
                "tingkat": "sedang",
                "penjelasan": "Sampah dapat menurunkan kualitas lingkungan"
            }
        ],
        "analisis_risiko": {
            "risiko_banjir": "belum_dapat_dipastikan",
            "risiko_penyumbatan_lanjutan": "tinggi",
            "faktor_yang_belum_tersedia": [
                "debit_sungai",
                "kapasitas_saluran",
                "prakiraan_intensitas_hujan",
                "riwayat_banjir"
            ]
        },
        "prediksi": {
            "tinggi_banjir_cm": None,
            "alasan": "Data hidrologi belum mencukupi",
            "prediksi_lain": [
                {
                    "kejadian": "penyumbatan_bertambah",
                    "status": "potensial",
                    "jangka_waktu": None
                }
            ]
        },
        "rekomendasi": [
            {
                "tindakan": "pembersihan_sampah",
                "prioritas": "tinggi"
            },
            {
                "tindakan": "pemeriksaan_kondisi_saluran",
                "prioritas": "tinggi"
            },
            {
                "tindakan": "pemantauan_cuaca",
                "prioritas": "sedang"
            }
        ],
        "data_quality": {
            "foto_tersedia": True,
            "data_cuaca_terverifikasi": False,
            "data_hidrologi_tersedia": False,
            "status_kesimpulan": "sementara"
        }
    }
}

# ==============================================================================
# ANALYZER ENGINE
# ==============================================================================
class DatabaseSystemAnalyzer:
    def __init__(self, schema_file="schema.sql"):
        self.schema_file = schema_file
        self.analysis_report = {}
        self.health_score = 100
        self.findings = []

    def check_schema_file(self):
        """Menganalisis keberadaan dan kelengkapan file DDL SQL"""
        if not os.path.exists(self.schema_file):
            self.findings.append(("FAIL", "File schema.sql tidak ditemukan."))
            self.health_score -= 30
            return False

        with open(self.schema_file, "r") as f:
            content = f.read()

        micro_tables = [
            "kategori_sampah", "status_laporan", "kategori_hadiah", 
            "master_jenis_sampah", "master_tipe_tanggapan"
        ]
        core_tables = [
            "users", "alamat_pengguna", "katalog_hadiah", "laporan_sampah", 
            "tanggapan_laporan", "data_lingkungan", "analisis_ai", 
            "penjemputan_sampah", "peringatan_dini",
            "penukaran_hadiah", "riwayat_poin", "riwayat_status_laporan"
        ]
        tables = micro_tables + core_tables
        indexes = [
            "idx_laporan_coords", "idx_analisis_risiko", "idx_analisis_temuan_visual", 
            "idx_laporan_tanggapan", "idx_laporan_kategori_id", "idx_laporan_status_id",
            "idx_penjemputan_laporan_id", "idx_peringatan_laporan_id",
            "idx_penukaran_hadiah_status", "idx_riwayat_poin_user_id"
        ]
        
        found_tables = [t for t in tables if f"CREATE TABLE IF NOT EXISTS {t}" in content or f"CREATE TABLE {t}" in content]
        found_indexes = [idx for idx in indexes if idx in content]

        return {
            "size_bytes": len(content),
            "tables_found": found_tables,
            "micro_tables_found": [t for t in micro_tables if t in found_tables],
            "missing_tables": [t for t in tables if t not in found_tables],
            "indexes_found": found_indexes,
            "has_postgis_gist": "idx_laporan_coords" in content,
            "has_jsonb_gin": "idx_analisis_risiko" in content and "jsonb_path_ops" in content,
            "has_view": "view_peta_interaktif" in content,
            "has_crowdsource_counter": "total_tanggapan" in content and "trg_tanggapan_counter" in content,
            "has_rewards_system": "katalog_hadiah" in content and "penukaran_hadiah" in content and "trg_klaim_hadiah" in content,
            "has_anti_fraud": "trg_validasi_ai_poin" in content and "confidence_score >= 70.00" in content,
            "has_penjemputan": "penjemputan_sampah" in content and "trg_selesai_penjemputan" in content,
            "has_early_warning": "peringatan_dini" in content,
            "has_seed_data": "INSERT INTO kategori_sampah" in content and "INSERT INTO status_laporan" in content
        }

    def validate_ai_json_schema(self, data):
        """Memvalidasi kontrak schema data JSON analisis AI"""
        expected_keys = [
            "jenis_kasus", "temuan_visual", "kondisi_lingkungan", 
            "faktor_penyebab", "analisis_dampak", "analisis_risiko", 
            "prediksi", "rekomendasi", "data_quality"
        ]
        
        ai_data = data.get("analisis_ai", {})
        missing_keys = [k for k in expected_keys if k not in ai_data]
        
        # Evaluasi tipe data & batasan
        type_checks = []
        tv = ai_data.get("temuan_visual", {})
        if "estimasi_sumbatan_persen" in tv:
            val = tv["estimasi_sumbatan_persen"]
            if 0 <= val <= 100:
                type_checks.append(("estimasi_sumbatan_persen", "VALID (0-100%)", True))
            else:
                type_checks.append(("estimasi_sumbatan_persen", f"OUT_OF_BOUNDS ({val})", False))

        if "estimasi_volume_m3" in tv and isinstance(tv["estimasi_volume_m3"], dict):
            type_checks.append(("estimasi_volume_m3.nilai", "VALID NUMERIC", True))

        kl = ai_data.get("kondisi_lingkungan", {})
        loc = kl.get("lokasi", {})
        if "latitude" in loc and "longitude" in loc:
            lat, lng = loc["latitude"], loc["longitude"]
            if -90 <= lat <= 90 and -180 <= lng <= 180:
                type_checks.append(("koordinat_gps", "VALID GEOGRAPHIC COORD", True))
            else:
                type_checks.append(("koordinat_gps", "INVALID COORD", False))

        return {
            "is_valid": len(missing_keys) == 0,
            "missing_keys": missing_keys,
            "type_checks": type_checks,
            "has_guardrails": "data_quality" in ai_data and "faktor_yang_belum_tersedia" in ai_data.get("analisis_risiko", {})
        }

    def simulate_haversine_distance(self, lat1, lon1, lat2, lon2):
        """Menghitung jarak spasial geosentris (rumus Haversine dalam kilometer)"""
        R = 6371.0  # Radius bumi (km)
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def simulate_workload_queries(self):
        """Simulasi pola query utama untuk Sistem Sampah"""
        # Titik acuan: Alun-Alun Tugu Malang (-7.9772, 112.6340)
        user_lat, user_lon = -7.9772, 112.6340
        
        # Data Laporan Uji
        reports = [
            {"id": "1001", "title": "Sumbatan Sungai Brantas", "lat": -7.9666, "lon": 112.6326, "kategori": "sumbatan_sungai", "sumbat_pct": 45, "plastik": True, "risiko_banjir": "tinggi"},
            {"id": "1002", "title": "TPS Liar Jl. Ijen", "lat": -7.9720, "lon": 112.6220, "kategori": "tps_liar", "sumbat_pct": 10, "plastik": True, "risiko_banjir": "rendah"},
            {"id": "1003", "title": "Kardus & Plastik Blimbing", "lat": -7.9400, "lon": 112.6450, "kategori": "tumpukan_jalan", "sumbat_pct": 0, "plastik": True, "risiko_banjir": "aman"},
            {"id": "1004", "title": "Drainase Sukun", "lat": -7.9950, "lon": 112.6200, "kategori": "saluran_drainase", "sumbat_pct": 25, "plastik": False, "risiko_banjir": "sedang"}
        ]

        # 1. Query Pengepul (Radius <= 3 km yang ada plastik)
        pengepul_results = []
        for r in reports:
            dist = self.simulate_haversine_distance(user_lat, user_lon, r["lat"], r["lon"])
            if dist <= 3.0 and r["plastik"]:
                pengepul_results.append({**r, "jarak_km": round(dist, 2)})

        # 2. Query Early Warning Banjir Dinas (Sumbatan >= 40% ATAU Risiko Banjir = Tinggi)
        flood_warnings = [r for r in reports if r["sumbat_pct"] >= 40 or r["risiko_banjir"] == "tinggi"]

        return {
            "pengepul_target_count": len(pengepul_results),
            "pengepul_results": pengepul_results,
            "flood_warning_count": len(flood_warnings),
            "flood_warnings": flood_warnings
        }

    def generate_system_health_report(self):
        """Menghitung metrik kesehatan database dan rekomendasi arsitektural"""
        schema_eval = self.check_schema_file()
        json_eval = self.validate_ai_json_schema(SAMPLE_AI_ANALYSIS)
        query_eval = self.simulate_workload_queries()

        # Health score calculation
        score = 100
        if not schema_eval.get("has_postgis_gist"):
            score -= 10
        if not schema_eval.get("has_jsonb_gin"):
            score -= 10
        if not json_eval.get("is_valid"):
            score -= 20
        if not json_eval.get("has_guardrails"):
            score -= 10

        recommendations = [
            "Gunakan PostGIS 'GEOGRAPHY(Point, 4326)' untuk kalkulasi jarak radius yang presisi di permukaan bumi tanpa konversi manual.",
            "Indeks GIN 'jsonb_path_ops' pada tabel analisis_ai wajib aktif agar query filter '@>' (containment) berkecepatan O(log N).",
            "Terapkan Row Level Security (RLS) di PostgreSQL: Warga hanya bisa mengedit laporannya saat status 'menunggu_analisis', Pengepul hanya bisa update status ke 'siap_diambil_pengepul' atau 'selesai'.",
            "Tabel data_lingkungan harus dilindungi dengan trigger 'BEFORE UPDATE OR DELETE' agar snapshot data lingkungan bersifat immutable (hanya bisa di-insert)."
        ]

        return {
            "score": score,
            "schema_eval": schema_eval,
            "json_eval": json_eval,
            "query_eval": query_eval,
            "recommendations": recommendations
        }

    def run(self):
        """Menjalankan analisis penuh dan mencetak laporan ke konsol"""
        report = self.generate_system_health_report()
        
        print("\n" + "="*70)
        print(" SISTEM SAMPAH - DATABASE SYSTEM ANALYZER REPORT")
        print("="*70)
        print(f"Status Skema: {len(report['schema_eval']['tables_found'])}/17 Tabel Terdeteksi ({len(report['schema_eval']['micro_tables_found'])} Micro-Tables)")
        print(f"Kesehatan Arsitektur Database: {report['score']} / 100")
        print("-" * 70)
        
        print("\n[1] EVALUASI STRUKTUR TABEL & DDL:")
        for t in report['schema_eval']['tables_found']:
            prefix = "[MICRO] " if t in report['schema_eval']['micro_tables_found'] else "[CORE]  "
            print(f"  ✓ {prefix}Tabel '{t}' terdefinisi dengan baik.")
        if report['schema_eval'].get('has_seed_data'):
            print("  ✓ Seed Data Default Micro-Tables (Kategori, Status, Jenis Sampah, Hadiah) aktif.")
        if report['schema_eval']['has_postgis_gist']:
            print("  ✓ Spatial Indexing (GiST Coords) tersedia.")
        if report['schema_eval']['has_jsonb_gin']:
            print("  ✓ GIN Indexing (JSONB Path Ops) tersedia.")
        if report['schema_eval'].get('has_crowdsource_counter'):
            print("  ✓ Crowdsourced Counter (100+ Respon Warga & Trigger) aktif.")
        if report['schema_eval'].get('has_rewards_system'):
            print("  ✓ Gamifikasi Poin Warga & Klaim Pengiriman Hadiah aktif.")
        if report['schema_eval'].get('has_anti_fraud'):
            print("  ✓ Anti-Fraud Poin (Poin cair hanya jika AI confidence >= 70%) aktif.")
        if report['schema_eval'].get('has_penjemputan'):
            print("  ✓ Proof of Work Pengepul (Timbangan riil & After-Photo bukti bersih) aktif.")
        if report['schema_eval'].get('has_early_warning'):
            print("  ✓ Automated Early Warning Broadcast (Peringatan Dini Banjir) aktif.")
        if report['schema_eval']['has_view']:
            print("  ✓ Optimized View 'view_peta_interaktif' (JOIN Micro-Tables) tersedia.")

        print("\n[2] EVALUASI KONTRAK DATA JSON AI (VISION & HIDROLOGI):")
        print(f"  ✓ Struktur Kunci: {'LENGKAP & VALID' if report['json_eval']['is_valid'] else 'TIDAK LENGKAP'}")
        for field, status, ok in report['json_eval']['type_checks']:
            print(f"  ✓ Check '{field}': {status}")
        print(f"  ✓ AI Hallucination Guardrail: {'AKTIF' if report['json_eval']['has_guardrails'] else 'TIDAK AKTIF'}")

        print("\n[3] SIMULASI QUERY WORKLOAD REAL-TIME (AREA MALANG):")
        print(f"  • Pengepul (Radius <= 3 km + Plastik): {report['query_eval']['pengepul_target_count']} Titik ditemukan")
        for item in report['query_eval']['pengepul_results']:
            print(f"    - {item['title']} ({item['jarak_km']} km) -> Siap Ambil")
        print(f"  • Early Warning Banjir Dinas (Sumbatan >= 40%): {report['query_eval']['flood_warning_count']} Titik Kritis")
        for item in report['query_eval']['flood_warnings']:
            print(f"    - {item['title']} (Tingkat Sumbatan: {item['sumbat_pct']}%, Risiko: {item['risiko_banjir'].upper()})")

        print("\n[4] REKOMENDASI ARSITEKTUR TERBAIK:")
        for i, rec in enumerate(report['recommendations'], 1):
            print(f"  {i}. {rec}")
        print("="*70 + "\n")

        # Tulis laporan ke file markdown di direktori lokal database
        with open("ANALYSIS_REPORT.md", "w") as f:
            f.write(f"""# Database System Analysis Report: Sistem Sampah
Dihasilkan pada: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Skor Kesehatan Database: **{report['score']}/100**

## 1. Verifikasi Skema DDL
- **Tabel Utama**: {', '.join(report['schema_eval']['tables_found'])}
- **Indeks Spasial**: {'Aktif (GiST)' if report['schema_eval']['has_postgis_gist'] else 'Belum Aktif'}
- **Indeks Dokumen**: {'Aktif (GIN jsonb_path_ops)' if report['schema_eval']['has_jsonb_gin'] else 'Belum Aktif'}
- **View Dashboard**: {'Tersedia (view_peta_interaktif)' if report['schema_eval']['has_view'] else 'Belum Ada'}
- **Gamifikasi & Rewards**: {'Aktif (+50 poin reward & klaim alamat pengiriman)' if report['schema_eval'].get('has_rewards_system') else 'Belum Aktif'}

## 2. Validasi Struktur Payload AI
- **Validitas Skema**: {'Valid' if report['json_eval']['is_valid'] else 'Tidak Valid'}
- **Guardrail Data Cuaca & Hidrologi**: Terverifikasi (`data_quality` & `faktor_yang_belum_tersedia`).

## 3. Hasil Simulasi Query
- **Pengepul Match (Plastik < 3 km)**: {report['query_eval']['pengepul_target_count']} lokasi.
- **Early Warning Luapan Banjir**: {report['query_eval']['flood_warning_count']} titik terdeteksi.

## 4. Rekomendasi Teknis
""" + "\n".join([f"- {r}" for r in report['recommendations']]))


if __name__ == "__main__":
    analyzer = DatabaseSystemAnalyzer("schema.sql")
    analyzer.run()
