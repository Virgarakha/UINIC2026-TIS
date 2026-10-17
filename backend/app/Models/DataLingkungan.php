<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'laporan_id',
    'intensitas_hujan_mm',
    'ketinggian_air_cm',
    'kecepatan_arus_m_s',
    'prakiraan_cuaca',
    'sumber_data',
    'recorded_at',
])]
class DataLingkungan extends Model
{
    use HasFactory;

    protected $table = 'data_lingkungan';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'intensitas_hujan_mm' => 'float',
            'ketinggian_air_cm' => 'float',
            'kecepatan_arus_m_s' => 'float',
            'recorded_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<LaporanSampah, $this>
     */
    public function laporan(): BelongsTo
    {
        return $this->belongsTo(LaporanSampah::class, 'laporan_id');
    }
}
