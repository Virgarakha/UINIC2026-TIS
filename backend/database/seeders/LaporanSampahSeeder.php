<?php

namespace Database\Seeders;

use App\Models\AlamatPengguna;
use App\Models\AnalisisAi;
use App\Models\DataLingkungan;
use App\Models\KatalogHadiah;
use App\Models\KategoriSampah;
use App\Models\LaporanSampah;
use App\Models\MasterJenisSampah;
use App\Models\MasterTipeTanggapan;
use App\Models\PenjemputanSampah;
use App\Models\PenukaranHadiah;
use App\Models\PeringatanDini;
use App\Models\RiwayatPoin;
use App\Models\StatusLaporan;
use App\Models\TanggapanLaporan;
use App\Models\User;
use Illuminate\Database\Seeder;

class LaporanSampahSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $wargaA = User::first() ?? User::factory()->create(['name' => 'Ahmad Fauzi (Warga A)', 'role' => 'warga', 'poin_reward' => 250]);
        $wargaB = User::skip(1)->first() ?? User::factory()->create(['name' => 'Budi Santoso (Warga B)', 'role' => 'warga', 'poin_reward' => 120]);
        $pengepul = User::where('role', 'pengepul')->first() ?? User::factory()->create(['name' => 'Pak Joko (Pengepul Berkah)', 'role' => 'pengepul']);

        $katSungai = KategoriSampah::where('slug', 'sungai-saluran-air')->first();
        $katTps = KategoriSampah::where('slug', 'tps-liar-lahan-kosong')->first();
        $katDrainase = KategoriSampah::where('slug', 'drainase-pemukiman')->first();

        $stMenunggu = StatusLaporan::where('kode', 'menunggu_analisis')->first();
        $stVerif = StatusLaporan::where('kode', 'terverifikasi_ai')->first();
        $stPengepul = StatusLaporan::where('kode', 'siap_diambil_pengepul')->first();
        $stSelesai = StatusLaporan::where('kode', 'selesai')->first();

        $jenisPlastik = MasterJenisSampah::where('nama', 'like', '%Plastik%')->first();
        $jenisOrganik = MasterJenisSampah::where('nama', 'like', '%Organik%')->first();

        $tipeFoto = MasterTipeTanggapan::where('kode', 'foto_tambahan')->first();
        $tipeKonfirmasi = MasterTipeTanggapan::where('kode', 'konfirmasi_ada')->first();

        if (LaporanSampah::count() === 0) {
            // Laporan 1: Sungai Brantas Klojen (Kritis Bahaya Luapan)
            $lap1 = LaporanSampah::create([
                'user_id' => $wargaA->id,
                'kategori_id' => $katSungai?->id,
                'status_id' => $stVerif?->id ?? 1,
                'foto_url' => 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600',
                'latitude' => -7.9826000,
                'longitude' => 112.6308000,
                'alamat_lokasi' => 'Pintu Air Sungai Brantas, Klojen, Malang',
                'deskripsi' => 'Tumpukan sampah plastik tebal dan ranting pohon tersangkut di tiang jembatan, menghambat 45% debit air sungai.',
                'is_resiko_banjir' => true,
                'poin_diberikan' => 50,
                'total_tanggapan' => 12,
                'total_foto_tambahan' => 3,
            ]);

            AnalisisAi::create([
                'laporan_id' => $lap1->id,
                'estimasi_volume_m3' => 3.80,
                'estimasi_sumbatan_persen' => 45,
                'jenis_sampah_dominan_id' => $jenisPlastik?->id,
                'tingkat_resiko_banjir' => 'KRITIS',
                'ai_confidence_score' => 0.920,
                'raw_payload_json' => [
                    'detector' => 'Gemini 2.5 Flash Multimodal',
                    'objects' => ['plastic_bottles', 'styrofoam', 'wood_branches'],
                    'flood_risk' => 'KRITIS',
                    'hydrology_index' => 8.4,
                ],
                'model_version' => 'gemini-2.5-vision-flood-v1',
            ]);

            DataLingkungan::create([
                'laporan_id' => $lap1->id,
                'intensitas_hujan_mm' => 65.50,
                'ketinggian_air_cm' => 180.00,
                'kecepatan_arus_m_s' => 2.40,
                'prakiraan_cuaca' => 'Hujan Deras Disertai Petir',
                'sumber_data' => 'BMKG_TELEMETRY',
            ]);

            PeringatanDini::create([
                'laporan_id' => $lap1->id,
                'level_peringatan' => 'AWAS',
                'radius_terdampak_meter' => 800,
                'pesan_broadcast' => 'Waspada luapan Sungai Brantas! Sumbatan sampah 45% terdeteksi di Klojen bersama curah hujan tinggi.',
                'status_aktif' => true,
                'waktu_broadcast' => now(),
                'waktu_kedaluwarsa' => now()->addHours(6),
            ]);

            TanggapanLaporan::create([
                'laporan_id' => $lap1->id,
                'user_id' => $wargaB->id,
                'tipe_tanggapan_id' => $tipeFoto?->id,
                'komentar' => 'Air sungai mulai naik 15cm dari tanggul samping jembatan.',
                'foto_bukti_tambahan_url' => 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600',
            ]);

            // Laporan 2: TPS Liar Dinoyo (Siap Diambil Pengepul Daur Ulang)
            $lap2 = LaporanSampah::create([
                'user_id' => $wargaB->id,
                'kategori_id' => $katTps?->id,
                'status_id' => $stPengepul?->id ?? 1,
                'foto_url' => 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600',
                'latitude' => -7.9482000,
                'longitude' => 112.6075000,
                'alamat_lokasi' => 'Jl. MT Haryono Gg 4, Dinoyo, Malang',
                'deskripsi' => 'Tumpukan botol plastik mineral dan kardus bekas menumpuk di lahan kosong, siap dipilah.',
                'is_resiko_banjir' => false,
                'poin_diberikan' => 30,
                'total_tanggapan' => 5,
                'total_foto_tambahan' => 1,
            ]);

            AnalisisAi::create([
                'laporan_id' => $lap2->id,
                'estimasi_volume_m3' => 1.50,
                'estimasi_sumbatan_persen' => 10,
                'jenis_sampah_dominan_id' => $jenisPlastik?->id,
                'tingkat_resiko_banjir' => 'RENDAH',
                'ai_confidence_score' => 0.880,
                'raw_payload_json' => [
                    'recyclable_potential' => 'TINGGI',
                    'estimated_weight_kg' => 45.0,
                ],
                'model_version' => 'gemini-2.5-vision-flood-v1',
            ]);

            PenjemputanSampah::create([
                'laporan_id' => $lap2->id,
                'pengepul_id' => $pengepul->id,
                'status_jemput' => 'klaim',
                'timbangan_riil_kg' => null,
                'catatan' => 'Mitra Pengepul Berkah sedang menuju lokasi untuk timbang sampah plastik.',
            ]);

            // Laporan 3: Drainase Pemukiman Blimbing (Selesai Dibersihkan)
            $lap3 = LaporanSampah::create([
                'user_id' => $wargaA->id,
                'kategori_id' => $katDrainase?->id,
                'status_id' => $stSelesai?->id ?? 1,
                'foto_url' => 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600',
                'latitude' => -7.9392000,
                'longitude' => 112.6450000,
                'alamat_lokasi' => 'Jl. Borobudur No 24, Blimbing, Malang',
                'deskripsi' => 'Saluran drainase got tersumbat daun dan lumpur, telah diangkut oleh warga kerja bakti.',
                'is_resiko_banjir' => false,
                'poin_diberikan' => 25,
                'total_tanggapan' => 8,
                'total_foto_tambahan' => 2,
            ]);

            PenjemputanSampah::create([
                'laporan_id' => $lap3->id,
                'pengepul_id' => $pengepul->id,
                'status_jemput' => 'selesai',
                'timbangan_riil_kg' => 32.50,
                'foto_bukti_bersih_url' => 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600',
                'waktu_selesai' => now()->subHours(2),
                'catatan' => 'Sampah telah diangkut tuntas. Selokan bersih dan air mengalir normal.',
            ]);

            // Riwayat Poin & Penukaran Hadiah
            RiwayatPoin::create([
                'user_id' => $wargaA->id,
                'jumlah_poin' => 50,
                'jenis_transaksi' => 'masuk',
                'referensi_tipe' => 'laporan_sampah',
                'referensi_id' => $lap1->id,
                'keterangan' => 'Reward laporan sampah terverifikasi AI (Sungai Brantas)',
            ]);

            $alamatA = AlamatPengguna::firstOrCreate([
                'user_id' => $wargaA->id,
            ], [
                'label_alamat' => 'Rumah Utama',
                'nama_penerima' => 'Ahmad Fauzi',
                'no_telepon' => '081234567890',
                'alamat_lengkap' => 'Jl. Semeru No. 45, Klojen',
                'kota' => 'Malang',
                'kode_pos' => '65112',
                'is_utama' => true,
            ]);

            $hadiahTotebag = KatalogHadiah::first();
            if ($hadiahTotebag) {
                PenukaranHadiah::create([
                    'user_id' => $wargaA->id,
                    'hadiah_id' => $hadiahTotebag->id,
                    'alamat_id' => $alamatA->id,
                    'poin_digunakan' => $hadiahTotebag->poin_dibutuhkan,
                    'status_pengiriman' => 'dikirim',
                    'no_resi' => 'JNE-MLG-88291039',
                    'alamat_pengiriman_snapshot' => [
                        'penerima' => $alamatA->nama_penerima,
                        'telepon' => $alamatA->no_telepon,
                        'alamat' => $alamatA->alamat_lengkap,
                        'kota' => $alamatA->kota,
                    ],
                ]);

                RiwayatPoin::create([
                    'user_id' => $wargaA->id,
                    'jumlah_poin' => $hadiahTotebag->poin_dibutuhkan,
                    'jenis_transaksi' => 'keluar',
                    'referensi_tipe' => 'penukaran_hadiah',
                    'referensi_id' => 1,
                    'keterangan' => 'Penukaran reward: '.$hadiahTotebag->nama_hadiah,
                ]);
            }
        }
    }
}
