# TRINFO: Panduan Desain

Dokumen ini adalah acuan tampilan TRINFO (Trash Information System). Developer dan AI coding assistant wajib membacanya sebelum membuat atau mengubah UI. Kalau isinya bertentangan dengan kebiasaan bawaan (default Tailwind, default shadcn, gaya "modern SaaS"), isi dokumen ini yang dipakai.

## 1. Prinsip


1. **Alat kerja, bukan brosur.** Warga memakai TRINFO di jalan, di bawah matahari, dengan satu tangan. Setiap elemen harus membantu melapor, membaca peta, atau memahami peringatan. Yang tidak membantu dibuang.
2. **Empat warna, dipakai dengan disiplin.** Putih, navy, hijau tua, teal. Satu-satunya warna lain adalah warna status bahaya.
3. **Struktur membawa informasi.** Garis pemisah, border, dan label hanya ada kalau memisahkan hal yang memang berbeda.
4. **Satu hal menonjol per layar.** Di beranda itu tombol Lapor, di peta itu marker, di peringatan dini itu pesan peringatannya.
5. **Jujur soal ketidakpastian.** Hasil AI adalah estimasi dan ditampilkan sebagai estimasi.

## 2. Warna

Semua warna solid. Tidak ada gradien, glow, atau blur di komponen UI.

| Token | Hex | Peran | Kontras pada putih |
|---|---|---|---|
| `white` | `#FFFFFF` | Latar halaman dan permukaan. Teks di atas pine dan navy | n/a |
| `navy` | `#2B3752` | Teks utama, ikon, border tombol sekunder | 11,9 : 1 |
| `pine` | `#2E6E65` | Aksi utama (tombol, tautan), status aktif | 5,9 : 1 |
| `teal` | `#0EB29A` | Penanda saja: indikator, progress, marker Aman, grafik | 2,7 : 1 (gagal untuk teks) |

Turunan netral, semuanya campuran navy dengan putih supaya tetap satu keluarga:

| Token | Hex | Peran | Kontras pada putih |
|---|---|---|---|
| `navy-75` | `#60697D` | Teks sekunder, tab nonaktif | 5,5 : 1 |
| `navy-60` | `#808797` | Border input, ikon nonaktif | 3,6 : 1 |
| `navy-15` | `#DFE1E5` | Garis pemisah, border kartu | dekoratif |
| `navy-8` | `#EEEFF1` | Latar sekunder, skeleton, tombol disabled | dekoratif |
| `pine-10` | `#EAF0F0` | Latar baris terpilih atau sedang ditekan | dekoratif |

Warna status, hanya untuk status bahaya:

| Status | Hex |
|---|---|
| Aman | `#0EB29A` (teal) |
| Sedang | `#D9921A` |
| Kritis | `#C0392B` |

### Aturan pakai

- Teal tidak pernah menjadi warna teks, dan tidak pernah menjadi latar teks kecil. Tombol dengan isi teal dan teks putih gagal kontras (2,7 : 1). Tombol utama memakai pine.
- Warna status hanya muncul di marker peta, swatch tag status, heatmap, dan seri grafik yang memang menyandikan status. Tidak boleh dipakai untuk ikon menu, tombol, atau hiasan.
- Setiap ikon menu satu warna yang sama. Tidak ada ikon merah, kuning, biru, dan ungu hanya supaya "berwarna".
- Tidak ada hitam murni (`#000`). Teks memakai navy.
- Tidak ada warna dari palet bawaan Tailwind. Palet bawaan direset di token (lihat bagian 11).
- Status tidak boleh disampaikan lewat warna saja. Selalu sertakan label teks atau bentuk berbeda.

## 3. Tipografi

Satu keluarga: **Atkinson Hyperlegible Next**, dimuat lewat `next/font`. Alasannya fungsional: huruf dan angka dirancang agar mudah dibedakan (I/l/1, O/0), cocok untuk layar yang dibaca di bawah matahari oleh warga dari berbagai usia. Cadangan: Atkinson Hyperlegible, lalu Public Sans, lalu `system-ui`.

