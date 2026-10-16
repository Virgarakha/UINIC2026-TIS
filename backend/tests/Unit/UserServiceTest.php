<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    protected UserService $userService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->userService = app(UserService::class);
    }

    /**
     * Test creating a user via UserService hashes password properly.
     */
    public function test_service_can_create_user_with_hashed_password(): void
    {
        $user = $this->userService->create([
            'name' => 'Service User',
            'email' => 'service@example.com',
            'password' => 'plaintextpassword',
        ]);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('Service User', $user->name);
        $this->assertEquals('service@example.com', $user->email);
        $this->assertTrue(Hash::check('plaintextpassword', $user->password));
        $this->assertDatabaseHas('users', ['email' => 'service@example.com']);
    }

    /**
     * Test updating a user via UserService.
     */
    public function test_service_can_update_user(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'email' => 'original@example.com',
        ]);

        $updated = $this->userService->update($user, [
            'name' => 'Updated Name',
        ]);

        $this->assertEquals('Updated Name', $updated->name);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }

    /**
     * Test deleting a user revokes tokens.
     */
    public function test_service_can_delete_user_and_revoke_tokens(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token');

        $result = $this->userService->delete($user);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $token->accessToken->id]);
    }

    /**
     * Test dashboard stats calculation.
     */
    public function test_service_calculates_dashboard_stats(): void
    {
        User::factory()->count(3)->create(['email_verified_at' => now()]);
        User::factory()->count(2)->create(['email_verified_at' => null]);

        $stats = $this->userService->getDashboardStats();

        $this->assertEquals(5, $stats['total_users']);
        $this->assertEquals(3, $stats['verified_users']);
        $this->assertEquals(2, $stats['unverified_users']);
    }
}
