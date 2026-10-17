<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'laporan_id',
    'estimasi_volume_m3',
    'estimasi_sumbatan_persen',
    'jenis_sampah_dominan_id',
    'tingkat_resiko_banjir',
    'potensi_bahaya',
    'ai_confidence_score',
    'raw_payload_json',
    'model_version',
    'analyzed_at',
])]
class AnalisisAi extends Model
{
    use HasFactory;

    protected $table = 'analisis_ai';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'estimasi_volume_m3' => 'float',
            'estimasi_sumbatan_persen' => 'integer',
            'ai_confidence_score' => 'float',
            'raw_payload_json' => 'array',
            'analyzed_at' => 'datetime',
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
     * @return BelongsTo<MasterJenisSampah, $this>
     */
    public function jenisSampahDominan(): BelongsTo
    {
        return $this->belongsTo(MasterJenisSampah::class, 'jenis_sampah_dominan_id');
    }

    /**
     * Cek apakah evaluasi AI lolos validasi anti-fraud (confidence score >= 70%).
     */
    public function isLolosAntiFraud(): bool
    {
        return $this->ai_confidence_score >= 0.70;
    }
}
