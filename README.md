# TRINFO - Trash Information System (v2.0) 🌿🛡️
> **Platform Cerdas Pemantauan Sampah Liar, Deteksi Multi-Bahaya Lingkungan Berbasis Multimodal AI Vision, dan Ekosistem Daur Ulang Sirkular Berinsentif.**

---

## 📌 Ringkasan Aplikasi (Executive Summary)

**TRINFO (Trash Information System)** adalah platform pemantauan lingkungan berbasis partisipasi warga (*civic crowdsourcing*) dan kecerdasan buatan (*multimodal AI vision*). Aplikasi ini dirancang untuk mengatasi permasalahan timbunan sampah liar perkotaan, drainase tersumbat pemicu banjir luapan, ancaman kebakaran akibat akumulasi gas metana, serta risiko sanitasi pemukiman (sarang vektor penyakit seperti demam berdarah).

Dengan menggabungkan analisis visual AI (Google Gemini), integrasi data meteorologi cuaca mikro *real-time* (Open-Meteo), pemetaan spasial GIS (Leaflet), sistem gamifikasi poin reward warga, dan jejaring mitra armada pengepul daur ulang, **TRINFO** mentransformasi pelaporan sampah dari sekadar komplain pasif menjadi aksi mitigasi dan ekonomi sirkular yang terkoordinasi.

---

## 🎯 Masalah yang Diselesaikan

1. **Banjir Luapan Saluran Air**: Sampah plastik dan material padat yang menyumbat gorong-gorong dan badan sungai kerap tidak terdeteksi hingga hujan lebat turun dan memicu banjir.
2. **Akumulasi Gas Metana & Kebakaran Spontan**: Timbunan sampah organik basah yang membusuk menghasilkan gas metana ($CH_4$) yang mudah terbakar di bawah terik matahari.
3. **Krisis Sanitasi & Vektor Penyakit**: Genangan air pada wadah sampah plastik/ban bekas menjadi habitat nyamuk *Aedes aegypti* (vektor DBD) hanya dalam siklus 7 hari.
4. **Rendahnya Partisipasi Pemilahan**: Masyarakat enggan memilah sampah karena kurangnya insentif langsung dan tidak adanya integrasi dengan rantai pasok pengepul sampah daur ulang.

---

## 🚀 Fitur-Fitur Utama

### 1. Pelaporan Sampah Interaktif & Kamera Forensik 📸
- Pengambilan foto langsung melalui kamera atau galeri dengan *watermark forensik digital* (koordinat GPS, alamat presisi, elevasi dpl, timestamp, dan parameter cuaca mikro).
- Klasifikasi jenis sampah: Plastik & Saluran Air, Kardus & Logam bernilai ekonomi, Organik & Dedaunan, Limbah B3/Medis, dan TPS Liar.

### 2. Analisis Lingkungan AI Multimodal (Google Gemini Vision) 🧠
- **Estimasi Volume & Berat**: Perhitungan massa jenis ruah (*bulk density*) secara saintifik tanpa halusinasi angka.
- **Deteksi Tingkat Sumbatan**: Perhitungan persentase sumbatan penampang saluran air (%).
- **Identifikasi Multi-Bahaya**: Mengklasifikasikan risiko banjir, kebakaran metana, atau bahaya sanitasi.
- **Valuasi Ekonomi Sirkular**: Menaksir nilai rupiah dari material yang dapat didaur ulang (PET, kardus, kaleng).
- **Rekomendasi Tindakan Cepat**: Panduan mitigasi langsung bagi warga dan dinas kebersihan.

### 3. Peta Radar Spasial & Pelacakan Armada Real-Time 🗺️
- Tampilan peta Leaflet responsif dengan marker interaktif berdasarkan tingkat bahaya (Aman, Sedang, Kritis).
- Visualisasi Heatmap kepadatan timbunan sampah kota.
- Navigasi rute terpadu dan estimasi waktu tempuh menuju titik timbunan sampah.
- Pelacakan langsung posisi armada mobil mitra pengepul aktif di peta.

### 4. Ekosistem Mitra Pengepul & Ekonomi Sirkular 🚛
- Profil mitra pengepul resmi terverifikasi.
- Alur penjemputan terstruktur: Terima Order $\rightarrow$ OTW ke Lokasi $\rightarrow$ Verifikasi Bersih $\rightarrow$ Upload Bukti Pembersihan.
- Penimbangan sampah dan pemberian insentif poin langsung ke warga pelapor.

### 5. Gamifikasi & Penukaran Hadiah (EcoPoints) 🎁
- Warga mendapatkan poin reward setiap kali laporan diverifikasi dan sampah dibersihkan.
- Katalog penukaran hadiah: Saldo e-wallet, pulsa, sembako, bibit pohon penghijauan, perlengkapan kebersihan, dan tong sampah pilah.

