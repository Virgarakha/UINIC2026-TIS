<?php

namespace Tests\Feature;

use App\Models\KategoriSampah;
use App\Models\LaporanSampah;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LaporanApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * Test public can list reports with 'all' flag for map display.
     */
    public function test_can_list_all_reports_for_map(): void
    {
        $response = $this->getJson('/api/v1/laporan?all=true');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                '*' => [
                    'id',
                    'latitude',
                    'longitude',
                    'alamat_lokasi',
                    'foto_url',
                    'status',
                    'kategori',
                ],
            ],
        ]);
    }

    /**
     * Test public can store new report with multimodal AI analysis and weather data.
     */
    public function test_can_store_report_with_ai_analysis_and_weather(): void
    {
        $kategori = KategoriSampah::first();

        $payload = [
            'foto_url' => 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600',
            'latitude' => -7.9826,
            'longitude' => 112.6308,
            'alamat_lokasi' => 'Jl. Ijen No. 10, Kota Malang',
            'deskripsi' => 'Tumpukan botol plastik menghambat saluran drainase depan taman.',
            'kategori_id' => $kategori?->id,
            'is_resiko_banjir' => true,
            'tipe_bahaya' => 'Banjir & Luapan Air',
            'analisis_ai' => [
                'volume_sampah_m3' => 4.5,
                'persentase_sumbatan_aliran' => 75,
                'estimasi_berat_kg' => 320,
                'potensi_bahaya' => 'Banjir & Luapan Air',
                'prediksi_banjir' => 'TINGGI',
                'confidence_score' => 95.5,
                'rekomendasi_tindakan' => 'Segera angkut tumpukan botol sebelum hujan lebat.',
                'jenis_sampah_dominan' => 'Plastik & Botol',
                'nilai_ekonomi_estimasi' => 150000,
            ],
            'weather' => [
                'precipitation' => 12.5,
                'rain' => 12.5,
                'windSpeed' => 8.4,
                'weatherDescription' => 'Hujan Sedang',
            ],
        ];

        $response = $this->postJson('/api/v1/laporan', $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'message' => 'Laporan dan analisis AI berhasil disimpan ke database',
        ]);
        $response->assertJsonPath('data.alamat_lokasi', 'Jl. Ijen No. 10, Kota Malang');
        $response->assertJsonPath('data.analisis_ai.volume_sampah_m3', 4.5);
        $response->assertJsonPath('data.analisis_ai.persentase_sumbatan_aliran', 75);

        // Verify row exists in PostgreSQL / SQLite database
        $this->assertDatabaseHas('laporan_sampah', [
            'alamat_lokasi' => 'Jl. Ijen No. 10, Kota Malang',
            'is_resiko_banjir' => true,
        ]);

        $this->assertDatabaseHas('analisis_ai', [
            'estimasi_volume_m3' => 4.5,
            'estimasi_sumbatan_persen' => 75,
            'tingkat_resiko_banjir' => 'TINGGI',
        ]);

        $this->assertDatabaseHas('data_lingkungan', [
            'intensitas_hujan_mm' => 12.5,
            'prakiraan_cuaca' => 'Hujan Sedang',
        ]);
    }

    /**
     * Test logged-in user receives points when reporting.
     */
    public function test_authenticated_user_receives_points_on_report(): void
    {
        $user = User::factory()->create(['poin_reward' => 100]);
        Sanctum::actingAs($user);

        $payload = [
            'foto_url' => 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600',
            'latitude' => -7.9482,
            'longitude' => 112.6075,
            'alamat_lokasi' => 'Jl. Soekarno Hatta, Malang',
            'deskripsi' => 'Laporan dari warga aktif.',
        ];

        $response = $this->postJson('/api/v1/laporan', $payload);

        $response->assertStatus(201);
        $user->refresh();
        $this->assertEquals(125, $user->poin_reward);
    }

    /**
     * Test single report detail retrieval.
     */
    public function test_can_get_single_report_detail(): void
    {
        $laporan = LaporanSampah::first();

        $response = $this->getJson("/api/v1/laporan/{$laporan->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $laporan->id);
    }
}