| Peran | Ukuran / tinggi baris | Bobot |
|---|---|---|
| Metadata, label tag | 12 / 16 | 500 |
| Teks sekunder | 14 / 20 | 400 |
| Isi, item menu | 16 / 24 | 400 atau 500 |
| Judul bagian | 20 / 28 | 700 |
| Judul layar | 24 / 32 | 700 |
| Angka besar (kg, poin) | 32 / 36 | 700 |

- Sentence case di semua tempat. Tidak ada HURUF KAPITAL untuk label atau pemisah bagian, tidak ada letter-spacing lebar.
- Tidak ada label kecil di atas judul (eyebrow).
- Jangan menonjolkan satu kata dalam judul dengan warna atau miring.
- Angka memakai `tabular-nums` bila font mendukung, supaya kolom angka rata.
- Panjang baris teks bacaan maksimal sekitar 65 karakter.

## 4. Bentuk dan ruang

- Grid 4 px. Padding layar 16 px. Jarak antarbagian 24 px.
- Target sentuh minimal 48 x 48 px (batas absolut 44).
- **Radius bertingkat, bukan satu angka untuk semuanya:**
  - 4 px: tag status, foto di dalam kartu
  - 8 px: tombol, input, kartu, kontrol peta
  - 16 px: hanya sudut atas bottom sheet
  - lingkaran: hanya avatar dan marker
  - Tidak ada tombol atau item menu berbentuk pil (`rounded-full`).
- **Elevasi lewat border, bukan bayangan.** Pemisahan memakai border 1 px `navy-15`. Satu-satunya shadow: elemen yang melayang di atas peta (kontrol zoom, bottom sheet), yaitu `0 1px 3px #2B375229`.
- **Scrim** di belakang drawer atau dialog: navy solid 40% (`#2B375266`). Tidak ada `backdrop-blur`, tidak ada efek kaca.
- **Kartu hanya untuk objek yang bisa dibuka** (laporan, hadiah, mitra). Daftar biasa berupa baris dengan garis pemisah, bukan kumpulan kartu identik.
- Garis pemisah hanya antara kelompok yang artinya berbeda.

## 5. Ikon

- Lucide, 20 px, stroke 1,75, satu warna: navy (biasa), pine (aktif), navy-60 (nonaktif).
- Tidak ada kotak atau lingkaran berwarna di belakang ikon.
- Ikon menemani label, tidak menggantikannya.
- Tidak ada ikon kilau (sparkle), badge "AI", atau "AI-powered" untuk menandai fitur analisis.

## 6. Komponen

### Tombol

| Jenis | Spesifikasi |
|---|---|
| Utama | Isi `pine`, teks putih 16/500, tinggi 48, radius 8. Ditekan: isi `navy` |
| Sekunder | Isi putih, border 1 px `navy`, teks `navy` |
| Teks | Teks `pine`, bergaris bawah |
| Disabled | Isi `navy-8`, teks `navy-60` |

Satu tombol utama per layar. Tidak ada panah (`→`) di akhir label tombol.

### Input

Tinggi 48, border 1 px `navy-60`, radius 8. Label selalu terlihat di atas kolom (bukan hanya placeholder). Fokus: outline 2 px `navy` dengan offset 2 px; teal tidak dipakai karena gagal kontras 3 : 1. Error: border dan teks `#C0392B`, pesan menyebut apa yang salah dan cara memperbaikinya.

### Tag status

Swatch persegi 8 x 8 px (radius 2) berwarna status, diikuti label navy 12/500. Tanpa latar berwarna, tanpa pil, tanpa outline.

### Navigasi bawah

Lima tujuan: Beranda, Peta, Lapor, Peringatan, Poin. Tinggi 56 px ditambah safe area.

- Semua tab sama tinggi dan tetap di dalam bar. **Tidak ada tombol melayang yang menonjol keluar, tidak ada ring, glow, atau gradien.**
- Lapor ditandai sebagai blok solid `pine` (radius 8) berisi ikon kamera putih dan label "Lapor".
- Tab aktif: ikon dan label `pine`, garis 2 px `pine` di tepi atas tab. Tab nonaktif: `navy-75`.

```
| Beranda | Peta | [ Lapor ] | Peringatan | Poin |
   aktif: garis 2px pine di atas tab, ikon + label pine
```

### Menu samping (drawer)

Menu samping tidak menduplikasi tab di navigasi bawah. Isinya hanya yang tidak punya tab: Dashboard saya, Panduan memilah sampah, Panel admin.

