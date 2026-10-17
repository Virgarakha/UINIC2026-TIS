<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\Laporan\StoreLaporanRequest;
use App\Http\Resources\V1\LaporanCollection;
use App\Http\Resources\V1\LaporanResource;
use App\Models\KatalogHadiah;
use App\Models\KategoriSampah;
use App\Models\PeringatanDini;
use App\Services\LaporanSampahService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
        $userId = $request->user()?->id;
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
        $warnings = PeringatanDini::where('status_aktif', true)->latest()->get();

        return $this->sendResponse($warnings, 'Daftar peringatan dini aktif berhasil diambil');
    }

    /**
     * Get list of rewards catalog.
     */
    public function katalogHadiah(): JsonResponse
    {
        $hadiah = KatalogHadiah::where('is_tersedia', true)->with('kategori')->get();

        return $this->sendResponse($hadiah, 'Daftar katalog hadiah berhasil diambil');
    }

    /**
     * Start pickup mission by collector (Pengepul).
     */
    public function mulaiPenjemputan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'laporan_id' => 'required|exists:laporan_sampah,id',
            'pengepul_id' => 'nullable|exists:users,id',
            'catatan' => 'nullable|string',
        ]);

        $pengepulId = $validated['pengepul_id'] ?? $request->user()?->id ?? 30;
        $penjemputan = $this->laporanService->mulaiPenjemputan(
            (int) $validated['laporan_id'],
            (int) $pengepulId,
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
            'laporan_id' => 'required|exists:laporan_sampah,id',
            'pengepul_id' => 'nullable|exists:users,id',
            'foto_bukti_bersih' => 'required|string',
            'timbangan_riil_kg' => 'nullable|numeric|min:0',
            'reward_poin' => 'nullable|integer|min:0',
            'catatan' => 'nullable|string',
        ]);

        $pengepulId = $validated['pengepul_id'] ?? $request->user()?->id ?? 30;
        $result = $this->laporanService->selesaiPenjemputan(
            (int) $validated['laporan_id'],
            (int) $pengepulId,
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
            'laporan_id' => 'required|exists:laporan_sampah,id',
            'pengepul_id' => 'nullable|exists:users,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'heading' => 'nullable|numeric',
            'kecepatan_kmh' => 'nullable|numeric',
            'status_jemput' => 'nullable|string',
        ]);

        $pengepulId = $validated['pengepul_id'] ?? $request->user()?->id ?? 30;
        $penjemputan = $this->laporanService->updateLokasiArmada(
            (int) $validated['laporan_id'],
            (int) $pengepulId,
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
                'pengepul_telepon' => $item->pengepul?->no_telepon ?? '0812-3456-7890',
                'pengepul_rating' => 4.9,
                'pengepul_total_misi' => 128 + ($item->pengepul_id * 3),
                'pengepul_plat_nomor' => 'N ' . (8200 + ($item->pengepul_id * 13) % 900) . ' AB',
                'pengepul_jenis_kendaraan' => 'Truk Bak Hidrolik Mini DLH',
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
     * Cancel / close pickup mission.
     */
    public function batalPenjemputan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'laporan_id' => 'required|exists:laporan_sampah,id',
            'pengepul_id' => 'nullable|exists:users,id',
        ]);

        $pengepulId = $validated['pengepul_id'] ?? $request->user()?->id ?? 30;
        $success = $this->laporanService->batalPenjemputan((int) $validated['laporan_id'], (int) $pengepulId);

        return $this->sendResponse(['success' => $success], 'Misi penjemputan ditutup/dibatalkan');
    }
}

