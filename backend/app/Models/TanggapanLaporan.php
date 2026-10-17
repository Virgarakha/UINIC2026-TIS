<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'laporan_id',
    'user_id',
    'tipe_tanggapan_id',
    'komentar',
    'foto_bukti_tambahan_url',
])]
class TanggapanLaporan extends Model
{
    use HasFactory;

    protected $table = 'tanggapan_laporan';

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
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return BelongsTo<MasterTipeTanggapan, $this>
     */
    public function tipeTanggapan(): BelongsTo
    {
        return $this->belongsTo(MasterTipeTanggapan::class, 'tipe_tanggapan_id');
    }
}
