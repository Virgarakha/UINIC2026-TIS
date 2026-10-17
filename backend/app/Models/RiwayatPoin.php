<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'jumlah_poin',
    'jenis_transaksi',
    'referensi_tipe',
    'referensi_id',
    'keterangan',
])]
class RiwayatPoin extends Model
{
    use HasFactory;

    protected $table = 'riwayat_poin';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'jumlah_poin' => 'integer',
            'referensi_id' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
