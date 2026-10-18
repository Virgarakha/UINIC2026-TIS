<?php

namespace App\Http\Resources\V1;

use App\Models\LaporanSampah;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin LaporanSampah
 */
class LaporanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $ai = $this->analisisAi;
        $aiData = null;

        if ($ai) {
            $raw = $ai->raw_payload_json ?? [];
            $conf = (float) $ai->ai_confidence_score;
            if ($conf <= 1.0 && $conf > 0) {
                $conf = round($conf * 100, 1);
            }

            $aiData = [
                'id' => $ai->id,
                'laporan_id' => $ai->laporan_id,
                'volume_sampah_m3' => (float) $ai->estimasi_volume_m3,
                'persentase_sumbatan_aliran' => (int) $ai->estimasi_sumbatan_persen,
                'estimasi_berat_kg' => (float) ($raw['estimasi_berat_kg'] ?? ($ai->estimasi_volume_m3 * 75)),
                'potensi_bahaya' => $ai->potensi_bahaya ?? $this->tipe_bahaya ?? 'Banjir & Luapan Air',
                'prediksi_banjir' => $ai->tingkat_resiko_banjir ?? 'RENDAH',
                'confidence_score' => $conf,
                'rekomendasi_tindakan' => $raw['rekomendasi_tindakan'] ?? 'Segera jadwalkan pengangkutan dan pembersihan aliran air.',
                'jenis_sampah_dominan_id' => $ai->jenis_sampah_dominan_id,
                'jenis_sampah_dominan' => $ai->jenisSampahDominan?->nama ?? $raw['jenis_sampah_dominan'] ?? 'Plastik & Residu',
                'nilai_ekonomi_estimasi' => (int) ($raw['nilai_ekonomi_estimasi'] ?? 125000),
                'model_version' => $ai->model_version,
                'analyzed_at' => $ai->analyzed_at?->toISOString(),
                'metadata_forensik' => $raw['metadata_forensik'] ?? null,
                'is_geotag_verified' => (bool) ($raw['metadata_forensik']['is_geotag_verified'] ?? false),
            ];
        }

        $metaForensik = $aiData['metadata_forensik'] ?? null;

        return [
            'id' => $this->id,
            'pelapor_id' => $this->user_id,
            'pelapor' => $this->pelapor ? [
                'id' => $this->pelapor->id,
                'name' => $this->pelapor->name,
                'email' => $this->pelapor->email,
                'role' => $this->pelapor->role ?? 'warga',
                'poin' => (int) ($this->pelapor->poin ?? 0),
            ] : null,
            'kategori_id' => $this->kategori_id,
            'kategori' => $this->kategori ? [
                'id' => $this->kategori->id,
                'nama' => $this->kategori->nama,
                'slug' => $this->kategori->slug,
                'deskripsi' => $this->kategori->deskripsi,
                'is_daur_ulang' => (bool) $this->kategori->is_daur_ulang,
            ] : null,
            'status_id' => $this->status_id,
            'status' => $this->status ? [
                'id' => $this->status->id,
                'kode' => $this->status->kode,
                'nama' => $this->status->nama,
                'badge_color' => $this->status->badge_color,
                'urutan' => (int) $this->status->urutan,
            ] : null,
            'foto_url' => $this->foto_url,
            'deskripsi' => $this->deskripsi ?? '',
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'alamat_lokasi' => $this->alamat_lokasi ?? '',
            'is_resiko_banjir' => (bool) $this->is_resiko_banjir,
            'tipe_bahaya' => $this->tipe_bahaya,
            'is_dispatched' => (bool) (
                $this->status?->kode === 'siap_diambil_pengepul' ||
                $this->penjemputan()->whereIn('status_jemput', ['menuju_lokasi', 'tahap_pengambilan', 'siaga_online'])->exists()
            ),
            'is_geotag_verified' => (bool) ($metaForensik['is_geotag_verified'] ?? false),
            'metadata_forensik' => $metaForensik,
            'poin_diberikan' => (int) $this->poin_diberikan,
            'total_tanggapan' => (int) $this->total_tanggapan,
            'total_foto_tambahan' => (int) $this->total_foto_tambahan,
            'analisis_ai' => $aiData,
            'data_lingkungan' => $this->dataLingkungan,
            'tanggapan' => $this->relationLoaded('tanggapan') ? $this->tanggapan->map(function ($t) {
                return [
                    'id' => $t->id,
                    'laporan_id' => $t->laporan_id,
                    'user_id' => $t->user_id,
                    'user' => $t->user ? [
                        'id' => $t->user->id,
                        'name' => $t->user->name,
                        'email' => $t->user->email,
                        'role' => $t->user->role,
                        'poin' => (int) ($t->user->poin_reward ?? $t->user->poin ?? 0),
                        'foto_profil' => $t->user->foto_profil ?? $t->user->avatar_url ?? null,
                    ] : null,
                    'tipe_tanggapan_id' => $t->tipe_tanggapan_id,
                    'tipe_tanggapan' => $t->tipeTanggapan ? [
                        'id' => $t->tipeTanggapan->id,
                        'nama' => $t->tipeTanggapan->nama,
                        'kode' => $t->tipeTanggapan->kode,
                        'icon' => $t->tipeTanggapan->icon,
                        'deskripsi' => $t->tipeTanggapan->deskripsi,
                    ] : null,
                    'komentar' => $t->komentar,
                    'foto_bukti_url' => $t->foto_bukti_tambahan_url,
                    'created_at' => $t->created_at?->toISOString(),
                ];
            }) : [],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
