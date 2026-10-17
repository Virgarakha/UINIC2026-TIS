<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'user_id',
    'kategori_id',
    'status_id',
    'foto_url',
    'latitude',
    'longitude',
    'alamat_lokasi',
    'deskripsi',
    'is_resiko_banjir',
    'tipe_bahaya',
    'poin_diberikan',
    'total_tanggapan',
    'total_foto_tambahan',
])]
class LaporanSampah extends Model
{
    use HasFactory;

    protected $table = 'laporan_sampah';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'is_resiko_banjir' => 'boolean',
            'poin_diberikan' => 'integer',
            'total_tanggapan' => 'integer',
            'total_foto_tambahan' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function pelapor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return BelongsTo<KategoriSampah, $this>
     */
    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriSampah::class, 'kategori_id');
    }

    /**
     * @return BelongsTo<StatusLaporan, $this>
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(StatusLaporan::class, 'status_id');
    }

    /**
     * @return HasOne<AnalisisAi, $this>
     */
    public function analisisAi(): HasOne
    {
        return $this->hasOne(AnalisisAi::class, 'laporan_id');
    }

    /**
     * @return HasMany<TanggapanLaporan, $this>
     */
    public function tanggapan(): HasMany
    {
        return $this->hasMany(TanggapanLaporan::class, 'laporan_id');
    }

    /**
     * @return HasMany<DataLingkungan, $this>
     */
    public function dataLingkungan(): HasMany
    {
        return $this->hasMany(DataLingkungan::class, 'laporan_id');
    }

    /**
     * @return HasMany<PenjemputanSampah, $this>
     */
    public function penjemputan(): HasMany
    {
        return $this->hasMany(PenjemputanSampah::class, 'laporan_id');
    }

    /**
     * @return HasMany<PeringatanDini, $this>
     */
    public function peringatanDini(): HasMany
    {
        return $this->hasMany(PeringatanDini::class, 'laporan_id');
    }

    /**
     * @return HasMany<RiwayatStatusLaporan, $this>
     */
    public function riwayatStatus(): HasMany
    {
        return $this->hasMany(RiwayatStatusLaporan::class, 'laporan_id');
    }

    /**
     * Scope query untuk laporan berisiko banjir kritis.
     *
     * @param  Builder<LaporanSampah>  $query
     */
    public function scopeKritis(Builder $query): void
    {
        $query->where('is_resiko_banjir', true);
    }

    /**
     * Scope query untuk laporan bernilai ekonomi yang siap dijemput pengepul.
     *
     * @param  Builder<LaporanSampah>  $query
     */
    public function scopeSiapPengepul(Builder $query): void
    {
        $query->whereHas('status', fn ($q) => $q->where('kode', 'siap_diambil_pengepul'));
    }
}
