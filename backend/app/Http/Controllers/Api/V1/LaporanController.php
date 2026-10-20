<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\Laporan\StoreLaporanRequest;
use App\Http\Resources\V1\LaporanCollection;
use App\Http\Resources\V1\LaporanResource;
use App\Models\KatalogHadiah;
use App\Models\KategoriSampah;
use App\Models\LaporanSampah;
use App\Models\PenukaranHadiah;
use App\Models\PeringatanDini;
use App\Models\RiwayatPoin;
use App\Models\User;
use App\Services\LaporanSampahService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class LaporanController extends BaseApiController
{
    public function __construct(
        protected LaporanSampahService $laporanService
    ) {}

    /**
     * Display a listing of reports (paginated or all for map).
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->input('search');
        $statusId = $request->has('status_id') ? (int) $request->input('status_id') : null;
        $kritisOnly = $request->has('kritis_only') ? $request->boolean('kritis_only') : null;

        // If 'all' parameter is requested (e.g. for Google Maps interactive plot)
        if ($request->boolean('all')) {
            $reports = $this->laporanService->getAllForMap($search, $statusId, $kritisOnly);

            return $this->sendResponse(LaporanResource::collection($reports), 'Semua titik laporan berhasil diambil');
        }

        $perPage = (int) $request->input('per_page', 15);
        $reports = $this->laporanService->getPaginated($perPage, $search, $statusId, $kritisOnly);

        return $this->sendPaginated(new LaporanCollection($reports), 'Daftar laporan berhasil diambil');
    }

    /**
     * Store a newly created report into database.
     */
    public function store(StoreLaporanRequest $request): JsonResponse
    {
        $userId = $request->user()?->id ?? ($request->input('user_id') ? (int) $request->input('user_id') : null);
        if (! $userId) {
            $defaultCitizen = \App\Models\User::where('role', 'warga')->first();
            $userId = $defaultCitizen?->id ?? 3;
        }
        $laporan = $this->laporanService->create($request->validated(), $userId);

        return $this->sendResponse(new LaporanResource($laporan), 'Laporan dan analisis AI berhasil disimpan ke database', 201);
    }

    /**
     * Display the specified report by ID.
     */
    public function show(int $id): JsonResponse
    {
        $laporan = $this->laporanService->findById($id);

        return $this->sendResponse(new LaporanResource($laporan), 'Detail laporan berhasil diambil');
    }

    /**
     * Get list of waste categories.
     */
    public function kategori(): JsonResponse
    {
        $categories = KategoriSampah::all();

        return $this->sendResponse($categories, 'Daftar kategori sampah berhasil diambil');
    }

    /**
     * Get list of active early warnings.
     */
    public function peringatanDini(): JsonResponse
    {
        $warnings = PeringatanDini::where('status_aktif', true)
            ->whereDoesntHave('laporan.status', function ($q) {
                $q->whereIn('kode', ['selesai', 'tuntas']);
            })
            ->with(['laporan.status', 'laporan.kategori'])
            ->latest()
            ->get();

        return $this->sendResponse($warnings, 'Daftar peringatan dini aktif berhasil diambil');
    }

    /**
     * Get list of rewards catalog.
     */
    public function katalogHadiah(): JsonResponse
    {
        $hadiah = KatalogHadiah::where('is_aktif', true)->with('kategori')->get();

        return $this->sendResponse($hadiah, 'Daftar katalog hadiah berhasil diambil');
    }

    /**
     * Redeem a reward voucher from points.
     */
    public function tukarHadiah(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hadiah_id' => 'required|integer|exists:katalog_hadiah,id',
            'user_id' => 'nullable|integer|exists:users,id',
            'alamat_pengiriman' => 'nullable|array',
        ]);

        $hadiah = KatalogHadiah::with('kategori')->findOrFail($validated['hadiah_id']);

        $userId = $request->user()?->id ?? $validated['user_id'] ?? 2;
        $user = User::find($userId);
        if (! $user) {
            $user = User::firstOrCreate(
                ['email' => 'budi@ecocitizen.id'],
                [
                    'name' => 'Budi Santoso',
                    'password' => Hash::make('password'),
                    'role' => 'warga',
                    'poin_reward' => 240,
                    'no_telepon' => '0812-3456-789',
                ]
            );
        }

        if ($user->id === 1 || $user->email === 'warga.tamu@ecocitizen.id') {
            return $this->sendError('Pengguna tanpa login tidak dapat menukarkan poin atau mengklaim reward. Silakan masuk akun terlebih dahulu.', [], 403);
        }

        $userPoints = (int) ($user->poin_reward ?? 0);
        if ($userPoints < $hadiah->poin_dibutuhkan) {
            return $this->sendError('Saldo poin Anda tidak mencukupi untuk menukar hadiah ini', [
                'current_points' => $userPoints,
                'required_points' => $hadiah->poin_dibutuhkan,
            ], 422);
        }

        // Deduct points
        $newPoints = $userPoints - $hadiah->poin_dibutuhkan;
        $user->update(['poin_reward' => $newPoints]);

        // Generate voucher code
        $prefix = match ($hadiah->kategori_id) {
            1 => 'ECO-PULSA',
            2 => 'ECO-PLN',
            3 => 'ECO-BELANJA',
            4 => 'ECO-MERCH',
            default => 'ECO-VOUCHER',
        };
        $code = $prefix.'-'.rand(10000, 99999);

        // Create redemption record
        $penukaran = PenukaranHadiah::create([
            'user_id' => $user->id,
            'hadiah_id' => $hadiah->id,
            'poin_digunakan' => $hadiah->poin_dibutuhkan,
            'status_pengiriman' => $hadiah->kategori_id === 4 ? 'diproses' : 'selesai',
            'no_resi' => $code,
            'alamat_pengiriman_snapshot' => $validated['alamat_pengiriman'] ?? null,
        ]);

        // Record in point ledger
        RiwayatPoin::create([
            'user_id' => $user->id,
            'jumlah_poin' => -$hadiah->poin_dibutuhkan,
            'jenis_transaksi' => 'debit',
            'referensi_tipe' => 'penukaran_hadiah',
            'referensi_id' => $penukaran->id,
            'keterangan' => 'Penukaran Hadiah: '.$hadiah->nama_hadiah,
        ]);

        return $this->sendResponse([
            'penukaran' => $penukaran,
            'hadiah' => $hadiah,
            'kode_voucher' => $code,
            'sisa_poin' => $newPoints,
            'tanggal_kedaluwarsa' => now()->addDays(30)->toISOString(),
        ], 'Hadiah berhasil ditukarkan!');
    }

    /**
     * Get user's redeemed rewards.
     */
    public function riwayatPenukaranHadiah(Request $request): JsonResponse
    {
        $userId = $request->user()?->id ?? $request->input('user_id') ?? 2;
        $list = PenukaranHadiah::where('user_id', $userId)
            ->with(['hadiah.kategori'])
            ->latest()
            ->get();

        return $this->sendResponse($list, 'Daftar penukaran hadiah berhasil diambil');
    }

    /**
     * Get user's point transaction ledger.
     */
    public function riwayatPoin(Request $request): JsonResponse
    {
        $userId = $request->user()?->id ?? $request->input('user_id') ?? 2;
        $list = RiwayatPoin::where('user_id', $userId)
            ->latest()
            ->get();

        return $this->sendResponse($list, 'Riwayat mutasi poin berhasil diambil');
    }

    /**
     * Store early warning hazard broadcast.
     */
    public function storePeringatanDini(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tipe_bahaya' => 'required|string|max:60',
            'level_peringatan' => 'required|string|in:WASPADA,SIAGA,AWAS',
            'radius_terdampak_meter' => 'required|integer|min:50|max:5000',
            'pesan_broadcast' => 'required|string|max:1000',
            'laporan_id' => 'nullable|integer|exists:laporan_sampah,id',
        ]);

        $laporanId = $validated['laporan_id']
            ?? LaporanSampah::where('is_resiko_banjir', true)->value('id')
            ?? LaporanSampah::value('id')
            ?? 1;

        $warning = PeringatanDini::create([
            'laporan_id' => $laporanId,
            'tipe_bahaya' => $validated['tipe_bahaya'],
            'level_peringatan' => $validated['level_peringatan'],
            'radius_terdampak_meter' => $validated['radius_terdampak_meter'],
            'pesan_broadcast' => $validated['pesan_broadcast'],
            'status_aktif' => true,
            'waktu_broadcast' => now(),
            'waktu_kedaluwarsa' => now()->addHours(6),
        ]);

        return $this->sendResponse($warning, 'Broadcast peringatan dini darurat berhasil dirilis!', 201);
    }

    /**
     * Resolve valid Pengepul User ID, auto-provisioning demo user if not yet in database.
     */
    protected function resolvePengepulId(?int $pengepulId, ?User $authUser): int
    {
        if ($pengepulId && User::where('id', $pengepulId)->exists()) {
            return $pengepulId;
        }

        if ($authUser) {
            return $authUser->id;
        }

        $user = User::where('email', 'pengepul@ecocitizen.id')->first()
            ?? User::where('role', 'pengepul')->first();

        if (! $user) {
            $user = User::create([
                'name' => 'Pak Slamet (Mitra Pengepul)',
                'email' => 'pengepul@ecocitizen.id',
                'password' => Hash::make('password'),
                'role' => 'pengepul',
                'poin_reward' => 350,
                'no_telepon' => '0813-3379-4278',
                'email_verified_at' => now(),
            ]);
        }

        return $user->id;
    }

    /**
     * Resolve valid Laporan ID, falling back to existing report if mock ID provided.
     */
    protected function resolveLaporanId(int $laporanId): int
    {
        if (LaporanSampah::where('id', $laporanId)->exists()) {
            return $laporanId;
        }

        return LaporanSampah::first()?->id ?? $laporanId;
    }

    /**
     * Start pickup mission by collector (Pengepul).
     */
    public function mulaiPenjemputan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'laporan_id' => 'required|integer',
            'pengepul_id' => 'nullable|integer',
            'catatan' => 'nullable|string',
        ]);

        $laporanId = $this->resolveLaporanId((int) $validated['laporan_id']);
        $pengepulId = $this->resolvePengepulId($validated['pengepul_id'] ?? null, $request->user());

        $penjemputan = $this->laporanService->mulaiPenjemputan(
            $laporanId,
            $pengepulId,
            $validated['catatan'] ?? null
        );

        return $this->sendResponse($penjemputan, 'Misi penjemputan berhasil dimulai. Status: OTW ke lokasi.');
    }

    /**
     * Complete pickup mission after clean photo verification and reward allocation.
     */
    public function selesaiPenjemputan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'laporan_id' => 'required|integer',
            'pengepul_id' => 'nullable|integer',
            'foto_bukti_bersih' => 'required|string',
            'timbangan_riil_kg' => 'nullable|numeric|min:0',
            'reward_poin' => 'nullable|integer|min:0',
            'catatan' => 'nullable|string',
        ]);

        $laporanId = $this->resolveLaporanId((int) $validated['laporan_id']);
        $pengepulId = $this->resolvePengepulId($validated['pengepul_id'] ?? null, $request->user());

        $result = $this->laporanService->selesaiPenjemputan(
            $laporanId,
            $pengepulId,
            $validated['foto_bukti_bersih'],
            isset($validated['timbangan_riil_kg']) ? (float) $validated['timbangan_riil_kg'] : null,
            (int) ($validated['reward_poin'] ?? 50),
            $validated['catatan'] ?? null
        );

        return $this->sendResponse($result, 'Pembersihan berhasil diselesaikan dan reward poin telah diberikan!');
    }

    /**
     * Update real-time GPS / route tracking coordinates of collector truck.
     */
    public function updateLokasi(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'laporan_id' => 'required|integer',
            'pengepul_id' => 'nullable|integer',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'heading' => 'nullable|numeric',
            'kecepatan_kmh' => 'nullable|numeric',
            'status_jemput' => 'nullable|string',
        ]);

        $laporanId = $this->resolveLaporanId((int) $validated['laporan_id']);
        $pengepulId = $this->resolvePengepulId($validated['pengepul_id'] ?? null, $request->user());

        $penjemputan = $this->laporanService->updateLokasiArmada(
            $laporanId,
            $pengepulId,
            (float) $validated['latitude'],
            (float) $validated['longitude'],
            (float) ($validated['heading'] ?? 0),
            (float) ($validated['kecepatan_kmh'] ?? 0),
            $validated['status_jemput'] ?? null
        );

        return $this->sendResponse($penjemputan, 'Posisi real-time armada berhasil diperbarui');
    }

    /**
     * Get all active armada trucks currently moving on missions.
     */
    public function armadaAktif(): JsonResponse
    {
        $armada = $this->laporanService->getActiveArmada();

        $data = $armada->map(function ($item) {
            $pengepulName = $item->pengepul?->name ?? 'Pak Joko (Mitra Pengepul)';
            // Use actual updated profile photo if set, otherwise fallback to friendly driver photo
            $avatarUrl = $item->pengepul?->foto_profil;
            if (! $avatarUrl) {
                $avatarUrl = ($item->pengepul_id % 2 === 0)
                    ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&auto=format&fit=crop&q=80';
            }

            return [
                'id' => $item->id,
                'laporan_id' => $item->laporan_id,
                'pengepul_id' => $item->pengepul_id,
                'pengepul_nama' => $pengepulName,
                'pengepul_foto' => $avatarUrl,
                'pengepul_telepon' => $item->pengepul?->no_telepon ?? '0813-3379-4278',
                'pengepul_rating' => (float) ($item->pengepul?->rating ?? 4.95),
                'pengepul_total_misi' => (int) ($item->pengepul?->total_ulasan ? ($item->pengepul->total_ulasan * 3) : (128 + ($item->pengepul_id * 3))),
                'pengepul_plat_nomor' => $item->pengepul?->plat_nomor ?? ('N ' . (8200 + ($item->pengepul_id * 13) % 900) . ' AB'),
                'pengepul_jenis_kendaraan' => $item->pengepul?->jenis_kendaraan ?? 'Truk Bak Hidrolik Mini DLH',
                'status_jemput' => $item->status_jemput,
                'latitude' => (float) $item->current_latitude,
                'longitude' => (float) $item->current_longitude,
                'heading' => (float) ($item->heading ?? 0),
                'kecepatan_kmh' => (float) ($item->kecepatan_kmh ?? 0),
                'waktu_update_lokasi' => $item->waktu_update_lokasi?->toISOString() ?? $item->updated_at?->toISOString(),
                'laporan' => [
                    'id' => $item->laporan?->id,
                    'alamat_lokasi' => $item->laporan?->alamat_lokasi,
                    'latitude' => (float) ($item->laporan?->latitude ?? 0),
                    'longitude' => (float) ($item->laporan?->longitude ?? 0),
                    'foto_url' => $item->laporan?->foto_url,
                ],
            ];
        });

        return $this->sendResponse($data, 'Daftar armada aktif berhasil diambil');
    }

    /**
     * Get list of all report IDs that currently have active pickup missions across all devices.
     */
    public function dispatchedIds(): JsonResponse
    {
        $ids = \App\Models\PenjemputanSampah::whereIn('status_jemput', ['menuju_lokasi', 'tahap_pengambilan', 'siaga_online'])
            ->pluck('laporan_id')
            ->filter()
            ->unique()
            ->values();

        return $this->sendResponse($ids, 'Daftar ID laporan aktif penjemputan berhasil diambil');
    }

    /**
     * Update Pengepul Online / Offline status in database.
     */
    public function updateStatusOnline(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pengepul_id' => 'nullable|integer',
            'is_online' => 'required|boolean',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'heading' => 'nullable|numeric',
            'kecepatan_kmh' => 'nullable|numeric',
        ]);

        $pengepulId = $this->resolvePengepulId($validated['pengepul_id'] ?? null, $request->user());
        $isOnline = (bool) $validated['is_online'];
        $latitude = (float) ($validated['latitude'] ?? -7.9826);
        $longitude = (float) ($validated['longitude'] ?? 112.6308);
        $heading = (float) ($validated['heading'] ?? 0);
        $kecepatanKmh = (float) ($validated['kecepatan_kmh'] ?? 0);

        $penjemputan = $this->laporanService->updateStatusOnlinePengepul(
            $pengepulId,
            $isOnline,
            $latitude,
            $longitude,
            $heading,
            $kecepatanKmh
        );

        return $this->sendResponse(
            $penjemputan,
            $isOnline ? 'Status armada berhasil diaktifkan (Online) di database' : 'Status armada berhasil dinonaktifkan (Offline) di database'
        );
    }

    /**
     * Cancel / close pickup mission.
     */
    public function batalPenjemputan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'laporan_id' => 'required|integer',
            'pengepul_id' => 'nullable|integer',
        ]);

        $laporanId = $this->resolveLaporanId((int) $validated['laporan_id']);
        $pengepulId = $this->resolvePengepulId($validated['pengepul_id'] ?? null, $request->user());
        $success = $this->laporanService->batalPenjemputan($laporanId, $pengepulId);

        return $this->sendResponse(['success' => $success], 'Misi penjemputan ditutup/dibatalkan');
    }

    /**
     * Get list of citizen responses / reviews for a report.
     */
    public function tanggapan(int $id): JsonResponse
    {
        $id = $this->resolveLaporanId($id);
        $tanggapan = $this->laporanService->getTanggapanByLaporanId($id);

        $data = $tanggapan->map(function ($t) {
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
        });

        return $this->sendResponse($data, 'Daftar ulasan warga berhasil diambil');
    }

    /**
     * Store a citizen review / response for a report.
     */
    public function storeTanggapan(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'tipe_tanggapan_id' => 'required|integer|exists:master_tipe_tanggapan,id',
            'komentar' => 'required|string|min:3|max:1000',
            'foto_bukti_tambahan_url' => 'nullable|string',
            'user_id' => 'nullable|integer',
        ]);

        $id = $this->resolveLaporanId($id);
        $userId = $request->user()?->id ?? ($validated['user_id'] ?? null);

        $tanggapan = $this->laporanService->addTanggapan($id, $validated, $userId);

        $data = [
            'id' => $tanggapan->id,
            'laporan_id' => $tanggapan->laporan_id,
            'user_id' => $tanggapan->user_id,
            'user' => $tanggapan->user ? [
                'id' => $tanggapan->user->id,
                'name' => $tanggapan->user->name,
                'email' => $tanggapan->user->email,
                'role' => $tanggapan->user->role,
                'poin' => (int) ($tanggapan->user->poin_reward ?? $tanggapan->user->poin ?? 0),
                'foto_profil' => $tanggapan->user->foto_profil ?? $tanggapan->user->avatar_url ?? null,
            ] : null,
            'tipe_tanggapan_id' => $tanggapan->tipe_tanggapan_id,
            'tipe_tanggapan' => $tanggapan->tipeTanggapan ? [
                'id' => $tanggapan->tipeTanggapan->id,
                'nama' => $tanggapan->tipeTanggapan->nama,
                'kode' => $tanggapan->tipeTanggapan->kode,
                'icon' => $tanggapan->tipeTanggapan->icon,
                'deskripsi' => $tanggapan->tipeTanggapan->deskripsi,
            ] : null,
            'komentar' => $tanggapan->komentar,
            'foto_bukti_url' => $tanggapan->foto_bukti_tambahan_url,
            'created_at' => $tanggapan->created_at?->toISOString(),
        ];

        return $this->sendResponse($data, 'Respon warga berhasil dikirim! Anda mendapatkan +10 Poin Reward.', 201);
    }

    /**
     * Get list of response types.
     */
    public function tipeTanggapan(): JsonResponse
    {
        $types = $this->laporanService->getTipeTanggapan();

        return $this->sendResponse($types, 'Daftar tipe tanggapan berhasil diambil');
    }
}

