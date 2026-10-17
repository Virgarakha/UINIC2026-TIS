<?php

namespace Tests\Feature;

use App\Models\LaporanSampah;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArmadaTrackingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_update_and_fetch_active_armada(): void
    {
        $pengepul = User::where('role', 'pengepul')->first();
        $laporan = LaporanSampah::first();

        // 1. Update truck location (OTW)
        $updateRes = $this->postJson('/api/v1/penjemputan/lokasi', [
            'laporan_id' => $laporan->id,
            'pengepul_id' => $pengepul->id,
            'latitude' => -7.9521000,
            'longitude' => 112.6145000,
            'heading' => 195.5,
            'kecepatan_kmh' => 35.0,
            'status_jemput' => 'menuju_lokasi',
        ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('success', true);

        // 2. Fetch active armada
        $getRes = $this->getJson('/api/v1/penjemputan/armada-aktif');
        $getRes->assertStatus(200)
            ->assertJsonPath('success', true);

        $activeTrucks = $getRes->json('data');
        $this->assertNotEmpty($activeTrucks);
        $this->assertEquals($laporan->id, $activeTrucks[0]['laporan_id']);
        $this->assertEquals(-7.9521, $activeTrucks[0]['latitude']);

        // 3. Cancel/Close mission
        $cancelRes = $this->postJson('/api/v1/penjemputan/batal', [
            'laporan_id' => $laporan->id,
            'pengepul_id' => $pengepul->id,
        ]);
        $cancelRes->assertStatus(200);

        // Verify truck is no longer active
        $getResAfter = $this->getJson('/api/v1/penjemputan/armada-aktif');
        $this->assertEmpty($getResAfter->json('data'));
    }

    public function test_idle_armada_older_than_10_minutes_is_excluded(): void
    {
        $pengepul = User::where('role', 'pengepul')->first();
        $laporan = LaporanSampah::first();

        // 1. Truck with location updated 15 minutes ago (idle > 10 mins)
        $this->postJson('/api/v1/penjemputan/lokasi', [
            'laporan_id' => $laporan->id,
            'pengepul_id' => $pengepul->id,
            'latitude' => -7.9521000,
            'longitude' => 112.6145000,
            'heading' => 180.0,
            'kecepatan_kmh' => 0.0,
            'status_jemput' => 'menuju_lokasi',
        ]);

        $penjemputan = \App\Models\PenjemputanSampah::where('laporan_id', $laporan->id)->first();
        $penjemputan->waktu_update_lokasi = now()->subMinutes(15);
        $penjemputan->save();

        // Should NOT appear because it is idle > 10 minutes
        $res = $this->getJson('/api/v1/penjemputan/armada-aktif');
        $this->assertEmpty($res->json('data'));

        // 2. Now update location with fresh timestamp (active within 5 minutes)
        $penjemputan->waktu_update_lokasi = now()->subMinutes(5);
        $penjemputan->save();

        // Should appear because it was active within 10 minutes
        $resActive = $this->getJson('/api/v1/penjemputan/armada-aktif');
        $this->assertNotEmpty($resActive->json('data'));
        $this->assertEquals($laporan->id, $resActive->json('data.0.laporan_id'));
    }
}
