<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['kode', 'nama', 'icon', 'deskripsi'])]
class MasterTipeTanggapan extends Model
{
    use HasFactory;

    protected $table = 'master_tipe_tanggapan';

    /**
     * @return HasMany<TanggapanLaporan, $this>
     */
    public function tanggapan(): HasMany
    {
        return $this->hasMany(TanggapanLaporan::class, 'tipe_tanggapan_id');
    }
}
