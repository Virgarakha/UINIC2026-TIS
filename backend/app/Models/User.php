<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role', 'no_telepon', 'foto_profil', 'poin_reward'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'poin_reward' => 'integer',
        ];
    }

    /**
     * @return HasMany<LaporanSampah, $this>
     */
    public function laporan(): HasMany
    {
        return $this->hasMany(LaporanSampah::class, 'user_id');
    }

    /**
     * @return HasMany<TanggapanLaporan, $this>
     */
    public function tanggapan(): HasMany
    {
        return $this->hasMany(TanggapanLaporan::class, 'user_id');
    }

    /**
     * @return HasMany<AlamatPengguna, $this>
     */
    public function alamat(): HasMany
    {
        return $this->hasMany(AlamatPengguna::class, 'user_id');
    }

    /**
     * @return HasMany<PenukaranHadiah, $this>
     */
    public function penukaranHadiah(): HasMany
    {
        return $this->hasMany(PenukaranHadiah::class, 'user_id');
    }

    /**
     * @return HasMany<RiwayatPoin, $this>
     */
    public function riwayatPoin(): HasMany
    {
        return $this->hasMany(RiwayatPoin::class, 'user_id');
    }

    /**
     * @return HasMany<PenjemputanSampah, $this>
     */
    public function penjemputan(): HasMany
    {
        return $this->hasMany(PenjemputanSampah::class, 'pengepul_id');
    }

    public function isWarga(): bool
    {
        return $this->role === 'warga';
    }

    public function isPengepul(): bool
    {
        return $this->role === 'pengepul';
    }

    public function isDinas(): bool
    {
        return $this->role === 'dinas';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
