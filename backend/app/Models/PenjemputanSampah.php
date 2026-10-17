<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'laporan_id',
    'pengepul_id',
    'status_jemput',
    'current_latitude',
    'current_longitude',
    'heading',
    'kecepatan_kmh',
    'waktu_update_lokasi',
    'timbangan_riil_kg',
    'foto_bukti_bersih_url',
    'waktu_klaim',
    'waktu_selesai',
    'catatan',
])]
class PenjemputanSampah extends Model
{
    use HasFactory;

    protected $table = 'penjemputan_sampah';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'current_latitude' => 'float',
            'current_longitude' => 'float',
            'heading' => 'float',
            'kecepatan_kmh' => 'float',
            'waktu_update_lokasi' => 'datetime',
            'timbangan_riil_kg' => 'float',
            'waktu_klaim' => 'datetime',
            'waktu_selesai' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<LaporanSampah, $this>
     */
    public function laporan(): BelongsTo
    {
        return $this->belongsTo(LaporanSampah::class, 'laporan_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function pengepul(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pengepul_id');
    }
}
