<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'label_alamat',
    'nama_penerima',
    'no_telepon',
    'alamat_lengkap',
    'kota',
    'kode_pos',
    'is_utama',
])]
class AlamatPengguna extends Model
{
    use HasFactory;

    protected $table = 'alamat_pengguna';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_utama' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<PenukaranHadiah, $this>
     */
    public function penukaranHadiah(): HasMany
    {
        return $this->hasMany(PenukaranHadiah::class, 'alamat_id');
    }
}
