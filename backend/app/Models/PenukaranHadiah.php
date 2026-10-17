<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'hadiah_id',
    'alamat_id',
    'poin_digunakan',
    'status_pengiriman',
    'no_resi',
    'alamat_pengiriman_snapshot',
])]
class PenukaranHadiah extends Model
{
    use HasFactory;

    protected $table = 'penukaran_hadiah';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'poin_digunakan' => 'integer',
            'alamat_pengiriman_snapshot' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return BelongsTo<KatalogHadiah, $this>
     */
    public function hadiah(): BelongsTo
    {
        return $this->belongsTo(KatalogHadiah::class, 'hadiah_id');
    }

    /**
     * @return BelongsTo<AlamatPengguna, $this>
     */
    public function alamat(): BelongsTo
    {
        return $this->belongsTo(AlamatPengguna::class, 'alamat_id');
    }
}
