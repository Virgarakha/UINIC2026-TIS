<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nama', 'slug', 'deskripsi', 'is_daur_ulang'])]
class KategoriSampah extends Model
{
    use HasFactory;

    protected $table = 'kategori_sampah';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_daur_ulang' => 'boolean',
        ];
    }

    /**
     * @return HasMany<LaporanSampah, $this>
     */
    public function laporan(): HasMany
    {
        return $this->hasMany(LaporanSampah::class, 'kategori_id');
    }
}
