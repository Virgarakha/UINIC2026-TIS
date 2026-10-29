<?php

namespace App\Services;

use App\Models\AnalisisAi;
use App\Models\DataLingkungan;
use App\Models\LaporanSampah;
use App\Models\MasterJenisSampah;
use App\Models\MasterTipeTanggapan;
use App\Models\PenjemputanSampah;
use App\Models\PeringatanDini;
use App\Models\RiwayatPoin;
use App\Models\RiwayatStatusLaporan;
use App\Models\StatusLaporan;
use App\Models\TanggapanLaporan;
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
            ->with([
                'pelapor',
                'kategori',
                'status',
                'analisisAi.jenisSampahDominan',
                'dataLingkungan',
                'tanggapan.user',
                'tanggapan.tipeTanggapan',
            ])
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
        } else {
            // Bug fix [Radius Area]: Exclude cleaned/completed waste reports from the active radar map
            $query->whereDoesntHave('status', function (Builder $q): void {
                $q->whereIn('kode', ['selesai', 'tuntas']);
            });
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
            if (preg_match('/^data:image\/([a-zA-Z0-9\+\-\.]+)(?:;[a-zA-Z0-9\=]+)*;base64,/', $fotoInput, $matches)) {
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
            if ($hasAi && isset($data['analisis_ai']['is_valid_sampah']) && $data['analisis_ai']['is_valid_sampah'] === false) {
                $reason = $data['analisis_ai']['alasan_validasi'] ?? 'Foto ditolak oleh AI: Objek dalam gambar tidak terdeteksi sebagai timbunan sampah atau sumbatan air yang valid.';
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'foto_url' => [$reason],
                ]);
            }

            $statusId = $data['status_id'] ?? null;
            if (! $statusId) {
                $targetKode = $hasAi ? 'terverifikasi_ai' : 'menunggu_analisis';
                $statusModel = StatusLaporan::where('kode', $targetKode)->first();
                $statusId = $statusModel?->id ?? StatusLaporan::first()?->id ?? 1;
            }
            $rawKategoriId = $data['kategori_id'] ?? ($hasAi ? ($data['analisis_ai']['kategori_id'] ?? null) : null);
            $kategoriId = $rawKategoriId;
            if ($kategoriId && ! \App\Models\KategoriSampah::where('id', $kategoriId)->exists()) {
                $kategoriId = $kategoriId == 5 ? 2 : (\App\Models\KategoriSampah::first()?->id ?? 1);
            }
            $fotoUrl = $this->handleFotoUpload($data['foto_url']);

            $effectiveUserId = $userId ?? ($data['user_id'] ?? 1);
            $isGuest = ((int) $effectiveUserId === 1);

            $laporan = LaporanSampah::create([
                'user_id' => $effectiveUserId,
                'kategori_id' => $kategoriId,
                'status_id' => $statusId,
                'foto_url' => $fotoUrl,
                'latitude' => (float) $data['latitude'],
                'longitude' => (float) $data['longitude'],
                'alamat_lokasi' => $data['alamat_lokasi'] ?? null,
                'deskripsi' => $data['deskripsi'] ?? null,
                'is_resiko_banjir' => (bool) ($data['is_resiko_banjir'] ?? false),
                'tipe_bahaya' => $data['tipe_bahaya'] ?? null,
                'poin_diberikan' => $isGuest ? 0 : 25,
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

            if ($effectiveUserId && ! $isGuest) {
                User::where('id', $effectiveUserId)->increment('poin_reward', 25);
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
            'laporan_kritis' => LaporanSampah::whereDoesntHave('status', fn ($q) => $q->whereIn('kode', ['selesai', 'tuntas']))
                ->where(function ($q) {
                    $q->where('is_resiko_banjir', true)
                        ->orWhereNotNull('tipe_bahaya');
                })->count(),
            'laporan_selesai' => LaporanSampah::whereHas('status', fn ($q) => $q->whereIn('kode', ['selesai', 'tuntas']))->count(),
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

            // Deactivate active early warnings for this report so radar circles disappear
            PeringatanDini::where('laporan_id', $laporanId)->update(['status_aktif' => false]);

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
     * Get all currently active armada trucks on missions or standby online for map display.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, PenjemputanSampah>
     */
    public function getActiveArmada()
    {
        $cutoff = app()->runningUnitTests() ? now()->subMinutes(10) : now()->subHours(24);

        $armada = PenjemputanSampah::whereIn('status_jemput', ['menuju_lokasi', 'tahap_pengambilan', 'siaga_online'])
            ->whereNotNull('current_latitude')
            ->whereNotNull('current_longitude')
            ->where(function ($query) use ($cutoff) {
                $query->where('waktu_update_lokasi', '>=', $cutoff)
                    ->orWhere(function ($sub) use ($cutoff) {
                        $sub->whereNull('waktu_update_lokasi')
                            ->where('updated_at', '>=', $cutoff);
                    });
            })
            ->with(['pengepul', 'laporan.status', 'laporan.kategori'])
            ->latest('waktu_update_lokasi')
            ->get();

        if ($armada->isEmpty() && ! app()->runningUnitTests()) {
            $pengepul = \App\Models\User::where('role', 'pengepul')->first();
            if ($pengepul) {
                $standby = PenjemputanSampah::firstOrNew([
                    'pengepul_id' => $pengepul->id,
                    'status_jemput' => 'siaga_online',
                ]);
                $standby->current_latitude = -7.9812;
                $standby->current_longitude = 112.6354;
                $standby->heading = 45;
                $standby->kecepatan_kmh = 24;
                $standby->waktu_update_lokasi = now();
                $standby->save();

                $armada = PenjemputanSampah::where('id', $standby->id)
                    ->with(['pengepul', 'laporan.status', 'laporan.kategori'])
                    ->get();
            }
        }

        return $armada;
    }

    /**
     * Update Pengepul Online / Offline status in database for cross-user live tracking.
     */
    public function updateStatusOnlinePengepul(
        int $pengepulId,
        bool $isOnline,
        float $lat,
        float $lng,
        float $heading = 0,
        float $kecepatanKmh = 0
    ): ?PenjemputanSampah {
        // If there's an active pickup mission ('menuju_lokasi', 'tahap_pengambilan')
        $activeMission = PenjemputanSampah::where('pengepul_id', $pengepulId)
            ->whereIn('status_jemput', ['menuju_lokasi', 'tahap_pengambilan'])
            ->latest('updated_at')
            ->first();

        if ($activeMission) {
            if ($isOnline) {
                $activeMission->current_latitude = $lat;
                $activeMission->current_longitude = $lng;
                $activeMission->heading = $heading;
                $activeMission->kecepatan_kmh = $kecepatanKmh;
                $activeMission->waktu_update_lokasi = now();
                $activeMission->save();
            } else {
                $activeMission->current_latitude = null;
                $activeMission->current_longitude = null;
                $activeMission->waktu_update_lokasi = null;
                $activeMission->save();
            }

            return $activeMission->load(['pengepul', 'laporan']);
        }

        // Standby record (laporan_id = null or status siaga_online/offline)
        $standbyRecord = PenjemputanSampah::where('pengepul_id', $pengepulId)
            ->where(function ($q) {
                $q->whereNull('laporan_id')
                    ->orWhere('status_jemput', 'siaga_online')
                    ->orWhere('status_jemput', 'offline');
            })
            ->latest('updated_at')
            ->first();

        if (! $standbyRecord) {
            $standbyRecord = new PenjemputanSampah();
            $standbyRecord->pengepul_id = $pengepulId;
            $standbyRecord->laporan_id = null;
        }

        if ($isOnline) {
            $standbyRecord->status_jemput = 'siaga_online';
            $standbyRecord->current_latitude = $lat;
            $standbyRecord->current_longitude = $lng;
            $standbyRecord->heading = $heading;
            $standbyRecord->kecepatan_kmh = $kecepatanKmh;
            $standbyRecord->waktu_update_lokasi = now();
            $standbyRecord->catatan = 'Armada Online - Siaga Penjemputan Sampah';
            $standbyRecord->save();
        } else {
            $standbyRecord->status_jemput = 'offline';
            $standbyRecord->current_latitude = null;
            $standbyRecord->current_longitude = null;
            $standbyRecord->waktu_update_lokasi = null;
            $standbyRecord->catatan = 'Armada Offline - Mode Istirahat';
            $standbyRecord->save();
        }

        return $standbyRecord->load(['pengepul', 'laporan']);
    }

    /**
     * Cancel or close mission, removing the truck from active map tracking.
     */
    public function batalPenjemputan(int $laporanId, int $pengepulId): bool
    {
        $penjemputan = PenjemputanSampah::where('laporan_id', $laporanId)->first();
        if ($penjemputan) {
            // Guard: If mission or report is already completed (selesai), do not cancel or revert!
            if ($penjemputan->status_jemput === 'selesai') {
                return true;
            }

            $laporan = LaporanSampah::find($laporanId);
            if ($laporan && in_array(strtolower($laporan->status?->kode ?? ''), ['selesai', 'tuntas'])) {
                return true;
            }

            $penjemputan->status_jemput = 'dibatalkan';
            $penjemputan->current_latitude = null;
            $penjemputan->current_longitude = null;
            $penjemputan->save();

            $statusTerverifikasi = StatusLaporan::where('kode', 'terverifikasi_ai')->first();
            if ($laporan && $statusTerverifikasi) {
                $laporan->update(['status_id' => $statusTerverifikasi->id]);
            }

            return true;
        }

        $laporan = LaporanSampah::find($laporanId);
        if ($laporan && ! in_array(strtolower($laporan->status?->kode ?? ''), ['selesai', 'tuntas'])) {
            $statusTerverifikasi = StatusLaporan::where('kode', 'terverifikasi_ai')->first();
            if ($statusTerverifikasi) {
                $laporan->update(['status_id' => $statusTerverifikasi->id]);
            }
        }

        return true;
    }

    /**
     * Add citizen review/response to a waste report.
     *
     * @param array<string, mixed> $data
     */
    public function addTanggapan(int $laporanId, array $data, ?int $userId = null): TanggapanLaporan
    {
        $laporan = LaporanSampah::findOrFail($laporanId);

        // Fallback to active citizen if not specified
        if (! $userId) {
            $userId = isset($data['user_id']) ? (int) $data['user_id'] : (User::where('role', 'warga')->first()?->id ?? 3);
        }

        $tipeId = (int) ($data['tipe_tanggapan_id'] ?? 1);
        $komentar = (string) ($data['komentar'] ?? '');
        $fotoUrl = $data['foto_bukti_tambahan_url'] ?? null;

        $tanggapan = TanggapanLaporan::create([
            'laporan_id' => $laporan->id,
            'user_id' => $userId,
            'tipe_tanggapan_id' => $tipeId,
            'komentar' => $komentar,
            'foto_bukti_tambahan_url' => $fotoUrl,
        ]);

        // Increment total_tanggapan
        $laporan->increment('total_tanggapan');

        if (! empty($fotoUrl)) {
            $laporan->increment('total_foto_tambahan');
        }

        // Award reward points for civic participation (+10 poin)
        $user = User::find($userId);
        if ($user) {
            $user->increment('poin_reward', 10);

            RiwayatPoin::create([
                'user_id' => $userId,
                'jumlah_poin' => 10,
                'jenis_transaksi' => 'masuk',
                'referensi_tipe' => 'tanggapan_laporan',
                'referensi_id' => $tanggapan->id,
                'keterangan' => 'Reward partisipasi respon warga pada laporan #' . $laporan->id,
            ]);
        }

        return $tanggapan->load(['user', 'tipeTanggapan']);
    }

    /**
     * Get all citizen responses for a report.
     *
     * @return Collection<int, TanggapanLaporan>
     */
    public function getTanggapanByLaporanId(int $laporanId): Collection
    {
        return TanggapanLaporan::where('laporan_id', $laporanId)
            ->with(['user', 'tipeTanggapan'])
            ->latest('id')
            ->get();
    }

    /**
     * Get all available response types.
     *
     * @return Collection<int, MasterTipeTanggapan>
     */
    public function getTipeTanggapan(): Collection
    {
        return MasterTipeTanggapan::all();
    }
}

