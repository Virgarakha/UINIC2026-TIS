<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['kode', 'nama', 'badge_color', 'urutan'])]
class StatusLaporan extends Model
{
    use HasFactory;

    protected $table = 'status_laporan';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'urutan' => 'integer',
        ];
    }

    /**
     * @return HasMany<LaporanSampah, $this>
     */
    public function laporan(): HasMany
    {
        return $this->hasMany(LaporanSampah::class, 'status_id');
    }
}
