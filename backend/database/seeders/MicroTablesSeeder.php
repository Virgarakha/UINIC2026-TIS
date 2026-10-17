<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MicroTablesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Kategori Sampah
        $kategori = [
            ['nama' => 'Sungai & Saluran Air', 'slug' => 'sungai-saluran-air', 'deskripsi' => 'Sampah yang menghambat aliran sungai, selokan, dan drainase air.', 'is_daur_ulang' => false],
            ['nama' => 'TPS Liar / Lahan Kosong', 'slug' => 'tps-liar-lahan-kosong', 'deskripsi' => 'Tumpukan sampah ilegal di lahan terbuka atau pinggir jalan.', 'is_daur_ulang' => true],
            ['nama' => 'Drainase Pemukiman', 'slug' => 'drainase-pemukiman', 'deskripsi' => 'Saluran got/gorong-gorong tersumbat di area perumahan padat.', 'is_daur_ulang' => false],
            ['nama' => 'Fasilitas Publik', 'slug' => 'fasilitas-publik', 'deskripsi' => 'Sampah berserakan di taman kota, pasar, atau trotoar publik.', 'is_daur_ulang' => true],
        ];
        foreach ($kategori as $item) {
            DB::table('kategori_sampah')->updateOrInsert(['slug' => $item['slug']], array_merge($item, ['created_at' => now(), 'updated_at' => now()]));
        }

        // 2. Status Laporan
        $status = [
            ['kode' => 'menunggu_analisis', 'nama' => 'Menunggu Analisis AI', 'badge_color' => 'secondary', 'urutan' => 1],
            ['kode' => 'terverifikasi_ai', 'nama' => 'Terverifikasi AI', 'badge_color' => 'primary', 'urutan' => 2],
            ['kode' => 'menunggu_armada_dinas', 'nama' => 'Menunggu Armada Dinas', 'badge_color' => 'warning', 'urutan' => 3],
            ['kode' => 'siap_diambil_pengepul', 'nama' => 'Siap Diambil Pengepul', 'badge_color' => 'info', 'urutan' => 4],
            ['kode' => 'sedang_ditangani', 'nama' => 'Sedang Ditangani', 'badge_color' => 'dark', 'urutan' => 5],
            ['kode' => 'selesai', 'nama' => 'Selesai Bersih', 'badge_color' => 'success', 'urutan' => 6],
            ['kode' => 'ditolak', 'nama' => 'Ditolak / Spam', 'badge_color' => 'danger', 'urutan' => 7],
        ];
        foreach ($status as $item) {
            DB::table('status_laporan')->updateOrInsert(['kode' => $item['kode']], array_merge($item, ['created_at' => now(), 'updated_at' => now()]));
        }

        // 3. Kategori Hadiah
        $kategoriHadiah = [
            ['nama' => 'Saldo E-Wallet', 'slug' => 'saldo-e-wallet', 'icon' => 'bi-wallet2'],
            ['nama' => 'Voucher Listrik & Pulsa', 'slug' => 'voucher-listrik-pulsa', 'icon' => 'bi-lightning-charge'],
            ['nama' => 'Sembako & Kebutuhan Pokok', 'slug' => 'sembako-kebutuhan-pokok', 'icon' => 'bi-bag-check'],
            ['nama' => 'Merchandise Peduli Lingkungan', 'slug' => 'merchandise-lingkungan', 'icon' => 'bi-recycle'],
        ];
        foreach ($kategoriHadiah as $item) {
            DB::table('kategori_hadiah')->updateOrInsert(['slug' => $item['slug']], array_merge($item, ['created_at' => now(), 'updated_at' => now()]));
        }

        // 4. Master Jenis Sampah
        $jenisSampah = [
            ['nama' => 'Sampah Organik & Kayu', 'nilai_ekonomi_per_kg' => 0.00, 'dapat_didaur_ulang' => false],
            ['nama' => 'Plastik Botol & Wadah (PET/HDPE)', 'nilai_ekonomi_per_kg' => 3500.00, 'dapat_didaur_ulang' => true],
            ['nama' => 'Kertas & Kardus Bekas', 'nilai_ekonomi_per_kg' => 1800.00, 'dapat_didaur_ulang' => true],
            ['nama' => 'Logam & Besi Kaleng', 'nilai_ekonomi_per_kg' => 4500.00, 'dapat_didaur_ulang' => true],
            ['nama' => 'Sampah Medis / Bahan Berbahaya (B3)', 'nilai_ekonomi_per_kg' => 0.00, 'dapat_didaur_ulang' => false],
        ];
        foreach ($jenisSampah as $item) {
            DB::table('master_jenis_sampah')->updateOrInsert(['nama' => $item['nama']], array_merge($item, ['created_at' => now(), 'updated_at' => now()]));
        }

        // 5. Master Tipe Tanggapan
        $tipeTanggapan = [
            ['kode' => 'konfirmasi_ada', 'nama' => 'Konfirmasi Masih Ada', 'icon' => 'bi-check-circle', 'deskripsi' => 'Warga mengonfirmasi tumpukan sampah masih belum dibersihkan.'],
            ['kode' => 'foto_tambahan', 'nama' => 'Update Foto Perkembangan', 'icon' => 'bi-camera', 'deskripsi' => 'Warga mengunggah foto sudut pandang lain atau perkembangan sumbatan air.'],
            ['kode' => 'tanggapan_bersih', 'nama' => 'Konfirmasi Sudah Bersih', 'icon' => 'bi-shield-check', 'deskripsi' => 'Warga mengonfirmasi lokasi telah dibersihkan oleh petugas atau warga.'],
        ];
        foreach ($tipeTanggapan as $item) {
            DB::table('master_tipe_tanggapan')->updateOrInsert(['kode' => $item['kode']], array_merge($item, ['created_at' => now(), 'updated_at' => now()]));
        }

        // 6. Katalog Hadiah Awal
        $katEwallet = DB::table('kategori_hadiah')->where('slug', 'saldo-e-wallet')->first();
        $katListrik = DB::table('kategori_hadiah')->where('slug', 'voucher-listrik-pulsa')->first();
        $katMerch = DB::table('kategori_hadiah')->where('slug', 'merchandise-lingkungan')->first();

        if ($katEwallet && DB::table('katalog_hadiah')->count() === 0) {
            DB::table('katalog_hadiah')->insert([
                [
                    'kategori_id' => $katEwallet->id,
                    'nama_hadiah' => 'Saldo E-Wallet (GoPay/OVO) Rp 25.000',
                    'deskripsi' => 'Klaim saldo e-wallet instan ditransfer ke nomor ponsel akun terdaftar.',
                    'poin_dibutuhkan' => 250,
                    'stok' => 50,
                    'foto_hadiah_url' => 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=400',
                    'is_aktif' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'kategori_id' => $katEwallet->id,
                    'nama_hadiah' => 'Saldo E-Wallet (GoPay/OVO) Rp 50.000',
                    'deskripsi' => 'Klaim saldo e-wallet Rp 50.000 untuk kontribusi aktif pemantauan sampah.',
                    'poin_dibutuhkan' => 500,
                    'stok' => 30,
                    'foto_hadiah_url' => 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=400',
                    'is_aktif' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'kategori_id' => $katListrik?->id,
                    'nama_hadiah' => 'Token Listrik PLN Rp 50.000',
                    'deskripsi' => 'Kode token listrik 20 digit dikirim melalui SMS/WhatsApp akun Anda.',
                    'poin_dibutuhkan' => 500,
                    'stok' => 25,
                    'foto_hadiah_url' => 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400',
                    'is_aktif' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'kategori_id' => $katMerch?->id,
                    'nama_hadiah' => 'Totebag Daur Ulang Ramah Lingkungan',
                    'deskripsi' => 'Tas belanja kanvas daur ulang berkualitas tinggi dikirim ke alamat rumah Anda.',
                    'poin_dibutuhkan' => 150,
                    'stok' => 100,
                    'foto_hadiah_url' => 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400',
                    'is_aktif' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }
    }
}
