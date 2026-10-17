<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\User\StoreUserRequest;
use App\Http\Requests\Api\V1\User\UpdateUserRequest;
use App\Http\Resources\V1\UserCollection;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends BaseApiController
{
    public function __construct(
        protected UserService $userService
    ) {}

    /**
     * Display a listing of users with pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $search = $request->input('search');

        $users = $this->userService->getPaginated($perPage, $search);

        return $this->sendPaginated(new UserCollection($users), 'Users retrieved successfully');
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        return $this->sendResponse(new UserResource($user), 'User created successfully', 201);
    }

    /**
     * Display the specified user.
     */
    public function show(int $id): JsonResponse
    {
        $user = $this->userService->findById($id);

        return $this->sendResponse(new UserResource($user), 'User retrieved successfully');
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = $this->userService->update($id, $request->validated());

        return $this->sendResponse(new UserResource($user), 'User updated successfully');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $this->userService->delete($id);

        return $this->sendResponse(null, 'User deleted successfully');
    }

    /**
     * Update user profile including photo, name, and phone.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|integer|exists:users,id',
            'name' => 'required|string|max:255',
            'no_telepon' => 'nullable|string|max:50',
            'foto_profil' => 'nullable|string',
        ]);

        $userId = $request->user()?->id ?? $validated['user_id'] ?? 30;
        $user = User::findOrFail($userId);

        $fotoUrl = $user->foto_profil;
        if (! empty($validated['foto_profil'])) {
            $fotoInput = $validated['foto_profil'];
            if (str_starts_with($fotoInput, 'data:image')) {
                if (preg_match('/^data:image\/(\w+);base64,/', $fotoInput, $type)) {
                    $imageBinary = substr($fotoInput, strpos($fotoInput, ',') + 1);
                    $imageBinary = base64_decode($imageBinary);
                    if ($imageBinary !== false) {
                        $extension = strtolower($type[1]);
                        if (! in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                            $extension = 'jpg';
                        }
                        $filename = 'avatars/user_'.$user->id.'_'.uniqid().'.'.$extension;
                        Storage::disk('public')->put($filename, $imageBinary);
                        $fotoUrl = url('storage/'.$filename);
                    }
                }
            } else {
                $fotoUrl = $fotoInput;
            }
        }

        $user->update([
            'name' => $validated['name'],
            'no_telepon' => $validated['no_telepon'] ?? $user->no_telepon,
            'foto_profil' => $fotoUrl,
        ]);

        return $this->sendResponse(new UserResource($user), 'Profil berhasil diperbarui');
    }
}
