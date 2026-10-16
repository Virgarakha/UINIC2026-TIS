<?php

namespace App\Http\Controllers\Admin;

use App\DataTables\UserDataTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\User\StoreUserRequest;
use App\Http\Requests\Admin\User\UpdateUserRequest;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService
    ) {}

    /**
     * Display a listing of users using Yajra DataTables.
     */
    public function index(UserDataTable $dataTable): mixed
    {
        return $dataTable->render('admin.users.index');
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse|JsonResponse
    {
        $user = $this->userService->create($request->validated());

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'User created successfully.',
                'data' => $user,
            ], 201);
        }

        return redirect()
            ->route('admin.users.index')
            ->with('success', "User '{$user->name}' was created successfully.");
    }

    /**
     * Get user details for edit modal.
     */
    public function edit(int $id): JsonResponse
    {
        $user = $this->userService->findById($id);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, int $id): RedirectResponse|JsonResponse
    {
        $user = $this->userService->update($id, $request->validated());

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'User updated successfully.',
                'data' => $user,
            ]);
        }

        return redirect()
            ->route('admin.users.index')
            ->with('success', "User '{$user->name}' was updated successfully.");
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(int $id, Request $request): RedirectResponse|JsonResponse
    {
        $this->userService->delete($id);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully.',
            ]);
        }

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }
}
