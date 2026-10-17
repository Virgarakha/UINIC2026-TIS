<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nama', 'nilai_ekonomi_per_kg', 'dapat_didaur_ulang'])]
class MasterJenisSampah extends Model
{
    use HasFactory;

    protected $table = 'master_jenis_sampah';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'nilai_ekonomi_per_kg' => 'float',
            'dapat_didaur_ulang' => 'boolean',
        ];
    }

    /**
     * @return HasMany<AnalisisAi, $this>
     */
    public function analisisAi(): HasMany
    {
        return $this->hasMany(AnalisisAi::class, 'jenis_sampah_dominan_id');
    }
}
