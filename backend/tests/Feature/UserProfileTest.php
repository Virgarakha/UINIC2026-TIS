<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_update_profile_and_photo(): void
    {
        $pengepul = User::where('role', 'pengepul')->first();

        // 1x1 transparent png in base64
        $fakeBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        $response = $this->postJson('/api/v1/user/profile', [
            'user_id' => $pengepul->id,
            'name' => 'Pak Slamet Updated',
            'no_telepon' => '081234567890',
            'foto_profil' => $fakeBase64,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Pak Slamet Updated')
            ->assertJsonPath('data.no_telepon', '081234567890');

        $this->assertNotEmpty($response->json('data.foto_profil'));
        $this->assertNotEmpty($response->json('data.avatar_url'));

        // Check database
        $fresh = $pengepul->fresh();
        $this->assertEquals('Pak Slamet Updated', $fresh->name);
        $this->assertNotNull($fresh->foto_profil);
    }
}
