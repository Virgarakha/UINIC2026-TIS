<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'kategori_id',
    'nama_hadiah',
    'deskripsi',
    'poin_dibutuhkan',
    'stok',
    'foto_hadiah_url',
    'is_aktif',
])]
class KatalogHadiah extends Model
{
    use HasFactory;

    protected $table = 'katalog_hadiah';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'poin_dibutuhkan' => 'integer',
            'stok' => 'integer',
            'is_aktif' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<KategoriHadiah, $this>
     */
    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriHadiah::class, 'kategori_id');
    }

    /**
     * @return HasMany<PenukaranHadiah, $this>
     */
    public function penukaran(): HasMany
    {
        return $this->hasMany(PenukaranHadiah::class, 'hadiah_id');
    }

    /**
     * Scope query untuk hadiah yang aktif dan memiliki stok.
     *
     * @param  Builder<KatalogHadiah>  $query
     */
    public function scopeTersedia(Builder $query): void
    {
        $query->where('is_aktif', true)->where('stok', '>', 0);
    }
}
