<?php

namespace Database\Seeders;

use App\Models\AnalisisAi;
use App\Models\DataLingkungan;
use App\Models\KategoriSampah;
use App\Models\LaporanSampah;
use App\Models\MasterJenisSampah;
use App\Models\MasterTipeTanggapan;
use App\Models\PenjemputanSampah;
use App\Models\PeringatanDini;
use App\Models\StatusLaporan;
use App\Models\TanggapanLaporan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class Laporan100JawaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Memulai seeding 100 lokasi laporan sampah (Jatim, Jateng, Jabar)...');

        // 1. Siapkan User Warga dan Pengepul
        $pengepul = User::where('role', 'pengepul')->first();
        if (!$pengepul) {
            $pengepul = User::create([
                'name' => 'Pak Joko (Mitra Pengepul Berkah)',
                'email' => 'pengepul.berkah@ecocitizen.id',
                'password' => Hash::make('password'),
                'role' => 'pengepul',
                'poin_reward' => 450,
                'no_telepon' => '0813-8899-7766',
                'email_verified_at' => now(),
            ]);
        }

        $wargaUsers = User::where('role', 'warga')->get();
        if ($wargaUsers->count() < 5) {
            $personas = [
                ['name' => 'Ahmad Fauzi', 'email' => 'ahmad.fauzi@ecocitizen.id'],
                ['name' => 'Siti Nurhaliza', 'email' => 'siti.nurhaliza@ecocitizen.id'],
                ['name' => 'Budi Santoso', 'email' => 'budi.santoso@ecocitizen.id'],
                ['name' => 'Dewi Lestari', 'email' => 'dewi.lestari@ecocitizen.id'],
                ['name' => 'Rian Hidayat', 'email' => 'rian.hidayat@ecocitizen.id'],
                ['name' => 'Maya Anggraini', 'email' => 'maya.anggraini@ecocitizen.id'],
                ['name' => 'Hendra Setiawan', 'email' => 'hendra.setiawan@ecocitizen.id'],
            ];
            foreach ($personas as $p) {
                User::firstOrCreate(
                    ['email' => $p['email']],
                    [
                        'name' => $p['name'],
                        'password' => Hash::make('password'),
                        'role' => 'warga',
                        'poin_reward' => rand(50, 300),
                        'email_verified_at' => now(),
                    ]
                );
            }
            $wargaUsers = User::where('role', 'warga')->get();
        }

        // 2. Siapkan Master Data Mapping
        $katMap = KategoriSampah::pluck('id', 'slug')->toArray();
        $statusMap = StatusLaporan::pluck('id', 'kode')->toArray();

        $katDefault = KategoriSampah::first();
        $statusDefault = StatusLaporan::first();

        $jenisPlastik = MasterJenisSampah::where('nama', 'like', '%Plastik%')->first();
        $jenisOrganik = MasterJenisSampah::where('nama', 'like', '%Organik%')->first();
        $jenisKardus = MasterJenisSampah::where('nama', 'like', '%Kertas%')->orWhere('nama', 'like', '%Kardus%')->first();
        $jenisLogam = MasterJenisSampah::where('nama', 'like', '%Logam%')->first();
        $jenisMedis = MasterJenisSampah::where('nama', 'like', '%Medis%')->orWhere('nama', 'like', '%B3%')->first();
        $jenisDefault = MasterJenisSampah::first();

        $tipeTanggapanAda = MasterTipeTanggapan::where('kode', 'konfirmasi_ada')->first();
        $tipeTanggapanFoto = MasterTipeTanggapan::where('kode', 'foto_tambahan')->first();
        $tipeTanggapanBersih = MasterTipeTanggapan::where('kode', 'tanggapan_bersih')->first();

        // 3. Kumpulan Foto Unsplash Terverifikasi (Status HTTP 200)
        $photoPool = [
            'photo-1618477461853-cf6ed80faba5', // botol plastik sungai
            'photo-1532996122724-e3c354a0b15b', // sampah botol daur ulang
            'photo-1605600659908-0ef719419d41', // tumpukan sampah drainase
            'photo-1542601906990-b4d3fb778b09', // tumpukan limbah sungai
            'photo-1611284446314-60a58ac0deb9', // timbunan sampah TPS liar
            'photo-1528323273322-d81458248d40', // sampah plastik muara sungai
            'photo-1567095761054-7a02e69e5c43', // aliran parit tersumbat
            'photo-1595278069441-2cf29f8005a4', // pemilahan plastik daur ulang
            'photo-1530587191325-3db32d826c18', // botol di selokan air
            'photo-1503596476-1c12a8ba09a9', // kantong kresek tumpukan sampah
            'photo-1621451537084-482c73073a0f', // tumpukan sampah daratan
            'photo-1544816155-12df9643f363', // selokan bersih setelah dibersihkan
            'photo-1563245372-f21724e3856d', // kardus & daur ulang
            'photo-1582408921715-18e7806365c1', // kaleng logam & besi rongsok
            'photo-1526951521990-620dc14c214b', // plastik berserakan jalan raya
            'photo-1584467735871-8e85353a8413', // limbah medis botol kimia
            'photo-1588681664899-f142ff2dc9b1', // timbunan sampah pasar basah
            'photo-1523293182086-7651a899d37f', // tumpukan plastik di drainase got
            'photo-1616401784845-180882ba9ba8', // sampah liar lahan terbuka
            'photo-1604187351574-c75ca79f5807', // tumpukan karton kardus
            'photo-1516992654410-9309d4587e94', // sampah di pintu air
            'photo-1591193686104-fddba4d0e4d8', // limbah tepi sungai
            'photo-1607619056574-7b8d3ee536b2', // tumpukan sampah plastik
            'photo-1537084642907-629340c7e59c', // tumpukan sampah got
            'photo-1569163139599-0f4517e36f51', // botol plastik tersangkut ranting
            'photo-1587293852726-70cdb56c2866', // sampah tepi kali pemukiman
            'photo-1576267423445-b2e0074d68a4', // sampah trotoar fasilitas umum
            'photo-1518709268805-4e9042af9f23', // tumpukan sampah sungai dangkal
        ];

        // 4. Data 100 Lokasi (34 Jawa Timur, 33 Jawa Tengah, 33 Jawa Barat)
        $locations = $this->get100LocationsData();

        DB::beginTransaction();
        try {
            $createdCount = 0;
            $updatedCount = 0;

            foreach ($locations as $index => $item) {
                $user = $wargaUsers->random();
                $photoId = $photoPool[$index % count($photoPool)];
                $fotoUrl = "https://images.unsplash.com/{$photoId}?auto=format&fit=crop&w=700&q=80";

                $kategoriId = $katMap[$item['kategori_slug']] ?? $katDefault?->id;
                $statusId = $statusMap[$item['status_kode']] ?? $statusDefault?->id;

                // Tentukan jenis sampah dominan ID secara dinamis
                $jenisDominanId = $jenisPlastik?->id ?? $jenisDefault?->id;
                if ($item['kategori_slug'] === 'tps-liar-lahan-kosong') {
                    $jenisDominanId = (rand(0, 1) ? $jenisPlastik?->id : $jenisKardus?->id) ?? $jenisDefault?->id;
                } elseif (str_contains(strtolower($item['deskripsi']), 'daun') || str_contains(strtolower($item['deskripsi']), 'organik')) {
                    $jenisDominanId = $jenisOrganik?->id ?? $jenisDefault?->id;
                } elseif (str_contains(strtolower($item['deskripsi']), 'logam') || str_contains(strtolower($item['deskripsi']), 'kaleng')) {
                    $jenisDominanId = $jenisLogam?->id ?? $jenisDefault?->id;
                } elseif (str_contains(strtolower($item['tipe_bahaya']), 'medis') || str_contains(strtolower($item['tipe_bahaya']), 'b3')) {
                    $jenisDominanId = $jenisMedis?->id ?? $jenisDefault?->id;
                }

                $laporan = LaporanSampah::updateOrCreate(
                    [
                        'alamat_lokasi' => $item['alamat_lokasi'],
                    ],
                    [
                        'user_id' => $user->id,
                        'kategori_id' => $kategoriId,
                        'status_id' => $statusId,
                        'foto_url' => $fotoUrl,
                        'latitude' => $item['latitude'],
                        'longitude' => $item['longitude'],
                        'deskripsi' => $item['deskripsi'],
                        'is_resiko_banjir' => $item['is_resiko_banjir'],
                        'tipe_bahaya' => $item['tipe_bahaya'],
                        'poin_diberikan' => $item['poin_diberikan'] ?? rand(25, 60),
                        'total_tanggapan' => $item['total_tanggapan'] ?? rand(3, 18),
                        'total_foto_tambahan' => $item['total_foto_tambahan'] ?? rand(0, 2),
                        'created_at' => now()->subDays(rand(0, 14))->subHours(rand(1, 23)),
                        'updated_at' => now(),
                    ]
                );

                if ($laporan->wasRecentlyCreated) {
                    $createdCount++;
                } else {
                    $updatedCount++;
                }

                // A. Analisis AI Vision Forensik
                $volumeM3 = $item['volume_m3'] ?? round(rand(4, 50) / 10, 2);
                $sumbatanPersen = $item['sumbatan_persen'] ?? ($item['is_resiko_banjir'] ? rand(40, 85) : rand(10, 35));
                $estimasiBeratKg = round($volumeM3 * rand(70, 110), 1);
                $nilaiEkonomi = round($estimasiBeratKg * rand(1200, 3200));

                AnalisisAi::updateOrCreate(
                    ['laporan_id' => $laporan->id],
                    [
                        'estimasi_volume_m3' => $volumeM3,
                        'estimasi_sumbatan_persen' => $sumbatanPersen,
                        'jenis_sampah_dominan_id' => $jenisDominanId,
                        'tingkat_resiko_banjir' => $item['is_resiko_banjir'] ? ($sumbatanPersen >= 60 ? 'KRITIS' : 'TINGGI') : 'RENDAH',
                        'potensi_bahaya' => $item['tipe_bahaya'],
                        'ai_confidence_score' => round(rand(880, 985) / 1000, 3),
                        'raw_payload_json' => [
                            'estimasi_berat_kg' => $estimasiBeratKg,
                            'nilai_ekonomi_estimasi' => $nilaiEkonomi,
                            'rekomendasi_tindakan' => $item['is_resiko_banjir']
                                ? 'Prioritas Kritis: Bersihkan pintu air dan saluran drainase sebelum puncak hujan tiba.'
                                : 'Rekomendasi Daur Ulang: Koordinasikan dengan mitra bank sampah / pengepul lokal.',
                            'jenis_sampah_dominan' => $item['kategori_slug'] === 'tps-liar-lahan-kosong' ? 'Kardus & Plastik Campuran' : 'Plastik Kemasan & Botol PET',
                            'metadata_forensik' => [
                                'is_geotag_verified' => true,
                                'camera_model' => 'Mobile Vision AI Scanner',
                                'gps_accuracy_meters' => rand(3, 8),
                                'detected_timestamp' => $laporan->created_at->toISOString(),
                            ],
                        ],
                        'model_version' => 'gemini-2.5-vision-flood-v1',
                        'analyzed_at' => $laporan->created_at,
                    ]
                );

                // B. Data Lingkungan (Sensor Hidrologi & BMKG)
                DataLingkungan::updateOrCreate(
                    ['laporan_id' => $laporan->id],
                    [
                        'intensitas_hujan_mm' => $item['is_resiko_banjir'] ? rand(45, 88) : rand(5, 30),
                        'ketinggian_air_cm' => $item['is_resiko_banjir'] ? rand(130, 240) : rand(30, 90),
                        'kecepatan_arus_m_s' => round(rand(5, 25) / 10, 2),
                        'prakiraan_cuaca' => $item['is_resiko_banjir'] ? 'Hujan Lebat Disertai Angin' : 'Berawan Sebagian',
                        'sumber_data' => 'BMKG_TELEMETRY',
                        'recorded_at' => $laporan->created_at,
                    ]
                );

                // C. Peringatan Dini (Jika berisiko banjir atau status kritis)
                if ($item['is_resiko_banjir'] && in_array($item['status_kode'], ['terverifikasi_ai', 'menunggu_armada_dinas', 'sedang_ditangani'])) {
                    PeringatanDini::updateOrCreate(
                        ['laporan_id' => $laporan->id],
                        [
                            'level_peringatan' => $sumbatanPersen >= 60 ? 'AWAS' : 'SIAGA',
                            'tipe_bahaya' => $item['tipe_bahaya'],
                            'radius_terdampak_meter' => rand(500, 1200),
                            'pesan_broadcast' => "Peringatan Waspada: Terdeteksi sumbatan sampah {$sumbatanPersen}% di {$item['alamat_lokasi']}. Berpotensi memicu luapan air ke jalan dan pemukiman warga.",
                            'status_aktif' => true,
                            'waktu_broadcast' => $laporan->created_at,
                            'waktu_kedaluwarsa' => now()->addHours(rand(6, 18)),
                        ]
                    );
                }

                // D. Penjemputan Sampah Pengepul (Untuk status sedang ditangani atau selesai)
                if (in_array($item['status_kode'], ['sedang_ditangani', 'selesai'])) {
                    $isSelesai = $item['status_kode'] === 'selesai';
                    $statusJemput = $isSelesai ? 'selesai' : 'klaim';

                    PenjemputanSampah::updateOrCreate(
                        ['laporan_id' => $laporan->id],
                        [
                            'pengepul_id' => $pengepul->id,
                            'status_jemput' => $statusJemput,
                            'current_latitude' => null,
                            'current_longitude' => null,
                            'heading' => 0,
                            'kecepatan_kmh' => 0,
                            'waktu_update_lokasi' => null,
                            'timbangan_riil_kg' => $isSelesai ? $estimasiBeratKg : null,
                            'foto_bukti_bersih_url' => $isSelesai ? 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' : null,
                            'waktu_klaim' => $laporan->created_at->addHours(1),
                            'waktu_selesai' => $isSelesai ? now()->subHours(rand(1, 12)) : null,
                            'catatan' => $isSelesai
                                ? 'Pembersihan tuntas. Seluruh material sampah daur ulang telah diangkut ke bank sampah mitra.'
                                : 'Lokasi telah diklaim oleh mitra pengepul dan masuk jadwal rute penjemputan.',
                        ]
                    );
                }

                // E. Tanggapan Warga (Komentar & Validasi Komunitas)
                if (TanggapanLaporan::where('laporan_id', $laporan->id)->count() === 0) {
                    $komentarList = [
                        'Air parit mulai melambat alirannya karena tertutup tumpukan plastik.',
                        'Mohon segera ditindaklanjuti sebelum hujan lebat nanti sore.',
                        'Tumpukan sampah plastik di sini sangat potensial untuk didaur ulang bank sampah.',
                        'Warga sekitar sudah memasang jaring sementara agar tidak hanyut lebih jauh.',
                        'Terima kasih, armada pembersih sudah mulai mendekati lokasi.',
                    ];
                    TanggapanLaporan::create([
                        'laporan_id' => $laporan->id,
                        'user_id' => $wargaUsers->random()->id,
                        'tipe_tanggapan_id' => $tipeTanggapanAda?->id ?? 1,
                        'komentar' => $komentarList[$index % count($komentarList)],
                    ]);
                }
            }

            DB::commit();
            $this->command->info("Seeding berhasil! Dibuat: {$createdCount}, Diperbarui: {$updatedCount}. Total laporan: " . LaporanSampah::count());
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->command->error("Gagal melakukan seeding: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Data 100 Lokasi Nyata (34 Jatim, 33 Jateng, 33 Jabar)
     *
     * @return array<int, array<string, mixed>>
     */
    private function get100LocationsData(): array
    {
        return [
            // ==========================================
            // PROVINSI JAWA TIMUR (34 Lokasi)
            // ==========================================
            [
                'alamat_lokasi' => 'Pintu Air Wonokromo (Kali Mas), Jagir, Wonokromo, Kota Surabaya, Jawa Timur',
                'latitude' => -7.2994000,
                'longitude' => 112.7482000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.2,
                'sumbatan_persen' => 55,
                'deskripsi' => 'Timbunan botol plastik kemasan dan ranting pohon tertahan di pintu air Jagir, menyumbat aliran Kali Mas menuju muara.',
            ],
            [
                'alamat_lokasi' => 'Saluran Kali Pegirian, Ampel, Semampir, Kota Surabaya, Jawa Timur',
                'latitude' => -7.2285000,
                'longitude' => 112.7431000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'menunggu_armada_dinas',
                'tipe_bahaya' => 'Wabah Penyakit & Sanitasi',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.5,
                'sumbatan_persen' => 60,
                'deskripsi' => 'Endapan sampah rumah tangga padat dan limbah plastik di kolong jembatan Pegirian memicu bau menyengat dan sarang nyamuk.',
            ],
            [
                'alamat_lokasi' => 'Bantaran Kali Greges, Kalianak No. 88, Asemrowo, Kota Surabaya, Jawa Timur',
                'latitude' => -7.2405000,
                'longitude' => 112.7056000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 5.1,
                'sumbatan_persen' => 70,
                'deskripsi' => 'Aliran muara Kali Greges tersumbat eceng gondok bercampur sampah styrofoam dan botol air mineral dari kawasan industri.',
            ],
            [
                'alamat_lokasi' => 'Saluran Drainase Rungkut Industri, SIER, Tenggilis Mejoyo, Kota Surabaya, Jawa Timur',
                'latitude' => -7.3271000,
                'longitude' => 112.7602000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => false,
                'volume_m3' => 2.2,
                'sumbatan_persen' => 25,
                'deskripsi' => 'Timbunan kardus karton bekas kemasan pabrik dan plastik palet menumpuk di tepi saluran drainase, siap dipilah.',
            ],
            [
                'alamat_lokasi' => 'Muara Bozem Morokrembangan, Krembangan, Kota Surabaya, Jawa Timur',
                'latitude' => -7.2341000,
                'longitude' => 112.7235000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'sedang_ditangani',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 6.5,
                'sumbatan_persen' => 65,
                'deskripsi' => 'Akumulasi sampah terapung di kolam retensi Bozem Morokrembangan sedang disedot dan diangkat oleh alat berat dinas.',
            ],
            [
                'alamat_lokasi' => 'Pesisir Pantai Kenjeran Baru, Sukolilo Baru, Bulak, Kota Surabaya, Jawa Timur',
                'latitude' => -7.2482000,
                'longitude' => 112.7955000,
                'kategori_slug' => 'fasilitas-publik',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => false,
                'volume_m3' => 1.8,
                'sumbatan_persen' => 15,
                'deskripsi' => 'Sampah botol kaca dan kaleng minuman kemasan berserakan di sempadan pantai kenjeran setelah akhir pekan.',
            ],
            [
                'alamat_lokasi' => 'Bantaran Kali Balong, Tandes Kidul, Tandes, Kota Surabaya, Jawa Timur',
                'latitude' => -7.2612000,
                'longitude' => 112.6714000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.8,
                'sumbatan_persen' => 50,
                'deskripsi' => 'Sampah kantong plastik rumah tangga menyangkut di gorong-gorong jembatan kereta api Tandes, menghambat saluran air.',
            ],
            [
                'alamat_lokasi' => 'Pintu Air Sungai Brantas Klojen, Kiduldalem, Klojen, Kota Malang, Jawa Timur',
                'latitude' => -7.9826000,
                'longitude' => 112.6308000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.8,
                'sumbatan_persen' => 45,
                'deskripsi' => 'Tumpukan sampah plastik tebal dan ranting pohon tersangkut di tiang jembatan Brantas Klojen, menghambat aliran air.',
            ],
            [
                'alamat_lokasi' => 'Saluran Irigasi Dinoyo, Jl. MT Haryono Gg 4, Lowokwaru, Kota Malang, Jawa Timur',
                'latitude' => -7.9482000,
                'longitude' => 112.6075000,
                'kategori_slug' => 'tps-liar-lahan-kosong',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => false,
                'volume_m3' => 1.5,
                'sumbatan_persen' => 10,
                'deskripsi' => 'Tumpukan botol plastik mineral dan kardus bekas menumpuk di lahan kosong Dinoyo, siap dipilah dan ditimbang.',
            ],
            [
                'alamat_lokasi' => 'Drainase Pemukiman Jl. Borobudur No. 24, Mojolangu, Blimbing, Kota Malang, Jawa Timur',
                'latitude' => -7.9392000,
                'longitude' => 112.6450000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'selesai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => false,
                'volume_m3' => 0.8,
                'sumbatan_persen' => 0,
                'deskripsi' => 'Saluran drainase got tersumbat daun dan lumpur, telah diangkut tuntas oleh warga kerja bakti dan mitra pembersih.',
            ],
            [
                'alamat_lokasi' => 'Lahan Terbuka Pasar Induk Gadang, Gadang, Sukun, Kota Malang, Jawa Timur',
                'latitude' => -8.0215000,
                'longitude' => 112.6288000,
                'kategori_slug' => 'tps-liar-lahan-kosong',
                'status_kode' => 'menunggu_armada_dinas',
                'tipe_bahaya' => 'Bahaya Kebakaran & Gas Metana',
                'is_resiko_banjir' => false,
                'volume_m3' => 5.8,
                'sumbatan_persen' => 30,
                'deskripsi' => 'Timbunan sisa sayuran membusuk bercampur kemasan plastik kresek pasar liar berpotensi menimbulkan gas metana.',
            ],
            [
                'alamat_lokasi' => 'Kolong Jembatan Muharto, Kotalama, Kedungkandang, Kota Malang, Jawa Timur',
                'latitude' => -7.9945000,
                'longitude' => 112.6420000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.2,
                'sumbatan_persen' => 50,
                'deskripsi' => 'Tumpukan kantong kresek dan karung limbah tersangkut di pilar beton kolong jembatan Muharto.',
            ],
            [
                'alamat_lokasi' => 'Sungai Amprong, Cemorokandang, Kedungkandang, Kota Malang, Jawa Timur',
                'latitude' => -7.9712000,
                'longitude' => 112.6782000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 2.7,
                'sumbatan_persen' => 40,
                'deskripsi' => 'Sisa potongan batang pisang dan sampah plastik kemasan menumpuk di tikungan aliran Sungai Amprong.',
            ],
            [
                'alamat_lokasi' => 'Sungai Metro Kepanjen, Ardirejo, Kepanjen, Kab. Malang, Jawa Timur',
                'latitude' => -8.1345000,
                'longitude' => 112.5712000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.0,
                'sumbatan_persen' => 55,
                'deskripsi' => 'Hambatan sampah plastik kemasan dan bambu di bendungan kecil Sungai Metro mengganggu debit irigasi sawah.',
            ],
            [
                'alamat_lokasi' => 'Drainase Pasar Singosari, Pagentan, Singosari, Kab. Malang, Jawa Timur',
                'latitude' => -7.8923000,
                'longitude' => 112.6654000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Wabah Penyakit & Sanitasi',
                'is_resiko_banjir' => false,
                'volume_m3' => 1.9,
                'sumbatan_persen' => 35,
                'deskripsi' => 'Kardus basah dan tumpukan botol plastik minuman kemasan di belakang kios pasar, siap diangkut.',
            ],
            [
                'alamat_lokasi' => 'Aliran Kali Brantas Hulu, Punten, Bumiaji, Kota Batu, Jawa Timur',
                'latitude' => -7.8540000,
                'longitude' => 112.5312000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 2.4,
                'sumbatan_persen' => 38,
                'deskripsi' => 'Sampah plastik wisatawan dan ranting pohon tersangkut di bebatuan kali hulu Brantas daerah wisata Bumiaji.',
            ],
            [
                'alamat_lokasi' => 'Saluran Sekunder Waru, Tropodo Kulon, Waru, Kab. Sidoarjo, Jawa Timur',
                'latitude' => -7.3582000,
                'longitude' => 112.7561000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'menunggu_armada_dinas',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.8,
                'sumbatan_persen' => 65,
                'deskripsi' => 'Saluran sekunder Waru tertutup eceng gondok tebal dan botol plastik, air sering meluap ke perumahan Tropodo.',
            ],
            [
                'alamat_lokasi' => 'Tanggul Luapan Kali Porong, Juwetkenongo, Porong, Kab. Sidoarjo, Jawa Timur',
                'latitude' => -7.5451000,
                'longitude' => 112.6953000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 5.4,
                'sumbatan_persen' => 58,
                'deskripsi' => 'Timbunan sampah plastik kemasan tertahan di sempadan tanggul Kali Porong dekat rel kereta api.',
            ],
            [
                'alamat_lokasi' => 'Saluran Pembuangan Krian, Barengkrajan, Krian, Kab. Sidoarjo, Jawa Timur',
                'latitude' => -7.4062000,
                'longitude' => 112.5831000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => false,
                'volume_m3' => 2.1,
                'sumbatan_persen' => 20,
                'deskripsi' => 'Timbunan botol kaca sirup dan kardus karton di pinggir selokan pabrik Krian telah dikumpulkan warga.',
            ],
            [
                'alamat_lokasi' => 'Drainase Pergudangan Gedangan, Sawotratap, Gedangan, Kab. Sidoarjo, Jawa Timur',
                'latitude' => -7.3821000,
                'longitude' => 112.7314000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.1,
                'sumbatan_persen' => 48,
                'deskripsi' => 'Drainase saluran beton di depan kompleks pergudangan Sawotratap tersumbat bungkus plastik dan lumpur.',
            ],
            [
                'alamat_lokasi' => 'Kali Sidokare, Sepande, Candi, Kab. Sidoarjo, Jawa Timur',
                'latitude' => -7.4612000,
                'longitude' => 112.7124000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.6,
                'sumbatan_persen' => 52,
                'deskripsi' => 'Saluran Kali Sidokare mengalami pendangkalan akibat tumpukan sampah plastik rumah tangga dan kasur bekas.',
            ],
            [
                'alamat_lokasi' => 'Saluran Drainase Kawasan Industri Manyar, Manyar, Kab. Gresik, Jawa Timur',
                'latitude' => -7.1235000,
                'longitude' => 112.6052000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => false,
                'volume_m3' => 3.3,
                'sumbatan_persen' => 35,
                'deskripsi' => 'Plastik pembungkus palet dan drum bekas di parit saluran pembuangan kawasan industri Manyar.',
            ],
            [
                'alamat_lokasi' => 'TPS Liar Krikilan, Driyorejo, Kab. Gresik, Jawa Timur',
                'latitude' => -7.3481000,
                'longitude' => 112.6225000,
                'kategori_slug' => 'tps-liar-lahan-kosong',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Bahaya Kebakaran & Gas Metana',
                'is_resiko_banjir' => false,
                'volume_m3' => 4.5,
                'sumbatan_persen' => 20,
                'deskripsi' => 'Timbunan sampah liar di pinggir jalan raya Krikilan berisi tumpukan kardus karton dan botol plastik PET.',
            ],
            [
                'alamat_lokasi' => 'Aliran Kali Lamong, Morowudi, Cerme, Kab. Gresik, Jawa Timur',
                'latitude' => -7.2285000,
                'longitude' => 112.5512000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 6.2,
                'sumbatan_persen' => 75,
                'deskripsi' => 'Tumpukan sampah ranting kayu dan plastik menyumbat 75% aliran Kali Lamong yang rawan meluap saat hujan deras.',
            ],
            [
                'alamat_lokasi' => 'Saluran Kali Gembong, Kebonsari, Panggungrejo, Kota Pasuruan, Jawa Timur',
                'latitude' => -7.6432000,
                'longitude' => 112.9081000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.4,
                'sumbatan_persen' => 45,
                'deskripsi' => 'Aliran Kali Gembong menyempit karena timbunan sedimen sampah plastik dan styrofoam dekat pemukiman nelayan.',
            ],
            [
                'alamat_lokasi' => 'Bantaran Kali Welang, Kraton, Kab. Pasuruan, Jawa Timur',
                'latitude' => -7.6254000,
                'longitude' => 112.8712000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'menunggu_armada_dinas',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 5.7,
                'sumbatan_persen' => 70,
                'deskripsi' => 'Kali Welang sering meluap ke jalur pantura akibat sampah kayu dan kantong plastik yang menyangkut di jembatan Kraton.',
            ],
            [
                'alamat_lokasi' => 'Muara Kali Banger, Mayangan, Kota Probolinggo, Jawa Timur',
                'latitude' => -7.7421000,
                'longitude' => 113.2185000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.1,
                'sumbatan_persen' => 50,
                'deskripsi' => 'Muara sungai Banger dipenuhi limbah jaring rusak dan botol plastik yang hanyut dari pasar ikan Mayangan.',
            ],
            [
                'alamat_lokasi' => 'Saluran Air Kali Sadar, Magersari, Kota Mojokerto, Jawa Timur',
                'latitude' => -7.4721000,
                'longitude' => 112.4412000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'sedang_ditangani',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.9,
                'sumbatan_persen' => 55,
                'deskripsi' => 'Timbunan sampah plastik di pintu air Kali Sadar sedang dievakuasi tim satgas banjir PUPR.',
            ],
            [
                'alamat_lokasi' => 'Saluran Irigasi Peterongan, Mancar, Peterongan, Kab. Jombang, Jawa Timur',
                'latitude' => -7.5421000,
                'longitude' => 112.2854000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 2.8,
                'sumbatan_persen' => 42,
                'deskripsi' => 'Saluran irigasi tersumbat limbah kemasan sachet dan popok bayi di pintu bagi air Peterongan.',
            ],
            [
                'alamat_lokasi' => 'Bantaran Sungai Brantas Bandar Lor, Mojoroto, Kota Kediri, Jawa Timur',
                'latitude' => -7.8185000,
                'longitude' => 112.0042000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.6,
                'sumbatan_persen' => 48,
                'deskripsi' => 'Timbunan sampah plastik dan batang kayu di sempadan Brantas bawah jembatan Brawijaya Kediri.',
            ],
            [
                'alamat_lokasi' => 'Saluran Air Sukorejo, Pakunden, Sukorejo, Kota Blitar, Jawa Timur',
                'latitude' => -8.1023000,
                'longitude' => 112.1581000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Wabah Penyakit & Sanitasi',
                'is_resiko_banjir' => false,
                'volume_m3' => 1.7,
                'sumbatan_persen' => 22,
                'deskripsi' => 'Tumpukan kardus basah dan botol plastik mineral di pinggir jalan tembus Sukorejo, bernilai daur ulang tinggi.',
            ],
            [
                'alamat_lokasi' => 'Saluran Kali Banteng, Kartoharjo, Kota Madiun, Jawa Timur',
                'latitude' => -7.6285000,
                'longitude' => 111.5312000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 2.9,
                'sumbatan_persen' => 40,
                'deskripsi' => 'Saluran pembuang Kali Banteng tersumbat sampah plastik kresek dan potongan rumput basah.',
            ],
            [
                'alamat_lokasi' => 'Aliran Kali Bedadung, Jember Kidul, Kaliwates, Kab. Jember, Jawa Timur',
                'latitude' => -8.1754000,
                'longitude' => 113.6892000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.3,
                'sumbatan_persen' => 52,
                'deskripsi' => 'Timbunan sampah plastik domestik tersangkut di bendung gerak Kali Bedadung, mengurangi kapasitas tampung.',
            ],
            [
                'alamat_lokasi' => 'Muara Pantai Boom, Kampung Mandar, Kab. Banyuwangi, Jawa Timur',
                'latitude' => -8.2091000,
                'longitude' => 114.3852000,
                'kategori_slug' => 'fasilitas-publik',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => false,
                'volume_m3' => 2.5,
                'sumbatan_persen' => 18,
                'deskripsi' => 'Sampah botol plastik minuman kemasan dan sandal bekas menumpuk di pesisir pantai Boom, siap diangkut.',
            ],

            // ==========================================
            // PROVINSI JAWA TENGAH (33 Lokasi)
            // ==========================================
            [
                'alamat_lokasi' => 'Pintu Air Banjir Kanal Timur (BKT), Kemijen, Semarang Timur, Kota Semarang, Jawa Tengah',
                'latitude' => -6.9582000,
                'longitude' => 110.4412000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'menunggu_armada_dinas',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 6.8,
                'sumbatan_persen' => 75,
                'deskripsi' => 'Timbunan sampah plastik, kasur rusak, dan eceng gondok memadati saringan pintu air BKT, menghambat pelepasan air ke laut.',
            ],
            [
                'alamat_lokasi' => 'Banjir Kanal Barat (BKB), Bojongsalaman, Semarang Barat, Kota Semarang, Jawa Tengah',
                'latitude' => -6.9854000,
                'longitude' => 110.3985000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.5,
                'sumbatan_persen' => 50,
                'deskripsi' => 'Aliran BKB tertahan sampah styrofoam dan botol kemasan di bawah jembatan madukoro saat debit sungai naik.',
            ],
            [
                'alamat_lokasi' => 'Saluran Drainase Kaligawe Raya, Tambakrejo, Gayamsari, Kota Semarang, Jawa Tengah',
                'latitude' => -6.9612000,
                'longitude' => 110.4681000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 5.2,
                'sumbatan_persen' => 65,
                'deskripsi' => 'Drainase samping jalur pantura Kaligawe tersumbat sampah plastik dan lumpur rob, memicu genangan air di jalan raya.',
            ],
            [
                'alamat_lokasi' => 'Kali Semarang Kawasan Kota Lama, Bandarharjo, Semarang Utara, Kota Semarang, Jawa Tengah',
                'latitude' => -6.9685000,
                'longitude' => 110.4284000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'sedang_ditangani',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.7,
                'sumbatan_persen' => 45,
                'deskripsi' => 'Pembersihan endapan sampah plastik dan limbah cair di saluran Kali Semarang belakang gedung bersejarah Kota Lama.',
            ],
            [
                'alamat_lokasi' => 'Saluran Sekunder Pasar Johar, Kauman, Semarang Tengah, Kota Semarang, Jawa Tengah',
                'latitude' => -6.9732000,
                'longitude' => 110.4251000,
                'kategori_slug' => 'fasilitas-publik',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Wabah Penyakit & Sanitasi',
                'is_resiko_banjir' => false,
                'volume_m3' => 2.3,
                'sumbatan_persen' => 30,
                'deskripsi' => 'Tumpukan limbah kardus packing buah dan karung plastik di sudut belakang pasar Johar siap dijemput pengepul.',
            ],
            [
                'alamat_lokasi' => 'TPS Liar Bulusan, Tembalang, Kota Semarang, Jawa Tengah',
                'latitude' => -7.0542000,
                'longitude' => 110.4485000,
                'kategori_slug' => 'tps-liar-lahan-kosong',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Bahaya Kebakaran & Gas Metana',
                'is_resiko_banjir' => false,
                'volume_m3' => 3.8,
                'sumbatan_persen' => 15,
                'deskripsi' => 'Timbunan sampah plastik kemasan mie instan dan botol minuman mahasiswa menumpuk di tanah kosong dekat kampus.',
            ],
            [
                'alamat_lokasi' => 'Drainase Tambakaji, Ngaliyan, Kota Semarang, Jawa Tengah',
                'latitude' => -6.9921000,
                'longitude' => 110.3421000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.0,
                'sumbatan_persen' => 48,
                'deskripsi' => 'Saluran air curam tersumbat kantong sampah dan tanah longsoran kecil di lereng perumahan Tambakaji.',
            ],
            [
                'alamat_lokasi' => 'Kali Silandak, Kalibanteng Kulon, Semarang Barat, Kota Semarang, Jawa Tengah',
                'latitude' => -6.9812000,
                'longitude' => 110.3785000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.5,
                'sumbatan_persen' => 52,
                'deskripsi' => 'Sampah rumah tangga dan sisa potongan kayu menyumbat aliran Kali Silandak dekat Bandara Ahmad Yani.',
            ],
            [
                'alamat_lokasi' => 'Pintu Air Kali Pepe, Keprabon, Banjarsari, Kota Surakarta, Jawa Tengah',
                'latitude' => -7.5685000,
                'longitude' => 110.8254000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.6,
                'sumbatan_persen' => 46,
                'deskripsi' => 'Sumbatan botol plastik kemasan dan ranting di saringan besi Kali Pepe menghambat pelepasan air menuju Bengawan Solo.',
            ],
            [
                'alamat_lokasi' => 'Bantaran Bengawan Solo Jurug, Pucangsawit, Jebres, Kota Surakarta, Jawa Tengah',
                'latitude' => -7.5621000,
                'longitude' => 110.8582000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'menunggu_armada_dinas',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 6.1,
                'sumbatan_persen' => 60,
                'deskripsi' => 'Sampah kiriman dari hulu menumpuk tebal di bawah jembatan rel kereta Bengawan Solo Jurug.',
            ],
            [
                'alamat_lokasi' => 'Kali Jenes Semanggi, Pasar Kliwon, Kota Surakarta, Jawa Tengah',
                'latitude' => -7.5892000,
                'longitude' => 110.8412000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Wabah Penyakit & Sanitasi',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.2,
                'sumbatan_persen' => 54,
                'deskripsi' => 'Endapan limbah kain perca dan plastik di Kali Jenes Semanggi memicu bau tak sedap dan genangan air kotor.',
            ],
            [
                'alamat_lokasi' => 'Saluran Drainase Tirtonadi, Gilingan, Banjarsari, Kota Surakarta, Jawa Tengah',
                'latitude' => -7.5541000,
                'longitude' => 110.8214000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => false,
                'volume_m3' => 1.6,
                'sumbatan_persen' => 20,
                'deskripsi' => 'Timbunan botol plastik dan gelas air mineral bekas penumpang terminal Tirtonadi siap disetor ke bank sampah.',
            ],
            [
                'alamat_lokasi' => 'Kali Progo Kramat, Kramat Selatan, Magelang Utara, Kota Magelang, Jawa Tengah',
                'latitude' => -7.4651000,
                'longitude' => 110.2185000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 2.8,
                'sumbatan_persen' => 38,
                'deskripsi' => 'Sampah plastik dan sisa karung semen tersangkut di dam irigasi Kali Progo wilayah Kramat.',
            ],
            [
                'alamat_lokasi' => 'Saluran Irigasi Mertoyudan, Sumberrejo, Mertoyudan, Kab. Magelang, Jawa Tengah',
                'latitude' => -7.5214000,
                'longitude' => 110.2284000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'selesai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => false,
                'volume_m3' => 1.2,
                'sumbatan_persen' => 0,
                'deskripsi' => 'Saluran irigasi sawah Mertoyudan telah dibersihkan oleh kelompok tani dari sampah plastik dan daun kering.',
            ],
            [
                'alamat_lokasi' => 'Muara Kali Kupang, Krapyak, Pekalongan Utara, Kota Pekalongan, Jawa Tengah',
                'latitude' => -6.8712000,
                'longitude' => 109.6821000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.9,
                'sumbatan_persen' => 68,
                'deskripsi' => 'Muara Kali Kupang mengalami pendangkalan parah akibat sampah plastik bercampur lumpur rob laut Jawa.',
            ],
            [
                'alamat_lokasi' => 'Saluran Drainase Pasar Grogolan, Landungsari, Pekalongan Timur, Kota Pekalongan, Jawa Tengah',
                'latitude' => -6.8924000,
                'longitude' => 109.6785000,
                'kategori_slug' => 'fasilitas-publik',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Wabah Penyakit & Sanitasi',
                'is_resiko_banjir' => false,
                'volume_m3' => 2.4,
                'sumbatan_persen' => 28,
                'deskripsi' => 'Timbunan kardus bekas bungkus kain batik dan plastik kemasan menumpuk di gang pasar Grogolan.',
            ],
            [
                'alamat_lokasi' => 'Muara Kali Ketiwon, Muarareja, Tegal Barat, Kota Tegal, Jawa Tengah',
                'latitude' => -6.8521000,
                'longitude' => 109.1254000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.2,
                'sumbatan_persen' => 58,
                'deskripsi' => 'Aliran muara Kali Ketiwon tersumbat sampah botol plastik dan jerigen bekas bahan bakar kapal nelayan.',
            ],
            [
                'alamat_lokasi' => 'Saluran Drainase Kaligangsa, Margadana, Kota Tegal, Jawa Tengah',
                'latitude' => -6.8785000,
                'longitude' => 109.0982000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.1,
                'sumbatan_persen' => 44,
                'deskripsi' => 'Got pembuangan utama Margadana dipenuhi kantong kresek dan lumpur hitam, air tidak mengalir.',
            ],
            [
                'alamat_lokasi' => 'Bantaran Kali Pemali, Wanasari, Kab. Brebes, Jawa Tengah',
                'latitude' => -6.8682000,
                'longitude' => 109.0384000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'menunggu_armada_dinas',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 6.5,
                'sumbatan_persen' => 72,
                'deskripsi' => 'Pintu air Kali Pemali terhalang sampah bambu dan plastik tebal, meningkatkan risiko luapan ke persawahan bawang merah.',
            ],
            [
                'alamat_lokasi' => 'Muara Kali Losari, Pekauman, Losari, Kab. Brebes, Jawa Tengah',
                'latitude' => -6.8451000,
                'longitude' => 108.9214000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.9,
                'sumbatan_persen' => 46,
                'deskripsi' => 'Pertemuan muara Losari perbatasan Jabar-Jateng dipenuhi sampah plastik kemasan yang terbawa arus laut.',
            ],
            [
                'alamat_lokasi' => 'Pintu Air Kali Gelis, Demaan, Kota Kudus, Kab. Kudus, Jawa Tengah',
                'latitude' => -6.8124000,
                'longitude' => 110.8385000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.7,
                'sumbatan_persen' => 50,
                'deskripsi' => 'Sampah plastik kemasan rokok dan botol minuman tertahan di sekat pintu air Kali Gelis Demaan.',
            ],
            [
                'alamat_lokasi' => 'Saluran Irigasi Jati Wetan, Jati, Kab. Kudus, Jawa Tengah',
                'latitude' => -6.8354000,
                'longitude' => 110.8251000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.3,
                'sumbatan_persen' => 62,
                'deskripsi' => 'Saluran Jati Wetan rawan genangan banjir karena saluran tersumbat timbunan styrofoam dan sampah liar.',
            ],
            [
                'alamat_lokasi' => 'Saluran Drainase Sayung Pantura, Sriwulan, Sayung, Kab. Demak, Jawa Tengah',
                'latitude' => -6.9452000,
                'longitude' => 110.5124000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'menunggu_armada_dinas',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 5.6,
                'sumbatan_persen' => 70,
                'deskripsi' => 'Drainase Sayung tergenang rob permanen diperparah tumpukan sampah plastik yang menyumbat gorong-gorong pantura.',
            ],
            [
                'alamat_lokasi' => 'Bantaran Kali Tuntang, Karanganyar, Kab. Demak, Jawa Tengah',
                'latitude' => -6.8854000,
                'longitude' => 110.6482000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 5.0,
                'sumbatan_persen' => 64,
                'deskripsi' => 'Timbunan sampah liar di tanggul Kali Tuntang memperlemah daya tahan tanggul terhadap arus deras.',
            ],
            [
                'alamat_lokasi' => 'Muara Kali Juwana, Bendar, Juwana, Kab. Pati, Jawa Tengah',
                'latitude' => -6.7124000,
                'longitude' => 111.1524000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.8,
                'sumbatan_persen' => 55,
                'deskripsi' => 'Aliran alur pelayaran kapal Juwana terganggu sampah plastik terapung dan sisa drum industri perikanan.',
            ],
            [
                'alamat_lokasi' => 'Saluran Kali Wiso, Jobokuto, Jepara Kota, Kab. Jepara, Jawa Tengah',
                'latitude' => -6.5882000,
                'longitude' => 110.6654000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => false,
                'volume_m3' => 2.1,
                'sumbatan_persen' => 22,
                'deskripsi' => 'Potongan serbuk kayu dan limbah kardus mebel di saluran Kali Wiso Jobokuto, siap untuk didaur ulang.',
            ],
            [
                'alamat_lokasi' => 'Aliran Kali Logawa, Karanglewas Lor, Kab. Banyumas, Jawa Tengah',
                'latitude' => -7.4285000,
                'longitude' => 109.1982000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.5,
                'sumbatan_persen' => 45,
                'deskripsi' => 'Tumpukan kantong kresek dan sisa material bangunan di pinggiran kali Logawa Karanglewas.',
            ],
            [
                'alamat_lokasi' => 'Drainase Pemukiman Kranji, Purwokerto Timur, Kab. Banyumas, Jawa Tengah',
                'latitude' => -7.4214000,
                'longitude' => 109.2451000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'selesai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => false,
                'volume_m3' => 1.1,
                'sumbatan_persen' => 0,
                'deskripsi' => 'Drainase perumahan Kranji telah bersih tuntas dari tumpukan sampah plastik dan lumpur selokan.',
            ],
            [
                'alamat_lokasi' => 'Muara Donan Segara Anakan, Tambakreja, Cilacap Selatan, Kab. Cilacap, Jawa Tengah',
                'latitude' => -7.7285000,
                'longitude' => 108.9982000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 5.3,
                'sumbatan_persen' => 56,
                'deskripsi' => 'Sampah plastik dan kemasan oli menumpuk di akar mangrove muara Donan laguna Segara Anakan.',
            ],
            [
                'alamat_lokasi' => 'Saluran Kali Luk Ulo, Panjer, Kebumen Kota, Kab. Kebumen, Jawa Tengah',
                'latitude' => -7.6782000,
                'longitude' => 109.6584000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.4,
                'sumbatan_persen' => 42,
                'deskripsi' => 'Sampah limbah pasar dan plastik kresek menyangkut di bronjong pelindung tebing Kali Luk Ulo.',
            ],
            [
                'alamat_lokasi' => 'Saluran Irigasi Bogowonto, Purwodadi, Kab. Purworejo, Jawa Tengah',
                'latitude' => -7.7854000,
                'longitude' => 110.0124000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => false,
                'volume_m3' => 1.8,
                'sumbatan_persen' => 18,
                'deskripsi' => 'Tumpukan botol plastik pestisida dan botol minuman kemasan di sempadan saluran irigasi sawah Bogowonto.',
            ],
            [
                'alamat_lokasi' => 'Saluran Irigasi Dengkeng, Cawas, Kab. Klaten, Jawa Tengah',
                'latitude' => -7.7541000,
                'longitude' => 110.6854000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.8,
                'sumbatan_persen' => 50,
                'deskripsi' => 'Pintu air saluran primer Dengkeng tersumbat batang pisang dan karung sampah yang dibuang warga.',
            ],
            [
                'alamat_lokasi' => 'Saluran Kali Benoyo, Kutowinangun Kidul, Tingkir, Kota Salatiga, Jawa Tengah',
                'latitude' => -7.3385000,
                'longitude' => 110.5124000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 2.6,
                'sumbatan_persen' => 36,
                'deskripsi' => 'Aliran Kali Benoyo terhambat limbah plastik dan styrofoam di kolong jembatan lingkar Salatiga.',
            ],

            // ==========================================
            // PROVINSI JAWA BARAT (33 Lokasi)
            // ==========================================
            [
                'alamat_lokasi' => 'Sungai Citarum Sektor 7, Andir, Dayeuhkolot, Kab. Bandung, Jawa Barat',
                'latitude' => -6.9854000,
                'longitude' => 107.6251000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'menunggu_armada_dinas',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 7.5,
                'sumbatan_persen' => 80,
                'deskripsi' => 'Lautan sampah plastik, styrofoam, dan eceng gondok membentang puluhan meter di Citarum Dayeuhkolot, rawan luapan banjir.',
            ],
            [
                'alamat_lokasi' => 'Kolong Jembatan Citarum Baleendah, Rancamanyar, Baleendah, Kab. Bandung, Jawa Barat',
                'latitude' => -6.9985000,
                'longitude' => 107.6082000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 5.8,
                'sumbatan_persen' => 68,
                'deskripsi' => 'Timbunan sampah kain limbah konveksi dan botol plastik tersangkut di pilar beton jembatan Rancamanyar.',
            ],
            [
                'alamat_lokasi' => 'Bantaran Cikapundung Braga, Braga, Sumur Bandung, Kota Bandung, Jawa Barat',
                'latitude' => -6.9214000,
                'longitude' => 107.6112000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'sedang_ditangani',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.1,
                'sumbatan_persen' => 40,
                'deskripsi' => 'Pembersihan rutin sampah plastik kemasan kuliner di bantaran Sungai Cikapundung kawasan wisata Braga.',
            ],
            [
                'alamat_lokasi' => 'Saluran Drainase Pasar Cicadas, Cibeunying Kidul, Kota Bandung, Jawa Barat',
                'latitude' => -6.9085000,
                'longitude' => 107.6451000,
                'kategori_slug' => 'fasilitas-publik',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Wabah Penyakit & Sanitasi',
                'is_resiko_banjir' => false,
                'volume_m3' => 2.7,
                'sumbatan_persen' => 35,
                'deskripsi' => 'Tumpukan limbah kardus packing sayur dan botol plastik di gang belakang pasar Cicadas siap diangkut.',
            ],
            [
                'alamat_lokasi' => 'Sungai Citepus Pagarsih, Jamika, Bojongloa Kaler, Kota Bandung, Jawa Barat',
                'latitude' => -6.9245000,
                'longitude' => 107.5921000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.6,
                'sumbatan_persen' => 65,
                'deskripsi' => 'Aliran sempit Sungai Citepus Pagarsih tersumbat sampah plastik kresek tebal, sering memicu banjir luapan ke jalan raya.',
            ],
            [
                'alamat_lokasi' => 'Saluran Sekunder Cinambo, Cisaranten Kulon, Arcamanik, Kota Bandung, Jawa Barat',
                'latitude' => -6.9452000,
                'longitude' => 107.6685000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.4,
                'sumbatan_persen' => 50,
                'deskripsi' => 'Saluran sekunder Cinambo dipenuhi buangan sampah domestik dan ranting pohon di kawasan Arcamanik.',
            ],
            [
                'alamat_lokasi' => 'TPS Liar Majalaya, Padamulya, Majalaya, Kab. Bandung, Jawa Barat',
                'latitude' => -7.0512000,
                'longitude' => 107.7541000,
                'kategori_slug' => 'tps-liar-lahan-kosong',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Bahaya Kebakaran & Gas Metana',
                'is_resiko_banjir' => false,
                'volume_m3' => 4.2,
                'sumbatan_persen' => 18,
                'deskripsi' => 'Timbunan sampah kardus gulungan benang dan karung sisa industri tekstil di pinggir jalan Majalaya.',
            ],
            [
                'alamat_lokasi' => 'Aliran Kali Cimahi, Karangmekar, Cimahi Tengah, Kota Cimahi, Jawa Barat',
                'latitude' => -6.8785000,
                'longitude' => 107.5452000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.3,
                'sumbatan_persen' => 45,
                'deskripsi' => 'Sampah plastik kantong dan styrofoam menyumbat pilar jembatan Kali Cimahi dekat stasiun.',
            ],
            [
                'alamat_lokasi' => 'Muara Inlet Waduk Saguling, Cihampelas, Kab. Bandung Barat, Jawa Barat',
                'latitude' => -6.9324000,
                'longitude' => 107.4982000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'menunggu_armada_dinas',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 8.2,
                'sumbatan_persen' => 85,
                'deskripsi' => 'Pulau sampah plastik dan eceng gondok masif mengapung di muara waduk Saguling mengancam turbin pembangkit listrik.',
            ],
            [
                'alamat_lokasi' => 'Pintu Air Bendung Kali Bekasi, Margahayu, Bekasi Timur, Kota Bekasi, Jawa Barat',
                'latitude' => -6.2485000,
                'longitude' => 106.9982000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'menunggu_armada_dinas',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 6.4,
                'sumbatan_persen' => 70,
                'deskripsi' => 'Buih busa limbah deterjen bercampur tumpukan sampah plastik tebal tertahan di pintu air Bendung Kali Bekasi.',
            ],
            [
                'alamat_lokasi' => 'Bantaran Kali Jambe, Mangunjaya, Tambun Selatan, Kab. Bekasi, Jawa Barat',
                'latitude' => -6.2582000,
                'longitude' => 107.0584000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 5.5,
                'sumbatan_persen' => 66,
                'deskripsi' => 'Kali Jambe tertutup total oleh sampah plastik kresek dan styrofoam sepanjang 150 meter di Tambun Selatan.',
            ],
            [
                'alamat_lokasi' => 'Saluran Kali CBL (Cikarang Bekasi Laut), Cibitung, Kab. Bekasi, Jawa Barat',
                'latitude' => -6.2354000,
                'longitude' => 107.1124000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.7,
                'sumbatan_persen' => 52,
                'deskripsi' => 'Timbunan sampah plastik kemasan industri dan ban bekas menumpuk di sempadan Kali CBL Cibitung.',
            ],
            [
                'alamat_lokasi' => 'TPS Liar Sekitar TPST Bantar Gebang, Cikiwul, Bantargebang, Kota Bekasi, Jawa Barat',
                'latitude' => -6.3385000,
                'longitude' => 106.9951000,
                'kategori_slug' => 'tps-liar-lahan-kosong',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Bahaya Kebakaran & Gas Metana',
                'is_resiko_banjir' => false,
                'volume_m3' => 6.0,
                'sumbatan_persen' => 20,
                'deskripsi' => 'Lahan sortir rongsok botol plastik PET dan kardus berkapasitas besar di sekitar akses Bantar Gebang.',
            ],
            [
                'alamat_lokasi' => 'Drainase Kawasan Industri Jababeka 2, Cikarang Utara, Kab. Bekasi, Jawa Barat',
                'latitude' => -6.2912000,
                'longitude' => 107.1485000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.8,
                'sumbatan_persen' => 54,
                'deskripsi' => 'Saluran drainase primer kawasan industri Jababeka tersumbat palet kayu rusak dan plastik wrapping.',
            ],
            [
                'alamat_lokasi' => 'Saluran Primer Rawa Lumbu, Bojong Rawalumbu, Rawalumbu, Kota Bekasi, Jawa Barat',
                'latitude' => -6.2714000,
                'longitude' => 107.0124000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.1,
                'sumbatan_persen' => 58,
                'deskripsi' => 'Saluran pembuang perumahan Rawa Lumbu mengalami pendangkalan akibat tumpukan sampah kantong plastik.',
            ],
            [
                'alamat_lokasi' => 'Bantaran Sungai Cisadane Baranangsiang, Bogor Timur, Kota Bogor, Jawa Barat',
                'latitude' => -6.6024000,
                'longitude' => 106.8124000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.9,
                'sumbatan_persen' => 48,
                'deskripsi' => 'Timbunan sampah plastik dan batang bambu tertahan di pilar jembatan Cisadane Baranangsiang.',
            ],
            [
                'alamat_lokasi' => 'Kolong Jembatan Ciliwung Ciawi, Harjasari, Bogor Selatan, Kota Bogor, Jawa Barat',
                'latitude' => -6.6541000,
                'longitude' => 106.8452000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.4,
                'sumbatan_persen' => 55,
                'deskripsi' => 'Sampah kiriman dari kawasan puncak menumpuk di bebatuan kali Ciliwung Ciawi, siap hanyut ke hilir.',
            ],
            [
                'alamat_lokasi' => 'Pintu Air Bendung Katulampa Hulu, Katulampa, Bogor Timur, Kota Bogor, Jawa Barat',
                'latitude' => -6.6341000,
                'longitude' => 106.8354000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'menunggu_armada_dinas',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 5.2,
                'sumbatan_persen' => 62,
                'deskripsi' => 'Sampah kayu gelondongan dan botol plastik menghantam saringan sampah Bendung Katulampa saat siaga hujan deras.',
            ],
            [
                'alamat_lokasi' => 'Saluran Drainase Pasar Cibinong, Cirimekar, Cibinong, Kab. Bogor, Jawa Barat',
                'latitude' => -6.4852000,
                'longitude' => 106.8524000,
                'kategori_slug' => 'fasilitas-publik',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Wabah Penyakit & Sanitasi',
                'is_resiko_banjir' => false,
                'volume_m3' => 2.5,
                'sumbatan_persen' => 30,
                'deskripsi' => 'Tumpukan kardus karton dan botol air mineral di selokan pasar Cibinong telah dipilah warga.',
            ],
            [
                'alamat_lokasi' => 'Bantaran Kali Bojonggede, Bojong Baru, Bojonggede, Kab. Bogor, Jawa Barat',
                'latitude' => -6.4982000,
                'longitude' => 106.7985000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.2,
                'sumbatan_persen' => 46,
                'deskripsi' => 'Saluran kali Bojonggede menyempit akibat pembuangan sampah liar kantong kresek di pinggir rel stasiun.',
            ],
            [
                'alamat_lokasi' => 'Saluran Outlet Setu Pengasinan, Pengasinan, Sawangan, Kota Depok, Jawa Barat',
                'latitude' => -6.4214000,
                'longitude' => 106.7582000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.5,
                'sumbatan_persen' => 42,
                'deskripsi' => 'Pintu pembuangan danau Setu Pengasinan terhambat sampah botol plastik minuman wisatawan dan gulma air.',
            ],
            [
                'alamat_lokasi' => 'Bantaran Kali Ciliwung Pondok Cina, Beji, Kota Depok, Jawa Barat',
                'latitude' => -6.3785000,
                'longitude' => 106.8324000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.0,
                'sumbatan_persen' => 50,
                'deskripsi' => 'Timbunan sampah plastik kemasan menumpuk di sempadan tebing kali Ciliwung bawah jembatan Juanda.',
            ],
            [
                'alamat_lokasi' => 'Saluran Drainase Jl. Raya Bogor KM 31, Cisalak Pasar, Cimanggis, Kota Depok, Jawa Barat',
                'latitude' => -6.3654000,
                'longitude' => 106.8685000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'selesai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => false,
                'volume_m3' => 1.5,
                'sumbatan_persen' => 0,
                'deskripsi' => 'Gorong-gorong Jl. Raya Bogor Cisalak telah dibersihkan oleh petugas dinas dan warga kerja bakti.',
            ],
            [
                'alamat_lokasi' => 'Saluran Irigasi Tarum Barat (Kalimalang), Telukjambe Timur, Kab. Karawang, Jawa Barat',
                'latitude' => -6.3214000,
                'longitude' => 107.2982000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.6,
                'sumbatan_persen' => 52,
                'deskripsi' => 'Saluran air baku Kalimalang tertahan sampah plastik dan styrofoam di saringan siphon Telukjambe.',
            ],
            [
                'alamat_lokasi' => 'Bantaran Citarum Hilir, Rengasdengklok Selatan, Rengasdengklok, Kab. Karawang, Jawa Barat',
                'latitude' => -6.1582000,
                'longitude' => 107.2754000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 5.1,
                'sumbatan_persen' => 60,
                'deskripsi' => 'Endapan sampah plastik rumah tangga dan ranting di bantaran tanggul Citarum Rengasdengklok.',
            ],
            [
                'alamat_lokasi' => 'Saluran Pembuangan Pasar Cikampek, Cikampek Kota, Cikampek, Kab. Karawang, Jawa Barat',
                'latitude' => -6.4185000,
                'longitude' => 107.4582000,
                'kategori_slug' => 'fasilitas-publik',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Wabah Penyakit & Sanitasi',
                'is_resiko_banjir' => false,
                'volume_m3' => 2.8,
                'sumbatan_persen' => 32,
                'deskripsi' => 'Limbah kardus buah dan karung plastik berserakan di belakang stasiun/pasar Cikampek, siap ditimbang.',
            ],
            [
                'alamat_lokasi' => 'Muara Kali Sukalila, Kasepuhan, Lemahwungkuk, Kota Cirebon, Jawa Barat',
                'latitude' => -6.7154000,
                'longitude' => 108.5712000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.5,
                'sumbatan_persen' => 58,
                'deskripsi' => 'Aliran Kali Sukalila dekat pelabuhan Cirebon dipenuhi sampah plastik kemasan dan lumpur hitam berbau.',
            ],
            [
                'alamat_lokasi' => 'Saluran Kali Cipager, Megu Cilik, Weru, Kab. Cirebon, Jawa Barat',
                'latitude' => -6.6982000,
                'longitude' => 108.5124000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.2,
                'sumbatan_persen' => 44,
                'deskripsi' => 'Sampah limbah rotan dan plastik menumpuk di pintu air irigasi Kali Cipager Weru.',
            ],
            [
                'alamat_lokasi' => 'Bantaran Sungai Cimanuk Jatibarang, Jatibarang Lor, Jatibarang, Kab. Indramayu, Jawa Barat',
                'latitude' => -6.4712000,
                'longitude' => 108.3124000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 4.9,
                'sumbatan_persen' => 56,
                'deskripsi' => 'Timbunan sampah plastik dan batang kayu menumpuk di bawah jembatan kereta api Cimanuk Jatibarang.',
            ],
            [
                'alamat_lokasi' => 'Saluran Irigasi Cisaat, Sukamanah, Cisaat, Kab. Sukabumi, Jawa Barat',
                'latitude' => -6.9085000,
                'longitude' => 106.8924000,
                'kategori_slug' => 'drainase-pemukiman',
                'status_kode' => 'siap_diambil_pengepul',
                'tipe_bahaya' => 'Pencemaran Bau & Kualitas Air',
                'is_resiko_banjir' => false,
                'volume_m3' => 1.7,
                'sumbatan_persen' => 20,
                'deskripsi' => 'Tumpukan botol plastik minuman kemasan dan kardus di tepi saluran irigasi Cisaat telah dikarungi.',
            ],
            [
                'alamat_lokasi' => 'Aliran Kali Cianjur, Bojongherang, Cianjur Kota, Kab. Cianjur, Jawa Barat',
                'latitude' => -6.8185000,
                'longitude' => 107.1382000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.6,
                'sumbatan_persen' => 48,
                'deskripsi' => 'Sampah rumah tangga dan sisa puing menumpuk di saluran Kali Cianjur daerah Bojongherang.',
            ],
            [
                'alamat_lokasi' => 'Saluran Kali Ciwulan, Sukamanah, Cipedes, Kota Tasikmalaya, Jawa Barat',
                'latitude' => -7.3214000,
                'longitude' => 108.2185000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'terverifikasi_ai',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 3.8,
                'sumbatan_persen' => 50,
                'deskripsi' => 'Aliran Kali Ciwulan tertahan timbunan plastik kresek dan sisa potongan bambu di jembatan Cipedes.',
            ],
            [
                'alamat_lokasi' => 'Bantaran Sungai Cimanuk Tarogong, Haurpanggung, Tarogong Kidul, Kab. Garut, Jawa Barat',
                'latitude' => -7.2154000,
                'longitude' => 107.8982000,
                'kategori_slug' => 'sungai-saluran-air',
                'status_kode' => 'menunggu_armada_dinas',
                'tipe_bahaya' => 'Banjir & Luapan Air',
                'is_resiko_banjir' => true,
                'volume_m3' => 5.4,
                'sumbatan_persen' => 64,
                'deskripsi' => 'Timbunan sampah plastik tebal di sempadan Cimanuk Tarogong yang rawan terseret arus banjir bandang musim penghujan.',
            ],
        ];
    }
}
