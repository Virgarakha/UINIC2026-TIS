<?php

namespace App\Services;

use App\Models\AnalisisAi;
use App\Models\DataLingkungan;
use App\Models\LaporanSampah;
use App\Models\MasterJenisSampah;
use App\Models\PenjemputanSampah;
use App\Models\RiwayatPoin;
use App\Models\RiwayatStatusLaporan;
use App\Models\StatusLaporan;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class LaporanSampahService extends BaseService
{
    /**
     * Get base query for waste reports with relations.
     *
     * @return Builder<LaporanSampah>
     */
    public function getQuery(): Builder
    {
        return LaporanSampah::query()
            ->with(['pelapor', 'kategori', 'status', 'analisisAi.jenisSampahDominan', 'dataLingkungan'])
            ->latest('id');
    }

    /**
     * Get all reports for map display without pagination.
     *
     * @return Collection<int, LaporanSampah>
     */
    public function getAllForMap(?string $search = null, ?int $statusId = null, ?bool $kritisOnly = null): Collection
    {
        $query = $this->getQuery();

        if (! empty($search)) {
            $query->where(function (Builder $q) use ($search): void {
                $q->where('alamat_lokasi', 'ilike', "%{$search}%")
                    ->orWhere('deskripsi', 'ilike', "%{$search}%");
            });
        }

        if ($statusId !== null) {
            $query->where('status_id', $statusId);
        }

        if ($kritisOnly === true) {
            $query->where(function (Builder $q): void {
                $q->where('is_resiko_banjir', true)
                    ->orWhereNotNull('tipe_bahaya');
            });
        }

        return $query->get();
    }

    /**
     * Get paginated list of reports with optional search and filters.
     */
    public function getPaginated(int $perPage = 15, ?string $search = null, ?int $statusId = null, ?bool $kritisOnly = null): LengthAwarePaginator
    {
        $query = $this->getQuery();

        if (! empty($search)) {
            $query->where(function (Builder $q) use ($search): void {
                $q->where('alamat_lokasi', 'ilike', "%{$search}%")
                    ->orWhere('deskripsi', 'ilike', "%{$search}%");
            });
        }

        if ($statusId !== null) {
            $query->where('status_id', $statusId);
        }

        if ($kritisOnly === true) {
            $query->where(function (Builder $q): void {
                $q->where('is_resiko_banjir', true)
                    ->orWhereNotNull('tipe_bahaya');
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Find a report by ID or fail.
     */
    public function findById(int $id): LaporanSampah
    {
        return LaporanSampah::with([
            'pelapor',
            'kategori',
            'status',
            'analisisAi.jenisSampahDominan',
            'tanggapan.user',
            'tanggapan.tipeTanggapan',
            'dataLingkungan',
            'penjemputan.pengepul',
            'peringatanDini',
            'riwayatStatus.statusLama',
            'riwayatStatus.statusBaru',
            'riwayatStatus.diubahOleh',
        ])->findOrFail($id);
    }

    /**
     * Update report status and record audit log.
     */
    public function updateStatus(LaporanSampah|int $laporan, int $newStatusId, ?string $catatan = null, ?int $userId = null): LaporanSampah
    {
        return $this->transactional(function () use ($laporan, $newStatusId, $catatan, $userId): LaporanSampah {
            $model = $laporan instanceof LaporanSampah ? $laporan : LaporanSampah::findOrFail($laporan);
            $oldStatusId = $model->status_id;

            $model->update(['status_id' => $newStatusId]);

            RiwayatStatusLaporan::create([
                'laporan_id' => $model->id,
                'status_lama_id' => $oldStatusId,
                'status_baru_id' => $newStatusId,
                'diubah_oleh_id' => $userId,
                'catatan' => $catatan ?? 'Status laporan diperbarui oleh admin.',
            ]);

            $this->logInfo('Laporan status updated', [
                'laporan_id' => $model->id,
                'old_status' => $oldStatusId,
                'new_status' => $newStatusId,
            ]);

            return $model->fresh(['status', 'pelapor', 'kategori']);
        });
    }

    /**
     * Process photo input: decode and store base64 images to public disk, or preserve valid URLs.
     */
    public function handleFotoUpload(string $fotoInput): string
    {
        if (str_starts_with($fotoInput, 'data:image')) {
            if (preg_match('/^data:image\/(\w+);base64,/', $fotoInput, $matches)) {
                $extension = strtolower($matches[1]);
                if ($extension === 'jpeg') {
                    $extension = 'jpg';
                }
                $base64Data = substr($fotoInput, strpos($fotoInput, ',') + 1);
                $decoded = base64_decode($base64Data);
                if ($decoded !== false) {
                    $fileName = 'laporan/'.uniqid('sampah_', true).'.'.$extension;
                    Storage::disk('public')->put($fileName, $decoded);

                    return url(Storage::url($fileName));
                }
            }
        }

        return $fotoInput;
    }

    /**
     * Create a new waste report along with its AI analysis and environmental data.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?int $userId = null): LaporanSampah
    {
        return $this->transactional(function () use ($data, $userId): LaporanSampah {
            $hasAi = ! empty($data['analisis_ai']);
            $statusId = $data['status_id'] ?? null;
            if (! $statusId) {
                $targetKode = $hasAi ? 'terverifikasi_ai' : 'menunggu_analisis';
                $statusModel = StatusLaporan::where('kode', $targetKode)->first();
                $statusId = $statusModel?->id ?? StatusLaporan::first()?->id ?? 1;
            }
            $kategoriId = $data['kategori_id'] ?? null;
            $fotoUrl = $this->handleFotoUpload($data['foto_url']);

            $laporan = LaporanSampah::create([
                'user_id' => $userId ?? $data['user_id'] ?? null,
                'kategori_id' => $kategoriId,
                'status_id' => $statusId,
                'foto_url' => $fotoUrl,
                'latitude' => (float) $data['latitude'],
                'longitude' => (float) $data['longitude'],
                'alamat_lokasi' => $data['alamat_lokasi'] ?? null,
                'deskripsi' => $data['deskripsi'] ?? null,
                'is_resiko_banjir' => (bool) ($data['is_resiko_banjir'] ?? false),
                'tipe_bahaya' => $data['tipe_bahaya'] ?? null,
                'poin_diberikan' => $userId ? 25 : 0,
                'total_tanggapan' => 0,
                'total_foto_tambahan' => 0,
            ]);

            if ($hasAi) {
                $ai = $data['analisis_ai'];
                if (! empty($data['metadata_forensik'])) {
                    $ai['metadata_forensik'] = $data['metadata_forensik'];
                }
                $confidence = (float) ($ai['confidence_score'] ?? 0.85);
                if ($confidence > 1.0) {
                    $confidence = $confidence / 100.0;
                }

                $jenisDominanId = null;
                if (! empty($ai['jenis_sampah_dominan'])) {
                    $jenisName = is_string($ai['jenis_sampah_dominan']) ? $ai['jenis_sampah_dominan'] : '';
                    if ($jenisName) {
                        $matched = MasterJenisSampah::where('nama', 'ilike', "%{$jenisName}%")->first();
                        if (! $matched) {
                            if (stripos($jenisName, 'plastik') !== false || stripos($jenisName, 'botol') !== false) {
                                $matched = MasterJenisSampah::where('nama', 'ilike', '%plastik%')->first();
                            } elseif (stripos($jenisName, 'kardus') !== false || stripos($jenisName, 'kertas') !== false) {
                                $matched = MasterJenisSampah::where('nama', 'ilike', '%kardus%')->first();
                            } elseif (stripos($jenisName, 'logam') !== false || stripos($jenisName, 'besi') !== false) {
                                $matched = MasterJenisSampah::where('nama', 'ilike', '%logam%')->first();
                            } elseif (stripos($jenisName, 'organik') !== false) {
                                $matched = MasterJenisSampah::where('nama', 'ilike', '%organik%')->first();
                            }
                        }
                        $jenisDominanId = $matched?->id;
                    }
                }

                $risk = strtoupper($ai['prediksi_banjir'] ?? $ai['tingkat_resiko_banjir'] ?? 'RENDAH');
                if (! in_array($risk, ['RENDAH', 'SEDANG', 'TINGGI', 'KRITIS'])) {
                    $risk = 'SEDANG';
                }

                AnalisisAi::create([
                    'laporan_id' => $laporan->id,
                    'estimasi_volume_m3' => (float) ($ai['volume_sampah_m3'] ?? $ai['estimasi_volume_m3'] ?? 0),
                    'estimasi_sumbatan_persen' => (int) ($ai['persentase_sumbatan_aliran'] ?? $ai['estimasi_sumbatan_persen'] ?? 0),
                    'jenis_sampah_dominan_id' => $jenisDominanId,
                    'tingkat_resiko_banjir' => $risk,
                    'potensi_bahaya' => $ai['potensi_bahaya'] ?? $data['tipe_bahaya'] ?? null,
                    'ai_confidence_score' => $confidence,
                    'raw_payload_json' => $ai,
                    'model_version' => 'gemini-3.1-flash-lite',
                    'analyzed_at' => now(),
                ]);
            }

            $weather = $data['weather'] ?? $data['data_lingkungan'] ?? null;
            if (! empty($weather)) {
                DataLingkungan::create([
                    'laporan_id' => $laporan->id,
                    'intensitas_hujan_mm' => (float) ($weather['precipitation'] ?? $weather['rain'] ?? $weather['intensitas_hujan_mm'] ?? 0),
                    'ketinggian_air_cm' => (float) ($weather['ketinggian_air_cm'] ?? 0),
                    'kecepatan_arus_m_s' => (float) (($weather['windSpeed'] ?? 0) / 10),
                    'prakiraan_cuaca' => $weather['weatherDescription'] ?? $weather['description'] ?? $weather['prakiraan_cuaca'] ?? 'Cerah Berawan',
                    'sumber_data' => 'OPEN_METEO',
                    'recorded_at' => now(),
                ]);
            }

            if ($userId) {
                User::where('id', $userId)->increment('poin_reward', 25);
            }

            $this->logInfo('Laporan sampah created successfully', [
                'laporan_id' => $laporan->id,
                'user_id' => $userId,
            ]);

            return $laporan->fresh(['pelapor', 'kategori', 'status', 'analisisAi.jenisSampahDominan', 'dataLingkungan']);
        });
    }

    /**
     * Get aggregate statistics for dashboard.
     *
     * @return array<string, int>
     */
    public function getDashboardStats(): array
    {
        return [
            'total_laporan' => LaporanSampah::count(),
            'laporan_kritis' => LaporanSampah::where('is_resiko_banjir', true)->orWhereNotNull('tipe_bahaya')->count(),
            'laporan_selesai' => LaporanSampah::whereHas('status', fn ($q) => $q->where('kode', 'selesai'))->count(),
            'menunggu_analisis' => LaporanSampah::whereHas('status', fn ($q) => $q->where('kode', 'menunggu_analisis'))->count(),
            'siap_pengepul' => LaporanSampah::whereHas('status', fn ($q) => $q->where('kode', 'siap_diambil_pengepul'))->count(),
        ];
    }

    /**
     * Start pickup mission by collector (Pengepul).
     */
    public function mulaiPenjemputan(int $laporanId, int $pengepulId, ?string $catatan = null): PenjemputanSampah
    {
        return $this->transactional(function () use ($laporanId, $pengepulId, $catatan): PenjemputanSampah {
            $laporan = LaporanSampah::findOrFail($laporanId);

            // Update status laporan to 'sedang_ditangani' (id: 5)
            $statusSedang = StatusLaporan::where('kode', 'sedang_ditangani')->first();
            if ($statusSedang) {
                $oldStatusId = $laporan->status_id;
                $laporan->update(['status_id' => $statusSedang->id]);

                RiwayatStatusLaporan::create([
                    'laporan_id' => $laporan->id,
                    'status_lama_id' => $oldStatusId,
                    'status_baru_id' => $statusSedang->id,
                    'diubah_oleh_id' => $pengepulId,
                    'catatan' => $catatan ?? 'Misi penjemputan dimulai oleh mitra pengepul (OTW ke lokasi).',
                ]);
            }

            // Create or update penjemputan record
            $penjemputan = PenjemputanSampah::firstOrNew([
                'laporan_id' => $laporanId,
            ]);

            $penjemputan->pengepul_id = $pengepulId;
            $penjemputan->status_jemput = 'menuju_lokasi';
            $penjemputan->waktu_klaim = now();
            $penjemputan->catatan = $catatan ?? 'Pengepul sedang dalam perjalanan (OTW) menuju lokasi.';
            $penjemputan->save();

            return $penjemputan->load(['laporan.status', 'pengepul']);
        });
    }

    /**
     * Complete pickup mission after clean photo verification and reward allocation.
     *
     * @return array<string, mixed>
     */
    public function selesaiPenjemputan(
        int $laporanId,
        int $pengepulId,
        string $fotoBersih,
        ?float $timbanganRiilKg = null,
        int $rewardPoin = 50,
        ?string $catatan = null
    ): array {
        return $this->transactional(function () use (
            $laporanId,
            $pengepulId,
            $fotoBersih,
            $timbanganRiilKg,
            $rewardPoin,
            $catatan
        ): array {
            $laporan = LaporanSampah::findOrFail($laporanId);
            $cleanPhotoUrl = $this->handleFotoUpload($fotoBersih);

            // Update status laporan to 'selesai' (id: 6)
            $statusSelesai = StatusLaporan::where('kode', 'selesai')->first();
            if ($statusSelesai) {
                $oldStatusId = $laporan->status_id;
                $laporan->update(['status_id' => $statusSelesai->id]);

                RiwayatStatusLaporan::create([
                    'laporan_id' => $laporan->id,
                    'status_lama_id' => $oldStatusId,
                    'status_baru_id' => $statusSelesai->id,
                    'diubah_oleh_id' => $pengepulId,
                    'catatan' => $catatan ?? 'Pembersihan selesai dan terverifikasi AI.',
                ]);
            }

            // Update penjemputan record
            $penjemputan = PenjemputanSampah::firstOrNew([
                'laporan_id' => $laporanId,
            ]);

            $penjemputan->pengepul_id = $pengepulId;
            $penjemputan->status_jemput = 'selesai';
            $penjemputan->foto_bukti_bersih_url = $cleanPhotoUrl;
            $penjemputan->timbangan_riil_kg = $timbanganRiilKg;
            $penjemputan->waktu_selesai = now();
            $penjemputan->catatan = $catatan;
            $penjemputan->save();

            // Increment points for pengepul
            $user = User::findOrFail($pengepulId);
            $user->increment('poin_reward', $rewardPoin);

            // Record points history
            RiwayatPoin::create([
                'user_id' => $pengepulId,
                'jumlah_poin' => $rewardPoin,
                'jenis_transaksi' => 'masuk',
                'referensi_tipe' => 'penjemputan_sampah',
                'referensi_id' => $penjemputan->id,
                'keterangan' => 'Reward penjemputan sampah #' . $laporanId,
            ]);

            return [
                'penjemputan' => $penjemputan->fresh(['laporan.status', 'pengepul']),
                'laporan' => $laporan->fresh(['status', 'pelapor', 'kategori', 'analisisAi']),
                'pengepul' => $user->fresh(),
                'reward_poin' => $rewardPoin,
            ];
        });
    }

    /**
     * Update real-time GPS / route tracking coordinates of collector truck.
     */
    public function updateLokasiArmada(
        int $laporanId,
        int $pengepulId,
        float $latitude,
        float $longitude,
        float $heading = 0,
        float $kecepatanKmh = 0,
        ?string $statusJemput = null
    ): PenjemputanSampah {
        $penjemputan = PenjemputanSampah::firstOrNew([
            'laporan_id' => $laporanId,
        ]);

        $penjemputan->pengepul_id = $pengepulId;
        if ($statusJemput && in_array($statusJemput, ['menuju_lokasi', 'tahap_pengambilan', 'selesai', 'dibatalkan', 'otw'])) {
            $penjemputan->status_jemput = ($statusJemput === 'otw') ? 'menuju_lokasi' : $statusJemput;
        } elseif (! $penjemputan->exists || ! $penjemputan->status_jemput) {
            $penjemputan->status_jemput = 'menuju_lokasi';
        }

        $penjemputan->current_latitude = $latitude;
        $penjemputan->current_longitude = $longitude;
        $penjemputan->heading = $heading;
        $penjemputan->kecepatan_kmh = $kecepatanKmh;
        $penjemputan->waktu_update_lokasi = now();
        $penjemputan->save();

        return $penjemputan->load(['pengepul', 'laporan']);
    }

    /**
     * Get all currently active armada trucks on missions for map display.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, PenjemputanSampah>
     */
    public function getActiveArmada()
    {
        return PenjemputanSampah::whereIn('status_jemput', ['menuju_lokasi', 'tahap_pengambilan'])
            ->whereNotNull('current_latitude')
            ->whereNotNull('current_longitude')
            ->with(['pengepul', 'laporan.status', 'laporan.kategori'])
            ->latest('waktu_update_lokasi')
            ->get();
    }

    /**
     * Cancel or close mission, removing the truck from active map tracking.
     */
    public function batalPenjemputan(int $laporanId, int $pengepulId): bool
    {
        $penjemputan = PenjemputanSampah::where('laporan_id', $laporanId)->first();
        if ($penjemputan) {
            $penjemputan->status_jemput = 'dibatalkan';
            $penjemputan->current_latitude = null;
            $penjemputan->current_longitude = null;
            $penjemputan->save();

            $laporan = LaporanSampah::find($laporanId);
            $statusTerverifikasi = StatusLaporan::where('kode', 'terverifikasi_ai')->first();
            if ($laporan && $statusTerverifikasi) {
                $laporan->update(['status_id' => $statusTerverifikasi->id]);
            }

            return true;
        }

        return false;
    }
}

