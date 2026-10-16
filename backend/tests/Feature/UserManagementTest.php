<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test admin user management page renders successfully.
     */
    public function test_user_index_page_can_be_rendered(): void
    {
        User::factory()->create();

        $response = $this->get(route('admin.users.index'));

        $response->assertStatus(200);
        $response->assertViewIs('admin.users.index');
        $response->assertSee('User Management');
    }

    /**
     * Test Yajra DataTables AJAX request returns proper JSON payload.
     */
    public function test_user_datatable_ajax_returns_json_records(): void
    {
        User::factory()->count(3)->create();

        $response = $this->getJson(route('admin.users.index'), [
            'X-Requested-With' => 'XMLHttpRequest',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'draw',
            'recordsTotal',
            'recordsFiltered',
            'data',
        ]);
    }

    /**
     * Test admin can create user via form.
     */
    public function test_admin_can_create_user_via_form(): void
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'johndoe@example.com',
            'password' => 'secret12345',
            'password_confirmation' => 'secret12345',
        ];

        $response = $this->post(route('admin.users.store'), $userData);

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseHas('users', [
            'name' => 'John Doe',
            'email' => 'johndoe@example.com',
        ]);
    }

    /**
     * Test admin can update user via AJAX.
     */
    public function test_admin_can_update_user_via_ajax(): void
    {
        $user = User::factory()->create();

        $updateData = [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
        ];

        $response = $this->putJson(route('admin.users.update', $user), $updateData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
        ]);
    }

    /**
     * Test admin can delete user via AJAX.
     */
    public function test_admin_can_delete_user_via_ajax(): void
    {
        $user = User::factory()->create();

        $response = $this->deleteJson(route('admin.users.destroy', $user));

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $this->assertDatabaseMissing('users', [
            'id' => $user->id,
        ]);
    }

    /**
     * Test admin can create user via AJAX.
     */
    public function test_admin_can_create_user_via_ajax(): void
    {
        $userData = [
            'name' => 'Jane Doe',
            'email' => 'janedoe@example.com',
            'password' => 'secret12345',
            'password_confirmation' => 'secret12345',
        ];

        $response = $this->postJson(route('admin.users.store'), $userData);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'message' => 'User created successfully.',
            'data' => [
                'name' => 'Jane Doe',
                'email' => 'janedoe@example.com',
            ],
        ]);

        $this->assertDatabaseHas('users', [
            'name' => 'Jane Doe',
            'email' => 'janedoe@example.com',
        ]);
    }

    /**
     * Test admin can fetch user edit details via AJAX.
     */
    public function test_admin_can_fetch_user_edit_details_via_ajax(): void
    {
        $user = User::factory()->create();

        $response = $this->getJson(route('admin.users.edit', $user));

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Test user datatable can filter by paid status.
     */
    public function test_user_datatable_can_filter_by_paid_status(): void
    {
        User::factory()->create(['email_verified_at' => now()]);
        User::factory()->create(['email_verified_at' => null]);

        $response = $this->getJson(route('admin.users.index', [
            'draw' => 1,
            'columns' => [
                ['data' => 'name', 'name' => 'name', 'searchable' => 'true', 'orderable' => 'true', 'search' => ['value' => '', 'regex' => 'false']],
                ['data' => 'email', 'name' => 'email', 'searchable' => 'true', 'orderable' => 'true', 'search' => ['value' => '', 'regex' => 'false']],
                ['data' => 'created_at', 'name' => 'created_at', 'searchable' => 'true', 'orderable' => 'true', 'search' => ['value' => '', 'regex' => 'false']],
                ['data' => 'email_verified_at', 'name' => 'email_verified_at', 'searchable' => 'true', 'orderable' => 'true', 'search' => ['value' => 'Paid', 'regex' => 'false']],
            ],
            'start' => 0,
            'length' => 10,
            'search' => ['value' => '', 'regex' => 'false'],
        ]), [
            'X-Requested-With' => 'XMLHttpRequest',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('recordsTotal', 2);
        $response->assertJsonPath('recordsFiltered', 1);
    }

    /**
     * Test user datatable can filter by pending status.
     */
    public function test_user_datatable_can_filter_by_pending_status(): void
    {
        User::factory()->create(['email_verified_at' => now()]);
        User::factory()->create(['email_verified_at' => null]);

        $response = $this->getJson(route('admin.users.index', [
            'draw' => 1,
            'columns' => [
                ['data' => 'name', 'name' => 'name', 'searchable' => 'true', 'orderable' => 'true', 'search' => ['value' => '', 'regex' => 'false']],
                ['data' => 'email', 'name' => 'email', 'searchable' => 'true', 'orderable' => 'true', 'search' => ['value' => '', 'regex' => 'false']],
                ['data' => 'created_at', 'name' => 'created_at', 'searchable' => 'true', 'orderable' => 'true', 'search' => ['value' => '', 'regex' => 'false']],
                ['data' => 'email_verified_at', 'name' => 'email_verified_at', 'searchable' => 'true', 'orderable' => 'true', 'search' => ['value' => 'Pending', 'regex' => 'false']],
            ],
            'start' => 0,
            'length' => 10,
            'search' => ['value' => '', 'regex' => 'false'],
        ]), [
            'X-Requested-With' => 'XMLHttpRequest',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('recordsTotal', 2);
        $response->assertJsonPath('recordsFiltered', 1);
    }
}
