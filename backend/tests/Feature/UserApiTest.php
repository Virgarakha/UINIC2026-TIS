<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test unauthenticated request cannot access API resources.
     */
    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson(route('users.index'));

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'message' => 'Unauthenticated.',
        ]);
    }

    /**
     * Test listing users with pagination via API.
     */
    public function test_authenticated_user_can_list_users(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        User::factory()->count(5)->create();

        $response = $this->getJson(route('users.index'));

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonStructure([
            'success',
            'message',
            'data',
            'meta' => [
                'current_page',
                'per_page',
                'total',
            ],
            'links',
        ]);
    }

    /**
     * Test creating a user via API.
     */
    public function test_user_can_be_created_via_api(): void
    {
        $admin = User::factory()->create();
        Sanctum::actingAs($admin);

        $payload = [
            'name' => 'Alice Wonderland',
            'email' => 'alice@example.com',
            'password' => 'alicepass123',
            'password_confirmation' => 'alicepass123',
        ];

        $response = $this->postJson(route('users.store'), $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'data' => [
                'name' => 'Alice Wonderland',
                'email' => 'alice@example.com',
            ],
        ]);
        $this->assertDatabaseHas('users', ['email' => 'alice@example.com']);
    }

    /**
     * Test showing a specific user via API.
     */
    public function test_user_can_be_retrieved_via_api(): void
    {
        $admin = User::factory()->create();
        Sanctum::actingAs($admin);

        $target = User::factory()->create();

        $response = $this->getJson(route('users.show', $target));

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'id' => $target->id,
                'email' => $target->email,
            ],
        ]);
    }

    /**
     * Test updating a user via API.
     */
    public function test_user_can_be_updated_via_api(): void
    {
        $admin = User::factory()->create();
        Sanctum::actingAs($admin);

        $target = User::factory()->create(['name' => 'Old Name']);

        $response = $this->putJson(route('users.update', $target), [
            'name' => 'Brand New Name',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'name' => 'Brand New Name',
            ],
        ]);
        $this->assertDatabaseHas('users', [
            'id' => $target->id,
            'name' => 'Brand New Name',
        ]);
    }

    /**
     * Test deleting a user via API.
     */
    public function test_user_can_be_deleted_via_api(): void
    {
        $admin = User::factory()->create();
        Sanctum::actingAs($admin);

        $target = User::factory()->create();

        $response = $this->deleteJson(route('users.destroy', $target));

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }

    /**
     * Test validation failure returns standard 422 JSON format.
     */
    public function test_validation_errors_return_standard_422_json(): void
    {
        $admin = User::factory()->create();
        Sanctum::actingAs($admin);

        $response = $this->postJson(route('users.store'), []);

        $response->assertStatus(422);
        $response->assertJsonStructure([
            'success',
            'message',
            'errors' => [
                'name',
                'email',
                'password',
            ],
        ]);
    }

    /**
     * Test non-existent model returns standard 404 JSON format.
     */
    public function test_not_found_returns_standard_404_json(): void
    {
        $admin = User::factory()->create();
        Sanctum::actingAs($admin);

        $response = $this->getJson(route('users.show', 999999));

        $response->assertStatus(404);
        $response->assertJson([
            'success' => false,
            'message' => 'Resource not found.',
        ]);
    }
}
