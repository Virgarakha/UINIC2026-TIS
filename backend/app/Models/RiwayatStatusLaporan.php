<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'laporan_id',
    'status_lama_id',
    'status_baru_id',
    'diubah_oleh_id',
    'catatan',
])]
class RiwayatStatusLaporan extends Model
{
    use HasFactory;

    protected $table = 'riwayat_status_laporan';

    /**
     * @return BelongsTo<LaporanSampah, $this>
     */
    public function laporan(): BelongsTo
    {
        return $this->belongsTo(LaporanSampah::class, 'laporan_id');
    }

    /**
     * @return BelongsTo<StatusLaporan, $this>
     */
    public function statusLama(): BelongsTo
    {
        return $this->belongsTo(StatusLaporan::class, 'status_lama_id');
    }

    /**
     * @return BelongsTo<StatusLaporan, $this>
     */
    public function statusBaru(): BelongsTo
    {
        return $this->belongsTo(StatusLaporan::class, 'status_baru_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function diubahOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diubah_oleh_id');
    }
}