```
 [logo] TRINFO                 X

 Anda belum masuk
 Masuk untuk menyimpan laporan
 dan poin Anda.
 [ Masuk ]                        <- tombol utama pine

 ------------------------------
|  Dashboard saya                 <- aktif: bar 3px pine di tepi kiri
   Panduan memilah sampah
 ------------------------------
   Panel admin                 ^
```

- Header: logo TIS 32 px tanpa kotak atau border, nama "TRINFO" navy 700, tombol tutup. Tagline tidak diulang di sini.
- Status masuk: tanpa kartu berbingkai, tanpa avatar inisial untuk tamu. Cukup teks dan satu tombol. Setelah masuk: nama dan jumlah poin.
- Item: tinggi 48, ikon navy 20 px, label 16/500 navy.
- Aktif: label `pine` 700 dan bar 3 px `pine` di tepi kiri. Tanpa pil atau latar berwarna.
- Satu garis pemisah sebelum "Panel admin". Tanpa label huruf kapital. Titik hijau hanya boleh ada kalau benar-benar menunjukkan status (misalnya server online atau offline).
- Tautan keluar memakai ikon external-link dan dibuka di tab baru.
- Latar saat drawer terbuka: scrim solid, tanpa blur.

### Kartu laporan

Foto di atas (radius 4), lalu tag status, jenis sampah, alamat, jarak, dan waktu. Metadata dipisah baris atau jarak, bukan titik tengah. Tidak ada ikon di setiap baris metadata.

### Statistik di dashboard

Bukan deretan kartu identik berikon warna-warni. Tampilkan dua sampai tiga angka yang paling berarti (kg tertangani, laporan selesai, poin) sebagai baris: angka 32/36 bold dengan satuan 14 px di sampingnya, label 14 px `navy-75` di bawahnya, dipisah garis `navy-15`.

### Hasil analisis AI

- Tampilkan sebagai data berlabel dalam daftar. Contoh: "Estimasi berat 12-18 kg", "Sumbatan saluran sekitar 40%", "Perkiraan nilai material Rp 15.000-25.000". Pakai rentang bila model memberi rentang, dan tulis kata "estimasi".
- Tingkat bahaya memakai tag status. Rekomendasi tindakan berupa daftar bernomor hanya bila urutannya penting.
- Tidak ada kartu "AI Insight", ikon kilau, atau animasi berkilau.
- Saat memproses: teks "Menganalisis foto" dan bar progress indeterminate solid `teal`. Saat gagal: sebut penyebabnya dan sediakan tombol "Coba lagi".

### Peta

- Basemap netral atau terang supaya marker terbaca. Atribusi OpenStreetMap tetap tampil; cek juga ketentuan lisensi penyedia tile.
- Marker: ring putih 2 px, dan **bentuk berbeda per status**: Aman lingkaran, Sedang persegi radius 4, Kritis belah ketupat.
- Heatmap adalah data, bukan hiasan. Skala boleh dipakai, satu arah saja (amber ke merah tua), bukan pelangi.
- Marker armada: navy solid, berbeda bentuk dari marker laporan.
- Kontrol peta (zoom, lokasi saya): kotak putih radius 8, border `navy-15`, shadow melayang.

## 7. Bahasa dan teks

Bahasa Indonesia, sentence case, kata kerja aktif, kalimat biasa. Satu konsep, satu nama, di seluruh aplikasi.

| Konsep | Nama di UI | Hindari |
|---|---|---|
| Peta sebaran | Peta | Peta Radar Utama, Radar |
| Early warning | Peringatan dini (tab: Peringatan) | Pusat Peringatan Dini, Siaga |
| Poin dan hadiah | Poin, Tukar hadiah | Rewards, Katalog Rewards Poin |
| Dashboard warga | Dashboard saya | Portal Dashboard |
| Panduan | Panduan memilah sampah | Panduan Pilah Sampah |
| Admin | Panel admin | Admin Command Center, Integrasi Admin |

