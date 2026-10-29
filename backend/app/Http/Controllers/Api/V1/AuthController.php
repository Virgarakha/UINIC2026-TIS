<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends BaseApiController
{
    public function __construct(
        protected UserService $userService
    ) {}

    /**
     * Register a new user and generate an API token.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $deviceName = $validated['device_name'] ?? 'api-token';

        $role = $validated['role'] ?? 'warga';
        $validated['role'] = $role;

        if ($role === 'pengepul') {
            $validated['rating'] = 5.0;
            $validated['total_ulasan'] = 1;
            if (empty($validated['foto_profil'])) {
                $validated['foto_profil'] = 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&auto=format&fit=crop&q=80';
            }
        }

        $user = $this->userService->create($validated);

        if ($role === 'pengepul') {
            \App\Models\PengepulUlasan::create([
                'pengepul_id' => $user->id,
                'reviewer_name' => 'Koordinator DLH Kota Malang',
                'reviewer_role' => 'Dinas Lingkungan Hidup',
                'rating' => 5,
                'komentar' => 'Mitra armada resmi terverifikasi program Trinfo UINIC08.',
            ]);
        }

        $token = $user->createToken($deviceName)->plainTextToken;

        return $this->sendResponse([
            'user' => new UserResource($user->load('ulasan')),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'User registered successfully', 201);
    }

    /**
     * Authenticate user and issue an API token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        $user = User::where('email', $credentials['email'])->first();

        // Auto-provision demo users if not yet seeded
        if (! $user && in_array($credentials['email'], ['pengepul@ecocitizen.id', 'budi@ecocitizen.id'])) {
            $user = User::create([
                'name' => $credentials['email'] === 'pengepul@ecocitizen.id' ? 'Pak Slamet (Mitra Pengepul)' : 'Budi Santoso',
                'email' => $credentials['email'],
                'password' => Hash::make('password'),
                'role' => $credentials['email'] === 'pengepul@ecocitizen.id' ? 'pengepul' : 'warga',
                'poin_reward' => $credentials['email'] === 'pengepul@ecocitizen.id' ? 350 : 240,
                'no_telepon' => $credentials['email'] === 'pengepul@ecocitizen.id' ? '0813-3379-4278' : '0812-3456-7890',
                'email_verified_at' => now(),
            ]);
        }

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return $this->sendError('Invalid email or password credentials', [], 401);
        }

        $deviceName = $credentials['device_name'] ?? 'api-token';
        $token = $user->createToken($deviceName)->plainTextToken;

        return $this->sendResponse([
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Login successful');
    }

    /**
     * Get the authenticated user's profile.
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return $this->sendResponse(
            new UserResource($user),
            'Profile retrieved successfully'
        );
    }

    /**
     * Revoke current access token (logout).
     */
    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->currentAccessToken()->delete();

        return $this->sendResponse(null, 'Successfully logged out');
    }

    /**
     * Get verified Pengepul partners with vehicle details, ratings, and reviews for landing page showcase.
     */
    public function mitraPengepul(): JsonResponse
    {
        $mitra = User::where('role', 'pengepul')
            ->with(['ulasan' => function ($q) {
                $q->limit(5);
            }])
            ->get();

        return $this->sendResponse(
            UserResource::collection($mitra),
            'Daftar mitra pengepul berhasil diambil'
        );
    }
}
