<?php

namespace Tests\Feature;

use App\Models\KategoriHadiah;
use App\Models\KategoriSampah;
use App\Models\MasterJenisSampah;
use App\Models\MasterTipeTanggapan;
use App\Models\StatusLaporan;
use App\Models\User;
use Database\Seeders\MicroTablesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterDataCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MicroTablesSeeder::class);

        $this->adminUser = User::factory()->create([
            'role' => 'admin',
        ]);
    }

    /**
     * Test admin can create a new Kategori Sampah.
     */
    public function test_admin_can_create_kategori_sampah(): void
    {
        $payload = [
            'nama' => 'Irigasi Pertanian',
            'slug' => 'irigasi-pertanian',
            'deskripsi' => 'Saluran irigasi sawah terhambat sampah.',
            'is_daur_ulang' => 1,
        ];

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.master.kategori-sampah.store'), $payload);

        $response->assertRedirect(route('admin.master.index'));
        $this->assertDatabaseHas('kategori_sampah', [
            'slug' => 'irigasi-pertanian',
            'is_daur_ulang' => true,
        ]);
    }

    /**
     * Test admin can update Kategori Sampah.
     */
    public function test_admin_can_update_kategori_sampah(): void
    {
        $kategori = KategoriSampah::first();

        $payload = [
            'nama' => 'Sungai & Kanal Diperbarui',
            'slug' => 'sungai-kanal-diperbarui',
            'deskripsi' => 'Deskripsi baru.',
            'is_daur_ulang' => 0,
        ];

        $response = $this->actingAs($this->adminUser)
            ->put(route('admin.master.kategori-sampah.update', $kategori->id), $payload);

        $response->assertRedirect(route('admin.master.index'));
        $this->assertDatabaseHas('kategori_sampah', [
            'id' => $kategori->id,
            'nama' => 'Sungai & Kanal Diperbarui',
        ]);
    }

    /**
     * Test admin can delete an unused Kategori Sampah.
     */
    public function test_admin_can_delete_unused_kategori_sampah(): void
    {
        $kategori = KategoriSampah::create([
            'nama' => 'Kategori Sementara',
            'slug' => 'kategori-sementara',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->delete(route('admin.master.kategori-sampah.destroy', $kategori->id));

        $response->assertRedirect(route('admin.master.index'));
        $this->assertDatabaseMissing('kategori_sampah', [
            'id' => $kategori->id,
        ]);
    }

    /**
     * Test admin can create and update Status Laporan.
     */
    public function test_admin_can_create_and_update_status_laporan(): void
    {
        // 1. Create
        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.master.status-laporan.store'), [
                'kode' => 'investigasi_dinas',
                'nama' => 'Investigasi Dinas',
                'badge_color' => 'warning',
                'urutan' => 8,
            ]);

        $response->assertRedirect(route('admin.master.index'));
        $this->assertDatabaseHas('status_laporan', ['kode' => 'investigasi_dinas']);

        $status = StatusLaporan::where('kode', 'investigasi_dinas')->first();

        // 2. Update
        $updateResponse = $this->actingAs($this->adminUser)
            ->put(route('admin.master.status-laporan.update', $status->id), [
                'kode' => 'investigasi_dinas',
                'nama' => 'Sedang Diinvestigasi',
                'badge_color' => 'info',
                'urutan' => 9,
            ]);

        $updateResponse->assertRedirect(route('admin.master.index'));
        $this->assertDatabaseHas('status_laporan', [
            'id' => $status->id,
            'nama' => 'Sedang Diinvestigasi',
            'badge_color' => 'info',
        ]);
    }

    /**
     * Test admin can create and update Master Jenis Sampah.
     */
    public function test_admin_can_create_and_update_jenis_sampah(): void
    {
        // 1. Create
        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.master.jenis-sampah.store'), [
                'nama' => 'Tembaga Murni',
                'nilai_ekonomi_per_kg' => 75000,
                'dapat_didaur_ulang' => 1,
            ]);

        $response->assertRedirect(route('admin.master.index'));
        $this->assertDatabaseHas('master_jenis_sampah', ['nama' => 'Tembaga Murni']);

        $jenis = MasterJenisSampah::where('nama', 'Tembaga Murni')->first();

        // 2. Update
        $updateResponse = $this->actingAs($this->adminUser)
            ->put(route('admin.master.jenis-sampah.update', $jenis->id), [
                'nama' => 'Tembaga Murni Super',
                'nilai_ekonomi_per_kg' => 80000,
                'dapat_didaur_ulang' => 1,
            ]);

        $updateResponse->assertRedirect(route('admin.master.index'));
        $this->assertDatabaseHas('master_jenis_sampah', [
            'id' => $jenis->id,
            'nilai_ekonomi_per_kg' => 80000,
        ]);
    }

    /**
     * Test admin can create and update Kategori Hadiah.
     */
    public function test_admin_can_create_and_update_kategori_hadiah(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.master.kategori-hadiah.store'), [
                'nama' => 'Donasi Pohon',
                'slug' => 'donasi-pohon',
                'icon' => 'bi-tree',
            ]);

        $response->assertRedirect(route('admin.master.index'));
        $this->assertDatabaseHas('kategori_hadiah', ['slug' => 'donasi-pohon']);

        $kat = KategoriHadiah::where('slug', 'donasi-pohon')->first();

        $updateResponse = $this->actingAs($this->adminUser)
            ->put(route('admin.master.kategori-hadiah.update', $kat->id), [
                'nama' => 'Donasi Penghijauan',
                'slug' => 'donasi-penghijauan',
                'icon' => 'bi-tree-fill',
            ]);

        $updateResponse->assertRedirect(route('admin.master.index'));
        $this->assertDatabaseHas('kategori_hadiah', ['slug' => 'donasi-penghijauan']);
    }

    /**
     * Test admin can create and update Master Tipe Tanggapan.
     */
    public function test_admin_can_create_and_update_tipe_tanggapan(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.master.tipe-tanggapan.store'), [
                'kode' => 'air_surut',
                'nama' => 'Air Sudah Surut',
                'icon' => 'bi-water',
                'deskripsi' => 'Genangan air telah surut.',
            ]);

        $response->assertRedirect(route('admin.master.index'));
        $this->assertDatabaseHas('master_tipe_tanggapan', ['kode' => 'air_surut']);

        $tipe = MasterTipeTanggapan::where('kode', 'air_surut')->first();

        $updateResponse = $this->actingAs($this->adminUser)
            ->put(route('admin.master.tipe-tanggapan.update', $tipe->id), [
                'kode' => 'air_surut',
                'nama' => 'Banjir / Air Telah Surut Normal',
                'icon' => 'bi-water',
                'deskripsi' => 'Deskripsi update.',
            ]);

        $updateResponse->assertRedirect(route('admin.master.index'));
        $this->assertDatabaseHas('master_tipe_tanggapan', [
            'id' => $tipe->id,
            'nama' => 'Banjir / Air Telah Surut Normal',
        ]);
    }
}