- Tombol menyebut hasilnya: "Kirim laporan", "Tukar poin", bukan "Submit" atau "Lanjut". Nama aksi sama dari tombol sampai notifikasi ("Kirim laporan" menghasilkan "Laporan terkirim").
- Pesan error tidak minta maaf dan tidak samar. Sebut apa yang terjadi dan apa yang harus dilakukan.
- Layar kosong mengajak bertindak. Contoh: "Belum ada laporan. Foto tumpukan sampah di dekat Anda untuk mulai."
- Tidak ada emoji di UI. Gaya README (emoji di judul, kata seperti "cerdas" dan "ekosistem") tidak dibawa ke aplikasi.
- Tidak ada tanda pisah gaya template: titik tengah antarmetadata, label berpola "KATA — fragmen", dan "→" di tombol.

## 8. Gerak

- Gerak hanya sebagai respons terhadap aksi pengguna: drawer dan bottom sheet 200 ms ease-out, tombol saat ditekan.
- Tidak ada animasi masuk per bagian saat scroll (fade-slide-up), tidak ada kartu yang terangkat saat hover, tidak ada denyut atau glow untuk menarik perhatian.
- Ticker peringatan dini berhenti saat disentuh atau di-hover.
- `prefers-reduced-motion` dihormati: semua gerak diganti tampilan statis.

## 9. Logo

Monogram TIS flat vektor, solid, tanpa gradien, bayangan, atau 3D. Ditampilkan polos tanpa kotak, border, atau bayangan di belakangnya. Ukuran minimal 24 px, ruang kosong di sekelilingnya setinggi huruf. Warna logo mengikuti palet aplikasi.

## 10. Aksesibilitas (batas bawah)

- Kontras teks minimal 4,5 : 1, komponen non-teks minimal 3 : 1.
- Target sentuh 48 px, fokus keyboard selalu terlihat.
- Tampilan nyaman di lebar 360 px dan tetap terbaca saat teks diperbesar 200%.

## 11. Token Tailwind v4

Taruh di `globals.css`. Baris `initial` menghapus palet, radius, dan shadow bawaan supaya kelas seperti `bg-blue-500` atau `shadow-lg` tidak bisa terpakai tanpa sengaja.

```css
@import "tailwindcss";

@theme {
  --color-*: initial;
  --color-white: #FFFFFF;
  --color-navy: #2B3752;
  --color-pine: #2E6E65;
  --color-teal: #0EB29A;
  --color-navy-75: #60697D;
  --color-navy-60: #808797;
  --color-navy-15: #DFE1E5;
  --color-navy-8: #EEEFF1;
  --color-pine-10: #EAF0F0;
  --color-status-aman: #0EB29A;
  --color-status-sedang: #D9921A;
  --color-status-kritis: #C0392B;

  --radius-*: initial;
  --radius-tag: 4px;
  --radius-control: 8px;
  --radius-sheet: 16px;

  --shadow-*: initial;
  --shadow-float: 0 1px 3px #2B375229;

  --font-sans: var(--font-atkinson), "Public Sans", system-ui, sans-serif;
}
```

Pemeriksaan cepat di CI atau sebelum commit:

```bash
grep -rnE "bg-gradient|from-|to-|backdrop-blur|animate-pulse|rounded-full|shadow-(sm|md|lg|xl)" frontend/app frontend/components
```

`rounded-full` hanya boleh muncul pada avatar dan marker.

## 12. Daftar periksa sebelum merge

- [ ] Hanya warna dari token di bagian 2. Tidak ada warna ikon yang berbeda-beda.
- [ ] Tidak ada gradien, glow, blur, atau efek kaca.
- [ ] Tidak ada huruf kapital untuk label, tidak ada eyebrow di atas judul.
- [ ] Tidak ada tombol melayang yang menonjol keluar dari bar.
- [ ] Tidak ada kartu berbingkai untuk hal yang bukan objek (status masuk, statistik, menu).
- [ ] Radius bertingkat sesuai bagian 4, bukan satu angka untuk semua.
- [ ] Menu tidak menduplikasi navigasi bawah.
- [ ] Teks UI memakai nama baku dari glosarium, tanpa emoji.
- [ ] Teks lolos kontras 4,5 : 1. Tidak ada teks putih di atas teal.
- [ ] Status terbaca tanpa warna (bentuk atau label).
- [ ] Hasil AI ditulis sebagai estimasi, tanpa ikon kilau.
- [ ] Semua gerak berasal dari aksi pengguna dan menghormati `prefers-reduced-motion`.
