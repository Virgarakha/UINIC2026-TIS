<?php

namespace Tests\Feature;

use App\Models\LaporanSampah;
use App\Models\User;
use Database\Seeders\LaporanSampahSeeder;
use Database\Seeders\MicroTablesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminNavigationTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MicroTablesSeeder::class);
        $this->seed(LaporanSampahSeeder::class);

        $this->adminUser = User::factory()->create([
            'role' => 'admin',
        ]);
    }

    /**
     * Test admin dashboard renders with full stats.
     */
    public function test_admin_dashboard_renders(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('admin.dashboard'));

        $response->assertStatus(200);
        $response->assertSee('Sistem Sampah');
        $response->assertSee('Laporan Sampah');
        $response->assertSee('Bahaya Lingkungan');
    }

    /**
     * Test interactive GIS map page renders.
     */
    public function test_admin_peta_page_renders(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('admin.peta.index'));

        $response->assertStatus(200);
        $response->assertSee('Peta Interaktif');
        $response->assertSee('Radar Titik Sampah');
    }

    /**
     * Test waste reports page and DataTables AJAX endpoint.
     */
    public function test_admin_laporan_page_and_ajax_datatable(): void
    {
        $pageResponse = $this->actingAs($this->adminUser)->get(route('admin.laporan.index'));
        $pageResponse->assertStatus(200);
        $pageResponse->assertSee('Daftar Laporan Sampah Masuk');

        $ajaxResponse = $this->actingAs($this->adminUser)->getJson(route('admin.laporan.index'), [
            'X-Requested-With' => 'XMLHttpRequest',
        ]);
        $ajaxResponse->assertStatus(200);
        $ajaxResponse->assertJsonStructure(['draw', 'recordsTotal', 'recordsFiltered', 'data']);
    }

    /**
     * Test crowdsourced tanggapan page renders.
     */
    public function test_admin_tanggapan_page_renders(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('admin.tanggapan.index'));

        $response->assertStatus(200);
        $response->assertSee('Tanggapan Warga');
    }

    /**
     * Test AI vision analytics page renders.
     */
    public function test_admin_analisis_ai_page_renders(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('admin.analisis-ai.index'));

        $response->assertStatus(200);
        $response->assertSee('Analisis AI');
        $response->assertSee('Confidence Score');
    }

    /**
     * Test flood early warning page and DataTables AJAX endpoint.
     */
    public function test_admin_peringatan_dini_page_and_ajax(): void
    {
        $pageResponse = $this->actingAs($this->adminUser)->get(route('admin.peringatan-dini.index'));
        $pageResponse->assertStatus(200);
        $pageResponse->assertSee('Peringatan Dini &amp; Bahaya', false);

        $ajaxResponse = $this->actingAs($this->adminUser)->getJson(route('admin.peringatan-dini.index'), [
            'X-Requested-With' => 'XMLHttpRequest',
        ]);
        $ajaxResponse->assertStatus(200);
        $ajaxResponse->assertJsonStructure(['draw', 'recordsTotal', 'data']);
    }

    /**
     * Test admin can broadcast a multi-hazard early warning alert.
     */
    public function test_admin_can_broadcast_multi_hazard_warning(): void
    {
        $laporan = LaporanSampah::first();

        $response = $this->actingAs($this->adminUser)->post(route('admin.peringatan-dini.store'), [
            'laporan_id' => $laporan->id,
            'tipe_bahaya' => 'Wabah Penyakit & Sanitasi (DBD / Diare)',
            'level_peringatan' => 'AWAS',
            'radius_terdampak_meter' => 800,
            'pesan_broadcast' => 'Peringatan waspada demam berdarah di sekitar tumpukan sampah basah!',
        ]);

        $response->assertRedirect(route('admin.peringatan-dini.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('peringatan_dini', [
            'laporan_id' => $laporan->id,
            'tipe_bahaya' => 'Wabah Penyakit & Sanitasi (DBD / Diare)',
            'level_peringatan' => 'AWAS',
            'radius_terdampak_meter' => 800,
        ]);
    }

    /**
     * Test recycler pickups page and DataTables AJAX endpoint.
     */
    public function test_admin_penjemputan_page_and_ajax(): void
    {
        $pageResponse = $this->actingAs($this->adminUser)->get(route('admin.penjemputan.index'));
        $pageResponse->assertStatus(200);
        $pageResponse->assertSee('Penjemputan Sampah');

        $ajaxResponse = $this->actingAs($this->adminUser)->getJson(route('admin.penjemputan.index'), [
            'X-Requested-With' => 'XMLHttpRequest',
        ]);
        $ajaxResponse->assertStatus(200);
        $ajaxResponse->assertJsonStructure(['draw', 'recordsTotal', 'data']);
    }

    /**
     * Test rewards catalog page and DataTables AJAX endpoint.
     */
    public function test_admin_hadiah_page_and_ajax(): void
    {
        $pageResponse = $this->actingAs($this->adminUser)->get(route('admin.hadiah.index'));
        $pageResponse->assertStatus(200);
        $pageResponse->assertSee('Katalog Hadiah');

        $ajaxResponse = $this->actingAs($this->adminUser)->getJson(route('admin.hadiah.index'), [
            'X-Requested-With' => 'XMLHttpRequest',
        ]);
        $ajaxResponse->assertStatus(200);
        $ajaxResponse->assertJsonStructure(['draw', 'recordsTotal', 'data']);
    }

    /**
     * Test reward claims page and DataTables AJAX endpoint.
     */
    public function test_admin_penukaran_page_and_ajax(): void
    {
        $pageResponse = $this->actingAs($this->adminUser)->get(route('admin.penukaran.index'));
        $pageResponse->assertStatus(200);
        $pageResponse->assertSee('Klaim & Penukaran Hadiah');

        $ajaxResponse = $this->actingAs($this->adminUser)->getJson(route('admin.penukaran.index'), [
            'X-Requested-With' => 'XMLHttpRequest',
        ]);
        $ajaxResponse->assertStatus(200);
        $ajaxResponse->assertJsonStructure(['draw', 'recordsTotal', 'data']);
    }

    /**
     * Test points ledger page renders.
     */
    public function test_admin_riwayat_poin_page_renders(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('admin.riwayat-poin.index'));

        $response->assertStatus(200);
        $response->assertSee('Buku Besar');
    }

    /**
     * Test master data micro-tables page renders.
     */
    public function test_admin_master_data_page_renders(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('admin.master.index'));

        $response->assertStatus(200);
        $response->assertSee('Master Kategori');
        $response->assertSee('Kategori Sampah');
    }
}
