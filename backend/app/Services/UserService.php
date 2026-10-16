<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserService extends BaseService
{
    /**
     * Get base query for users.
     *
     * @return Builder<User>
     */
    public function getQuery(): Builder
    {
        return User::query()->latest('id');
    }

    /**
     * Get paginated list of users with optional keyword search.
     */
    public function getPaginated(int $perPage = 15, ?string $search = null): LengthAwarePaginator
    {
        $query = $this->getQuery();

        if (! empty($search)) {
            $query->where(function (Builder $q) use ($search): void {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Find a user by ID or fail.
     */
    public function findById(int $id): User
    {
        return User::findOrFail($id);
    }

    /**
     * Create a new user.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): User
    {
        return $this->transactional(function () use ($data): User {
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            $user = User::create($data);
            $this->logInfo('User created successfully', ['user_id' => $user->id]);

            return $user;
        });
    }

    /**
     * Update an existing user.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(User|int $user, array $data): User
    {
        return $this->transactional(function () use ($user, $data): User {
            $model = $user instanceof User ? $user : $this->findById($user);

            if (! empty($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }

            $model->update($data);
            $this->logInfo('User updated successfully', ['user_id' => $model->id]);

            return $model->fresh();
        });
    }

    /**
     * Delete a user.
     */
    public function delete(User|int $user): bool
    {
        return $this->transactional(function () use ($user): bool {
            $model = $user instanceof User ? $user : $this->findById($user);
            $userId = $model->id;

            // Revoke all Sanctum tokens
            $model->tokens()->delete();

            $deleted = (bool) $model->delete();
            $this->logInfo('User deleted successfully', ['user_id' => $userId]);

            return $deleted;
        });
    }

    /**
     * Get aggregate statistics for dashboard.
     *
     * @return array<string, int>
     */
    public function getDashboardStats(): array
    {
        return [
            'total_users' => User::count(),
            'verified_users' => User::whereNotNull('email_verified_at')->count(),
            'unverified_users' => User::whereNull('email_verified_at')->count(),
            'new_users_today' => User::whereDate('created_at', today())->count(),
        ];
    }
}