### 6. Early Warning System (Pusat Siaga Bencana) 🚨
- Ticker peringatan dini *real-time* di seluruh halaman aplikasi.
- Halaman siaga darurat yang mengorelasikan data curah hujan ekstrem Open-Meteo dengan titik-titik sumbatan sampah untuk memperingatkan warga di kawasan hilir sebelum genangan terjadi.
- Kontak darurat terintegrasi (BPBD 112, Dinas Lingkungan Hidup, Posko Siaga Banjir).

### 7. Dashboard Portal Warga & Analitik 📊
- Statistik kontribusi warga: total kilogram sampah tertangani, titik rawan termitigasi, dan akumulasi poin.
- Manajemen riwayat laporan dan status penjemputan sampah.

---

## 🏗️ Arsitektur Teknologi (Tech Stack)

```
┌─────────────────────────────────────────────────────────────┐
│                        TRINFO CLIENT                        │
│ Next.js 16 (App Router) + React 19 + Tailwind CSS v4        │
│ Leaflet.js GIS + HTML5 Geolocation & Camera API             │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
     Direct Multimodal AI             REST API Requests
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│      Google Gemini API       ││    Laravel 11/12 Backend    │
│  Gemini Vision Multimodal    ││  RESTful API v1 + Sanctum   │
│  Fisika Hidrologi & Densitas ││  Pickup Dispatcher Engine   │
└──────────────────────────────┘└─────────────┬───────────────┘
                                              │
                                       PostGIS Queries
                                              │
                                              ▼
                                ┌─────────────────────────────┐
                                │    PostgreSQL + PostGIS     │
                                │ Spatial Indices (GiST)      │
                                │ GIN JSONB AI Analysis Index │
                                └─────────────────────────────┘
```

| Layer | Teknologi / Library | Fungsi Utama |
|---|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript | Server & Client Components, PWA layout responsif |
| **Styling** | Tailwind CSS v4, Lucide React | Desain antarmuka modern, bersih, dan aksesibel |
| **GIS & Peta** | Leaflet.js, OpenStreetMap | Visualisasi titik sebaran sampah, rute, dan tracking armada |
| **AI Vision** | Google Gemini (Gemini 3.1 Flash Lite) | Analisis foto sampah, volume, potensi bahaya & valuasi |
| **Cuaca Mikro** | Open-Meteo API | Data curah hujan, elevasi dpl, kelembaban, dan suhu realtime |
| **Backend** | Laravel 11/12 (PHP 8.2+) | Logika bisnis, API authentication (Sanctum), manajemen laporan |
| **Database** | PostgreSQL + PostGIS extension | Penyimpanan relasional, query radius spasial, dan JSONB AI |

---

## 📂 Struktur Repositori

```
UINIC2026-TIS/
├── backend/                   # Sumber kode backend Laravel
│   ├── app/
│   │   ├── Http/Controllers/  # Auth, Laporan, Pengepul, User Controller
│   │   └── Models/            # Model Eloquent (LaporanSampah, AnalisisAi, dll)
│   ├── database/migrations/   # Skema migrasi tabel database dan PostGIS
│   └── routes/api.php         # Rute REST API v1
├── database/                  # Skrip DDL, analisis skema, dan panduan SQL
│   ├── schema.sql             # Skema DDL lengkap PostgreSQL
│   └── ANALYSIS_REPORT.md     # Laporan audit integritas database
├── frontend/                  # Sumber kode frontend Next.js
│   ├── app/                   # App Router pages (/peta, /lapor, /rewards, dll)
│   ├── components/            # Komponen UI modular (maps, layouts, shared)
│   ├── config/                # Konfigurasi aplikasi dan navigasi
│   ├── lib/                   # API client, Gemini AI prompt, weather, routing
│   └── public/                # Aset statis & logo resmi (/images/logo.png)
└── README.md                  # Dokumentasi utama proyek
```

---

## ⚡ Panduan Menjalankan Aplikasi

### 1. Prasyarat Sistem
- Node.js $\ge$ 20.x dan npm
- PHP $\ge$ 8.2 dan Composer
- PostgreSQL $\ge$ 15 dengan ekstensi PostGIS aktif

### 2. Menjalankan Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
# Sesuaikan konfigurasi database (DB_CONNECTION=pgsql) di .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```
Backend API akan aktif di `http://localhost:8000/api/v1`.

### 3. Menjalankan Frontend (Next.js)
```bash
cd frontend
npm install
cp .env.example .env.local
# Masukkan GEMINI API KEY dan konfigurasi API URL
npm run dev
```
Frontend akan berjalan di `http://localhost:3000`.

---

## 👥 Hak Cipta & Tim Pengembang
Proyek ini dikembangkan dalam rangka inovasi teknologi untuk lingkungan berkelanjutan (**UINIC 2026**).
Identitas sistem: **TRINFO - Trash Information System**.
