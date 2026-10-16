<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can register via API endpoint.
     */
    public function test_user_can_register_via_api(): void
    {
        $payload = [
            'name' => 'API New User',
            'email' => 'apinew@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'device_name' => 'test-device',
        ];

        $response = $this->postJson(route('auth.register'), $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'message' => 'User registered successfully',
        ]);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'user' => ['id', 'name', 'email'],
                'token',
                'token_type',
            ],
        ]);
        $this->assertDatabaseHas('users', ['email' => 'apinew@example.com']);
    }

    /**
     * Test user can log in and receive token.
     */
    public function test_user_can_login_via_api(): void
    {
        $user = User::factory()->create([
            'email' => 'apilogin@example.com',
            'password' => 'secretpassword',
        ]);

        $response = $this->postJson(route('auth.login'), [
            'email' => 'apilogin@example.com',
            'password' => 'secretpassword',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Login successful',
        ]);
        $response->assertJsonStructure([
            'data' => [
                'user',
                'token',
            ],
        ]);
    }

    /**
     * Test user cannot log in with invalid credentials.
     */
    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'valid@example.com',
            'password' => 'correct-pass',
        ]);

        $response = $this->postJson(route('auth.login'), [
            'email' => 'valid@example.com',
            'password' => 'wrong-pass',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'message' => 'Invalid email or password credentials',
        ]);
    }

    /**
     * Test authenticated user can access profile.
     */
    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson(route('auth.me'));

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Test authenticated user can logout and revoke token.
     */
    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-logout-token');

        $response = $this->withHeader('Authorization', 'Bearer '.$token->plainTextToken)
            ->postJson(route('auth.logout'));

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Successfully logged out',
        ]);
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token->accessToken->id,
        ]);
    }
}
