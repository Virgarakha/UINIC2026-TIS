<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'laporan_id',
    'level_peringatan',
    'tipe_bahaya',
    'radius_terdampak_meter',
    'pesan_broadcast',
    'status_aktif',
    'waktu_broadcast',
    'waktu_kedaluwarsa',
])]
class PeringatanDini extends Model
{
    use HasFactory;

    protected $table = 'peringatan_dini';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'radius_terdampak_meter' => 'integer',
            'status_aktif' => 'boolean',
            'waktu_broadcast' => 'datetime',
            'waktu_kedaluwarsa' => 'datetime',
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
     * Scope query untuk peringatan dini yang masih aktif.
     *
     * @param  Builder<PeringatanDini>  $query
     */
    public function scopeAktif(Builder $query): void
    {
        $query->where('status_aktif', true)
            ->where(function (Builder $q): void {
                $q->whereNull('waktu_kedaluwarsa')
                    ->orWhere('waktu_kedaluwarsa', '>', now());
            });
    }
}
