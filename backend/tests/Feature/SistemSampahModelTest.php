<?php

namespace Tests\Feature;

use App\Models\AlamatPengguna;
use App\Models\AnalisisAi;
use App\Models\KatalogHadiah;
use App\Models\KategoriSampah;
use App\Models\LaporanSampah;
use App\Models\MasterJenisSampah;
use App\Models\MasterTipeTanggapan;
use App\Models\PenukaranHadiah;
use App\Models\StatusLaporan;
use App\Models\TanggapanLaporan;
use App\Models\User;
use Database\Seeders\MicroTablesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SistemSampahModelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MicroTablesSeeder::class);
    }

    /**
     * Test micro-tables are seeded properly.
     */
    public function test_micro_tables_are_seeded(): void
    {
        $this->assertDatabaseCount('kategori_sampah', 4);
        $this->assertDatabaseCount('status_laporan', 7);
        $this->assertDatabaseCount('kategori_hadiah', 4);
        $this->assertDatabaseCount('master_jenis_sampah', 5);
        $this->assertDatabaseCount('master_tipe_tanggapan', 3);
        $this->assertDatabaseCount('katalog_hadiah', 4);
    }

    /**
     * Test user role attributes and defaults.
     */
    public function test_user_role_and_points_defaults(): void
    {
        $user = User::factory()->create();

        $this->assertEquals('warga', $user->role);
        $this->assertTrue($user->isWarga());
        $this->assertFalse($user->isPengepul());
        $this->assertEquals(0, $user->poin_reward);
    }

    /**
     * Test creating a LaporanSampah with relations.
     */
    public function test_laporan_sampah_creation_and_relations(): void
    {
        $user = User::factory()->create();
        $kategori = KategoriSampah::first();
        $status = StatusLaporan::where('kode', 'menunggu_analisis')->first();

        $laporan = LaporanSampah::create([
            'user_id' => $user->id,
            'kategori_id' => $kategori->id,
            'status_id' => $status->id,
            'foto_url' => 'https://example.com/foto-sampah.jpg',
            'latitude' => -7.9826000,
            'longitude' => 112.6308000,
            'alamat_lokasi' => 'Jl. Jembatan Brantas, Klojen, Malang',
            'deskripsi' => 'Tumpukan sampah plastik menyumbat pintu air.',
            'is_resiko_banjir' => true,
        ]);

        $this->assertDatabaseHas('laporan_sampah', [
            'id' => $laporan->id,
            'is_resiko_banjir' => true,
        ]);

        $this->assertEquals($user->id, $laporan->pelapor->id);
        $this->assertEquals($kategori->id, $laporan->kategori->id);
        $this->assertEquals($status->id, $laporan->status->id);
    }

    /**
     * Test crowdsourced tanggapan by another citizen.
     */
    public function test_crowdsourced_tanggapan_relation(): void
    {
        $wargaA = User::factory()->create(['name' => 'Warga A']);
        $wargaB = User::factory()->create(['name' => 'Warga B']);

        $status = StatusLaporan::first();

        $laporan = LaporanSampah::create([
            'user_id' => $wargaA->id,
            'status_id' => $status->id,
            'foto_url' => 'https://example.com/foto1.jpg',
            'latitude' => -7.9826,
            'longitude' => 112.6308,
        ]);

        $tipe = MasterTipeTanggapan::first();

        $tanggapan = TanggapanLaporan::create([
            'laporan_id' => $laporan->id,
            'user_id' => $wargaB->id,
            'tipe_tanggapan_id' => $tipe->id,
            'komentar' => 'Saya juga melihat sampah semakin tinggi sore ini.',
            'foto_bukti_tambahan_url' => 'https://example.com/foto2.jpg',
        ]);

        $this->assertCount(1, $laporan->fresh()->tanggapan);
        $this->assertEquals($wargaB->id, $tanggapan->user->id);
        $this->assertEquals($laporan->id, $tanggapan->laporan->id);
    }

    /**
     * Test AnalisisAi creation, JSON casting, and anti-fraud method.
     */
    public function test_analisis_ai_json_and_anti_fraud(): void
    {
        $status = StatusLaporan::first();

        $laporan = LaporanSampah::create([
            'status_id' => $status->id,
            'foto_url' => 'https://example.com/foto.jpg',
            'latitude' => -7.98,
            'longitude' => 112.63,
        ]);

        $jenisSampah = MasterJenisSampah::first();

        $analisis = AnalisisAi::create([
            'laporan_id' => $laporan->id,
            'estimasi_volume_m3' => 2.50,
            'estimasi_sumbatan_persen' => 45,
            'jenis_sampah_dominan_id' => $jenisSampah->id,
            'tingkat_resiko_banjir' => 'TINGGI',
            'ai_confidence_score' => 0.880,
            'raw_payload_json' => [
                'detector' => 'Gemini 2.5 Flash Multimodal',
                'detected_objects' => ['plastic_bottles', 'branches'],
            ],
        ]);

        $this->assertTrue($analisis->isLolosAntiFraud());
        $this->assertIsArray($analisis->raw_payload_json);
        $this->assertEquals('Gemini 2.5 Flash Multimodal', $analisis->raw_payload_json['detector']);
        $this->assertEquals($analisis->id, $laporan->fresh()->analisisAi->id);
    }

    /**
     * Test AlamatPengguna and PenukaranHadiah address snapshotting.
     */
    public function test_penukaran_hadiah_with_address_snapshot(): void
    {
        $user = User::factory()->create(['poin_reward' => 1000]);

        $alamat = AlamatPengguna::create([
            'user_id' => $user->id,
            'label_alamat' => 'Rumah',
            'nama_penerima' => 'Lily Doe',
            'no_telepon' => '08123456789',
            'alamat_lengkap' => 'Jl. Ijen No. 12',
            'kota' => 'Malang',
            'kode_pos' => '65115',
            'is_utama' => true,
        ]);

        $hadiah = KatalogHadiah::first();

        $penukaran = PenukaranHadiah::create([
            'user_id' => $user->id,
            'hadiah_id' => $hadiah->id,
            'alamat_id' => $alamat->id,
            'poin_digunakan' => $hadiah->poin_dibutuhkan,
            'status_pengiriman' => 'menunggu_konfirmasi',
            'alamat_pengiriman_snapshot' => [
                'penerima' => $alamat->nama_penerima,
                'telepon' => $alamat->no_telepon,
                'alamat' => $alamat->alamat_lengkap,
                'kota' => $alamat->kota,
            ],
        ]);

        $this->assertDatabaseHas('penukaran_hadiah', [
            'id' => $penukaran->id,
            'poin_digunakan' => $hadiah->poin_dibutuhkan,
        ]);
        $this->assertEquals('Lily Doe', $penukaran->alamat_pengiriman_snapshot['penerima']);
    }
}
